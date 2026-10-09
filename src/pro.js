// Pro membership via Apple In-App Purchase and Google Play Billing, managed by RevenueCat.
// Prices shown come from the stores, so each country automatically sees its local price and currency.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform, View, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Card, Txt, Btn, Icon, Grad, Row } from "./ui";
import { useTheme } from "./theme";
import { cancelTrialReminder } from "./notify";

let Purchases = null, ERR = {};
try { const m = require("react-native-purchases"); Purchases = m.default; ERR = m.PURCHASES_ERROR_CODE || {}; } catch (e) { Purchases = null; }

// Last known membership, so a paying member who opens the app offline isn't locked out.
// The store's answer always replaces it as soon as the app reaches RevenueCat.
const CACHE_KEY = "usrn.pro.v1";
const FIRST_OPEN_KEY = "usrn.firstOpen.v1";
// A second RevenueCat offering holding real, store-priced discounted products ("Special offer").
// Shown only to free users WIN_BACK_DAYS or more after they first opened the app.
export const SPECIAL_OFFERING = extra.specialOfferingId || "special_offer";
export const WIN_BACK_DAYS = 30;
const ANDROID_PACKAGE = "com.alexkorir.usrnpathway";

const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};
export const ENTITLEMENT = extra.entitlementId || "pro";
export const LINKS = { privacy: extra.privacyPolicyUrl, terms: extra.termsUrl, support: extra.supportEmail };

export const PRO_FEATURES = [
  ["Network", "NGN case study simulation", "All six clinical-judgment steps with full distractor rationales"],
  ["BellRing", "Automated expiry alerts", "Phone reminders 90 and 30 days before IELTS/PTE scores and licenses expire"],
  ["ArrowRightLeft", "Endorsement wizard", "Nursys transfer steps between states, e.g. NY → CA or TX"],
  ["LayoutGrid", "Charge nurse command center", "Acuity balancer, SBAR generator, clinical ladder dossier"],
  ["Receipt", "Overtime tax shield", "Overtime deduction, W-4 withholding and 403(b)/457(b)/HSA calculators"],
];
export const FREE_FEATURES = ["6-phase milestone roadmap", "State board comparison", "Monthly visa bulletin", "Diagnostic Baseline (Test 1)", "Question bank, lessons and guides"];

const ProCtx = createContext({ isPro: false, ready: false, packages: [], storeAvailable: false, membership: null });
export const usePro = () => useContext(ProCtx);

/** Pull the facts we show about a membership out of RevenueCat's CustomerInfo. */
function readMembership(info) {
  const ent = info && info.entitlements && info.entitlements.active && info.entitlements.active[ENTITLEMENT];
  if (!ent) return null;
  return {
    productId: ent.productIdentifier || "",
    expires: ent.expirationDate || null,            // null = lifetime
    willRenew: !!ent.willRenew,
    trial: ent.periodType === "TRIAL",
    lifetime: !ent.expirationDate,
    sandbox: !!ent.isSandbox,
    manageUrl: (info && info.managementURL) || null,
  };
}

