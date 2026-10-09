// Pro membership via Apple In-App Purchase and Google Play Billing, managed by RevenueCat.
// Prices shown come from the stores, so each country automatically sees its local price and currency.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform, View } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Card, Txt, Btn, Icon, Grad, Row } from "./ui";
import { useTheme } from "./theme";

let Purchases = null;
try { Purchases = require("react-native-purchases").default; } catch (e) { Purchases = null; }

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

const ProCtx = createContext({ isPro: false, ready: false, packages: [], storeAvailable: false });
export const usePro = () => useContext(ProCtx);

export function ProProvider({ children }) {
  const [isPro, setIsPro] = useState(false);
  const [ready, setReady] = useState(false);
  const [packages, setPackages] = useState([]);
  const [devUnlock, setDevUnlock] = useState(false);
  const [storeAvailable, setStoreAvailable] = useState(false);
  const [error, setError] = useState("");

  const apply = (info) => setIsPro(!!(info && info.entitlements && info.entitlements.active && info.entitlements.active[ENTITLEMENT]));

  useEffect(() => {
    let remove = null;
    (async () => {
      const key = Platform.OS === "ios" ? extra.revenueCatAppleKey : extra.revenueCatGoogleKey;
      if (!Purchases || !key || /REPLACE_ME/.test(key)) { setReady(true); return; }
      try {
        if (Purchases.setLogLevel && Purchases.LOG_LEVEL) Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
        Purchases.configure({ apiKey: key });
        setStoreAvailable(true);
        apply(await Purchases.getCustomerInfo());
        const listener = (info) => apply(info);
        Purchases.addCustomerInfoUpdateListener(listener);
        remove = () => { try { Purchases.removeCustomerInfoUpdateListener(listener); } catch (e) {} };
        const offerings = await Purchases.getOfferings();
        const cur = offerings && offerings.current;
        setPackages(cur ? cur.availablePackages : []);
      } catch (e) { setError("Couldn't reach the store. Check your connection and try again."); }
      setReady(true);
    })();
    return () => { if (remove) remove(); };
  }, []);

  const buy = useCallback(async (pkg) => {
    if (!Purchases || !storeAvailable) return { ok: false, message: "Purchases need the App Store or Google Play version of the app." };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      apply(customerInfo);
      return { ok: true };
    } catch (e) {
      if (e && e.userCancelled) return { ok: false, cancelled: true };
      return { ok: false, message: "The purchase didn't go through. You haven't been charged. Please try again." };
    }
  }, [storeAvailable]);

  const restore = useCallback(async () => {
    if (!Purchases || !storeAvailable) return { ok: false, message: "Restoring needs the App Store or Google Play version of the app." };
    try {
      const info = await Purchases.restorePurchases(); apply(info);
      const active = !!(info.entitlements.active && info.entitlements.active[ENTITLEMENT]);
      return { ok: active, message: active ? "Your Pro membership is restored." : "We didn't find a Pro purchase on this account." };
    } catch (e) { return { ok: false, message: "Couldn't restore right now. Please try again." }; }
  }, [storeAvailable]);

  const value = { isPro: isPro || (__DEV__ && devUnlock), ready, packages, buy, restore, storeAvailable, error, devUnlock, setDevUnlock };
  return <ProCtx.Provider value={value}>{children}</ProCtx.Provider>;
}

/** Wraps a Pro-only tool. Non-members see a teaser card with the local store price. */
export function ProGate({ feature, desc, mod, children }) {
  const { isPro, packages } = usePro(); const t = useTheme(mod);
  if (isPro) return children;
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