export function ProProvider({ children }) {
  const [membership, setMembership] = useState(null);
  const [ready, setReady] = useState(false);
  const [packages, setPackages] = useState([]);
  const [specialPackages, setSpecialPackages] = useState([]);
  const [daysSinceInstall, setDays] = useState(0);
  const [devUnlock, setDevUnlock] = useState(false);
  const [storeAvailable, setStoreAvailable] = useState(false);
  const [error, setError] = useState("");

  const apply = (info) => {
    const m = readMembership(info);
    setMembership(m);
    // No "trial ends" reminder unless a trial is actually going to turn into a paid subscription.
    if (!m || !m.trial || !m.willRenew) cancelTrialReminder();
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(m)).catch(() => {});
  };

  const loadOfferings = useCallback(async () => {
    if (!Purchases) return;
    try {
      setError("");
      const offerings = await Purchases.getOfferings();
      const cur = offerings && offerings.current;
      setPackages(cur ? cur.availablePackages : []);
      const sp = offerings && offerings.all && offerings.all[SPECIAL_OFFERING];
      setSpecialPackages(sp ? sp.availablePackages : []);
      if (!cur || !cur.availablePackages.length) setError("No plans are available from the store right now.");
    } catch (e) { setError("Couldn't reach the store. Check your connection and try again."); }
  }, []);

  useEffect(() => {
    let remove = null;
    (async () => {
      try {
        let first = await AsyncStorage.getItem(FIRST_OPEN_KEY);
        if (!first) { first = new Date().toISOString(); AsyncStorage.setItem(FIRST_OPEN_KEY, first).catch(() => {}); }
        setDays(Math.floor((Date.now() - new Date(first).getTime()) / 86400000));
      } catch (e) {}
      // 1. Show the last known status straight away (offline-safe). Expired cached subscriptions don't count.
      try {
        const c = JSON.parse(await AsyncStorage.getItem(CACHE_KEY));
        if (c && (c.lifetime || (c.expires && new Date(c.expires) > new Date()))) setMembership(c);
      } catch (e) {}
      // 2. Ask the store.
      const key = Platform.OS === "ios" ? extra.revenueCatAppleKey : extra.revenueCatGoogleKey;
      if (!Purchases || !key || /REPLACE_ME/.test(key)) { setReady(true); return; }
      try {
        if (Purchases.setLogLevel && Purchases.LOG_LEVEL) Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.WARN);
        Purchases.configure({ apiKey: key });
        setStoreAvailable(true);
        const listener = (info) => apply(info);   // renewals, expiries, refunds, Ask to Buy approvals
        Purchases.addCustomerInfoUpdateListener(listener);
        remove = () => { try { Purchases.removeCustomerInfoUpdateListener(listener); } catch (e) {} };
        apply(await Purchases.getCustomerInfo());
      } catch (e) { setError("Couldn't reach the store. Check your connection and try again."); }
      await loadOfferings();
      setReady(true);
    })();
    return () => { if (remove) remove(); };
  }, []);

  const buy = useCallback(async (pkg) => {
    if (!Purchases || !storeAvailable) return { ok: false, message: "Purchases need the App Store or Google Play version of the app." };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      apply(customerInfo);
      const m = readMembership(customerInfo);
      return m ? { ok: true, membership: m } : { ok: false, message: "The store finished, but Pro didn't unlock yet. Tap Restore purchases in a moment." };
    } catch (e) {
      if (e && (e.userCancelled || e.code === ERR.PURCHASE_CANCELLED_ERROR)) return { ok: false, cancelled: true };
      if (e && e.code === ERR.PAYMENT_PENDING_ERROR) return { ok: false, pending: true, message: "Your purchase is waiting for approval (for example Ask to Buy or a pending payment). Pro unlocks automatically once it's approved." };
      if (e && e.code === ERR.PRODUCT_ALREADY_PURCHASED_ERROR) { const r = await restoreInner(); return r; }
      if (e && e.code === ERR.STORE_PROBLEM_ERROR) return { ok: false, message: "The store is having a problem. You haven't been charged. Please try again later." };
      if (e && e.code === ERR.PURCHASE_NOT_ALLOWED_ERROR) return { ok: false, message: "Purchases aren't allowed on this device or account (check Screen Time or parental settings)." };
      return { ok: false, message: "The purchase didn't go through. You haven't been charged. Please try again." };
    }
  }, [storeAvailable]);

  const restoreInner = async () => {
    const info = await Purchases.restorePurchases(); apply(info);
    const active = !!readMembership(info);
    return { ok: active, message: active ? "Your Pro membership is restored." : "We didn't find a Pro purchase on this " + (Platform.OS === "ios" ? "Apple ID." : "Google account.") };
  };
  const restore = useCallback(async () => {
    if (!Purchases || !storeAvailable) return { ok: false, message: "Restoring needs the App Store or Google Play version of the app." };
    try { return await restoreInner(); } catch (e) { return { ok: false, message: "Couldn't restore right now. Please try again." }; }
  }, [storeAvailable]);

  /** Apple's offer-code sheet / Google Play's redeem page. */
  const redeem = useCallback(async () => {
    try {
      if (Platform.OS === "ios" && Purchases && storeAvailable && Purchases.presentCodeRedemptionSheet) { await Purchases.presentCodeRedemptionSheet(); return; }
    } catch (e) {}
    Linking.openURL(Platform.OS === "ios" ? "https://apps.apple.com/redeem" : "https://play.google.com/redeem").catch(() => {});
  }, [storeAvailable]);

  /** Opens the store's own subscription management (cancel, change plan). */
  const manage = useCallback(async () => {
    try {
      if (Platform.OS === "ios" && Purchases && storeAvailable && Purchases.showManageSubscriptions) { await Purchases.showManageSubscriptions(); return; }
    } catch (e) {}
    const url = (membership && membership.manageUrl) ||
      (Platform.OS === "ios" ? "https://apps.apple.com/account/subscriptions" : `https://play.google.com/store/account/subscriptions?package=${ANDROID_PACKAGE}`);
    Linking.openURL(url).catch(() => {});
  }, [membership, storeAvailable]);

  const isPro = !!membership || (__DEV__ && devUnlock);
  const winBack = !isPro && daysSinceInstall >= WIN_BACK_DAYS && specialPackages.length > 0;
  const value = { isPro, membership, ready, packages, specialPackages, winBack, daysSinceInstall, buy, restore, manage, redeem, reload: loadOfferings, storeAvailable, error, devUnlock, setDevUnlock };
  return <ProCtx.Provider value={value}>{children}</ProCtx.Provider>;
}

/** Wraps a Pro-only tool. Non-members see a teaser card with the local store price. */
export function ProGate({ feature, desc, mod, children }) {
  const { isPro, packages, ready } = usePro(); const t = useTheme(mod);
  if (isPro) return children;
  if (!ready) return null;
  const monthly = packages.find((p) => p.packageType === "MONTHLY") || packages[0];
  return (
    <Card mod={mod} style={{ alignItems: "center", paddingVertical: 24, gap: 10 }}>
      <Grad mod="home" colors={["#f59e0b", "#db2777"]} style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" }}><Icon name="Lock" size={24} color="#fff" /></Grad>
      <Txt v="eyebrow">Pro feature</Txt>
      <Txt v="h2" style={{ textAlign: "center" }}>{feature}</Txt>
      {desc ? <Txt v="small" muted style={{ textAlign: "center", maxWidth: 320 }}>{desc}</Txt> : null}
      {monthly ? <Txt v="small" muted>From <Txt v="smallB">{monthly.product.priceString}</Txt> a month</Txt> : null}
      <Btn title="See Pro" icon="Crown" mod={mod} onPress={() => router.push("/paywall")} />
    </Card>
  );
}

export function ProBadge() {
  return (
    <Row gap={4} style={{ backgroundColor: "#f59e0b", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, alignSelf: "flex-start" }}>
      <Icon name="Crown" size={11} color="#1a1204" /><Txt v="eyebrow" color="#1a1204">Pro</Txt>
    </Row>
  );
}
