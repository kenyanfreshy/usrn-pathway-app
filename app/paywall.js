// Pro paywall — hero showcase on top, purchase sheet below (one plan, one button; other plans one tap away).
//
// Prices, currencies, the 2-week free trial and the special offer all come from Apple / Google for the shopper's
// own country (set them in App Store Connect / Play Console — see PRICING.md).
// Store rules this screen covers (App Store 3.1.1 / 3.1.2, Google Play Payments + Subscriptions policy):
//  • the amount that will be billed and how often is the most prominent price text
//  • a trial is only promised to people the store says are eligible, together with what it costs afterwards
//  • the "Special offer" is a real, cheaper store product; the crossed-out price is the real regular price of the
//    same plan, and the % saved is calculated from the two store prices — no invented discounts or fake timers
//  • auto-renewal terms, how to cancel, Restore Purchases, Terms of Use (EULA) and Privacy Policy
//  • members can open the store's own "Manage subscription" page; offer codes via the store's own redeem sheet
import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, Linking, Platform, ActivityIndicator, ScrollView, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Txt, Btn, Icon, Row, Note, tap, buzz } from "../src/ui";
import { useTheme } from "../src/theme";
import { usePro, FREE_FEATURES, LINKS } from "../src/pro";
import { scheduleTrialReminder } from "../src/notify";
import { fmtDate } from "../src/util";

let RC = {};
try { RC = require("react-native-purchases"); } catch (e) { RC = {}; }

const PERIOD = { MONTHLY: "month", ANNUAL: "year", WEEKLY: "week", SIX_MONTH: "6 months", THREE_MONTH: "3 months", TWO_MONTH: "2 months", LIFETIME: null };
const UNIT = { DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year" };
const STORE = Platform.OS === "ios" ? "Apple ID" : "Google Play account";
const MANAGE_WHERE = Platform.OS === "ios" ? "Settings → your name → Subscriptions" : "Google Play → Payments & subscriptions → Subscriptions";
const NAVY = "#0B0F19", INDIGO = "#1E1B4B";

const SLIDES = [
  { icon: "Network", title: "Practise the NGN case study like test day", sub: "All six clinical-judgment steps, with a rationale for every option.", colors: ["#06B6D4", "#0F9F8F"] },
  { icon: "BellRing", title: "Never let an IELTS, PTE or license expire", sub: "Phone reminders 90 and 30 days before each expiry date.", colors: ["#F59E0B", "#F43F5E"] },
  { icon: "ArrowRightLeft", title: "Move your license between states", sub: "Step-by-step Nursys endorsement, e.g. NY → CA or TX.", colors: ["#6366F1", "#06B6D4"] },
  { icon: "LayoutGrid", title: "Lead your unit as charge nurse", sub: "Acuity balancer, SBAR call scripts and a clinical ladder log.", colors: ["#F43F5E", "#8B5CF6"] },
  { icon: "Receipt", title: "Keep more of your overtime pay", sub: "Overtime, W-4 and 403(b)/457(b)/HSA calculators.", colors: ["#10B981", "#0EA5E9"] },
];

function trialLength(intro) {
  const n = intro.periodNumberOfUnits || 1; const u = UNIT[intro.periodUnit] || "day";
  if (u === "day" && n % 7 === 0) return `${n / 7} week${n / 7 > 1 ? "s" : ""}`;
  return `${n} ${u}${n > 1 ? "s" : ""}`;
}
const isoDay = (s) => (s ? String(s).slice(0, 10) : "");

/** The free trial the store will actually give this shopper for a package, or null. */
function useTrials(packages) {
  const [eligible, setEligible] = useState({});
  const ids = packages.map((p) => p.identifier).join("|");
  useEffect(() => {
    const subs = packages.filter((p) => p.packageType !== "LIFETIME" && p.product && p.product.introPrice);
    if (!subs.length) return;
    // Google Play only returns offers the account qualifies for. On iOS, Apple gives one trial per
    // subscription group per Apple ID, so we ask before promising one.
    if (Platform.OS !== "ios" || !RC.default || !RC.default.checkTrialOrIntroductoryPriceEligibility) {
      setEligible(Object.fromEntries(subs.map((p) => [p.product.identifier, true]))); return;
    }
    const ELIGIBLE = (RC.INTRO_ELIGIBILITY_STATUS && RC.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) ?? 2;
    RC.default.checkTrialOrIntroductoryPriceEligibility(subs.map((p) => p.product.identifier))
      .then((res) => setEligible(Object.fromEntries(subs.map((p) => [p.product.identifier, !!(res && res[p.product.identifier] && res[p.product.identifier].status === ELIGIBLE)]))))
      .catch(() => setEligible({}));
  }, [ids]);
  return (pkg) => {
    const intro = pkg && pkg.product && pkg.product.introPrice;
    if (!intro || pkg.packageType === "LIFETIME" || !eligible[pkg.product.identifier]) return null;
    return { free: !intro.price, length: trialLength(intro), priceString: intro.priceString };
  };
}

/* ---------------- hero showcase ---------------- */
function Hero({ height, onClose }) {
  const { width } = useWindowDimensions(); const ins = useSafeAreaInsets();
  const [i, setI] = useState(0); const ref = useRef(null); const touched = useRef(false);
  useEffect(() => {
    const id = setInterval(() => {
      if (touched.current) return;
      setI((n) => { const next = (n + 1) % SLIDES.length; ref.current && ref.current.scrollTo({ x: next * width, animated: true }); return next; });
    }, 4500);
    return () => clearInterval(id);
  }, [width]);
  return (
    <View style={{ height }}>
      <LinearGradient colors={[NAVY, INDIGO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <View style={{ position: "absolute", width: 280, height: 280, borderRadius: 140, left: -90, top: -60, backgroundColor: "rgba(99,102,241,0.35)" }} />
      <View style={{ position: "absolute", width: 240, height: 240, borderRadius: 120, right: -80, bottom: 40, backgroundColor: "rgba(6,182,212,0.22)" }} />
      <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => { touched.current = true; }}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}>
        {SLIDES.map((s) => (
          <View key={s.title} style={{ width, height, paddingTop: ins.top + 56, paddingHorizontal: 28, paddingBottom: 48, alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 168, height: 168, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-6deg" }] }}>
                <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ width: 112, height: 112, borderRadius: 34, alignItems: "center", justifyContent: "center", transform: [{ rotate: "6deg" }], shadowColor: s.colors[1], shadowOpacity: 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 }}>
                  <Icon name={s.icon} size={52} color="#fff" />
                </LinearGradient>
              </View>
            </View>
            <Txt v="h1" color="#fff" style={{ textAlign: "center" }}>{s.title}</Txt>
            <Txt v="body" color="rgba(255,255,255,0.86)" style={{ textAlign: "center", maxWidth: 340 }}>{s.sub}</Txt>
          </View>
        ))}
      </ScrollView>
      <Row gap={6} style={{ position: "absolute", bottom: 22, alignSelf: "center" }}>
        {SLIDES.map((s, n) => <View key={s.title} style={{ width: n === i ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: n === i ? "#fff" : "rgba(255,255,255,0.4)" }} />)}
      </Row>
      <Pressable onPress={() => { tap(); onClose(); }} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}
        style={{ position: "absolute", top: ins.top + 8, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }}>
        <Icon name="X" size={20} color={NAVY} />
      </Pressable>
    </View>
  );
}

/* ---------------- plan rows (View all plans) ---------------- */
function PlanRow({ pkg, trial, selected, onPress }) {
  const t = useTheme("home");
  const per = PERIOD[pkg.packageType]; const lifetime = pkg.packageType === "LIFETIME";
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: selected }}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: selected ? 2 : 1, borderColor: selected ? t.tint : t.c.line, backgroundColor: selected ? t.soft : t.c.surface }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? t.tint : t.c.line, alignItems: "center", justifyContent: "center" }}>
        {selected ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.tint }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="bodyB">{lifetime ? "All-access pass" : per === "year" ? "Pro yearly" : per === "month" ? "Pro monthly" : "Pro"}</Txt>
        <Txt v="small" muted>{lifetime ? "One payment · no renewal" : trial ? `${trial.length} free, then auto-renews` : "Auto-renews · cancel anytime"}</Txt>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Txt v="bodyB">{pkg.product.priceString}</Txt>
        <Txt v="tiny" muted>{lifetime ? "once" : `per ${per}`}</Txt>
      </View>
    </Pressable>
  );
}

/* ---------------- price line under the logo ---------------- */
function PriceLine({ pkg, trial, regular }) {
  const t = useTheme("home");
  const per = PERIOD[pkg.packageType]; const lifetime = pkg.packageType === "LIFETIME";
  const equiv = pkg.packageType === "ANNUAL" && pkg.product.pricePerMonthString ? `(equivalent to ${pkg.product.pricePerMonthString}/month)` : null;
  const billed = lifetime ? `${pkg.product.priceString} one time` : `${pkg.product.priceString}/${per}`;
  return (
    <View style={{ alignItems: "center", gap: 3 }}>
      <Row gap={6} style={{ flexWrap: "wrap", justifyContent: "center" }}>
        {trial ? <Txt v="body">{trial.free ? `${trial.length} free, then` : `${trial.priceString} for ${trial.length}, then`}</Txt> : null}
        {regular ? <Txt v="body" muted style={{ textDecorationLine: "line-through" }} accessibilityLabel={`regular price ${regular.product.priceString}`}>{regular.product.priceString}</Txt> : null}
        <View style={regular ? { backgroundColor: "#FDE68A", paddingHorizontal: 6, borderRadius: 6 } : null}>
          <Txt v="bodyB" color={regular ? "#1a1204" : t.c.ink}>{billed}</Txt>
        </View>
      </Row>
      {equiv ? <Txt v="small" muted>{equiv}</Txt> : null}
    </View>
  );
}

function MemberSheet() {
  const t = useTheme("home"); const { membership, manage, packages } = usePro();
  if (!membership) return <Txt v="body" style={{ textAlign: "center" }}>Every Pro tool is unlocked. Thank you for supporting USRN Pathway.</Txt>;
  const pkg = packages.find((p) => p.product && p.product.identifier === membership.productId);
  const price = pkg ? `${pkg.product.priceString}${PERIOD[pkg.packageType] ? " per " + PERIOD[pkg.packageType] : ""}` : null;
  let line;
  if (membership.lifetime) line = "All-access pass · yours for good, no renewals.";
  else if (membership.trial && membership.willRenew) line = `Free trial until ${fmtDate(isoDay(membership.expires))}. Then it renews${price ? " at " + price : ""} unless you cancel at least 24 hours before.`;
  else if (membership.trial) line = `Free trial until ${fmtDate(isoDay(membership.expires))}. You've cancelled, so you won't be charged.`;
  else if (membership.willRenew) line = `Renews on ${fmtDate(isoDay(membership.expires))}${price ? " at " + price : ""}.`;
  else line = `Cancelled · Pro stays on until ${fmtDate(isoDay(membership.expires))}.`;
  return (
    <View style={{ gap: 12 }}>
      <Row gap={8} style={{ justifyContent: "center" }}><Icon name="BadgeCheck" size={18} color={t.c.ok} /><Txt v="bodyB">You're a Pro member</Txt></Row>
      <Txt v="body" style={{ textAlign: "center" }}>{line}</Txt>
      {!membership.lifetime ? <Btn kind="secondary" icon="ExternalLink" title="Manage subscription" onPress={manage} /> : null}
    </View>
  );
}

/* ---------------- screen ---------------- */
export default function Paywall() {
  const t = useTheme("home"); const ins = useSafeAreaInsets(); const { height } = useWindowDimensions();
  const { isPro, packages, specialPackages, winBack, buy, restore, redeem, reload, storeAvailable, ready, error, devUnlock, setDevUnlock } = usePro();
  const trialFor = useTrials([...packages, ...specialPackages]);
  const [sel, setSel] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Win-back: free users 30+ days after install see the store's special-offer products instead of the regular ones.
  const list = (winBack ? specialPackages : packages).slice().sort((a, b) => (a.packageType === "LIFETIME") - (b.packageType === "LIFETIME"));
  const chosen = list.find((p) => p.identifier === sel) || list[0];
  const subscription = chosen && chosen.packageType !== "LIFETIME";
  const trial = chosen ? trialFor(chosen) : null;
  const per = chosen ? PERIOD[chosen.packageType] : null;
  const regular = winBack && chosen ? packages.find((p) => p.packageType === chosen.packageType) : null;
  const save = regular && regular.product.price > chosen.product.price ? Math.round((1 - chosen.product.price / regular.product.price) * 100) : 0;
  const showRegular = save > 0 ? regular : null;

  const close = () => { if (router.canGoBack()) router.back(); else router.replace("/"); };
  const purchase = async () => {
    if (!chosen || busy) return; setBusy(true); setMsg("");
    const r = await buy(chosen); setBusy(false);
    if (r.ok) {
      buzz();
      if (trial) {
        const end = (r.membership && r.membership.expires) || new Date(Date.now() + 14 * 86400000).toISOString();
        scheduleTrialReminder(end, `${chosen.product.priceString} per ${per}`);
        setMsg(`Your ${trial.length} free trial has started. Every Pro tool is unlocked. We'll remind you 2 days before it ends.`);
      } else setMsg("Welcome to Pro! Every Pro tool is now unlocked.");
    } else if (!r.cancelled) setMsg(r.message);
  };
  const doRestore = async () => { setBusy(true); setMsg(""); const r = await restore(); setBusy(false); setMsg(r.message); };
  const open = (url) => { if (url && !/REPLACE_ME/.test(url)) Linking.openURL(url).catch(() => {}); };

  const cta = !chosen ? "" : busy ? "PLEASE WAIT…"
    : trial ? (trial.free ? `START MY ${trial.length.toUpperCase()} FREE TRIAL` : `START FOR ${trial.priceString}`)
    : subscription ? "SUBSCRIBE NOW" : "BUY ALL-ACCESS PASS";

  return (
    <View style={{ flex: 1, backgroundColor: NAVY }}>
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Hero height={Math.max(360, Math.round(height * 0.5))} onClose={close} />

        <View style={{ flexGrow: 1, marginTop: -28, backgroundColor: t.c.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 20, paddingBottom: ins.bottom + 20, gap: 14 }}>
          {winBack && !isPro && chosen ? (
            <View style={{ alignSelf: "center", marginTop: -40, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FDE68A", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
              <Icon name="Sparkles" size={14} color="#1a1204" />
              <Txt v="smallB" color="#1a1204">{save > 0 ? `Special offer — Save ${save}%` : "Special offer"}</Txt>
            </View>
          ) : null}

          <Row gap={4} style={{ justifyContent: "center", alignItems: "baseline" }}>
            <Txt v="h1">USRN Pathway</Txt>
            <Txt v="h1" color="#F43F5E">Pro</Txt>
          </Row>

          {isPro ? <MemberSheet /> : !ready ? <ActivityIndicator color={t.tint} /> : !chosen ? (
            <View style={{ gap: 10 }}>
              <Note tone="warn" icon="Store" title={storeAvailable ? "Plans didn't load" : "Store not connected"}>
                {storeAvailable ? (error || "We couldn't load plans from the store.") + " Check your connection and try again."
                  : "Purchases work in the App Store and Google Play builds of the app. Add your RevenueCat keys in app.json to test them."}
              </Note>
              {storeAvailable ? <Btn kind="secondary" icon="RefreshCw" title="Try again" onPress={reload} /> : null}
            </View>
          ) : (
            <>
              <PriceLine pkg={chosen} trial={trial} regular={showRegular} />

              <Pressable onPress={purchase} disabled={busy} accessibilityRole="button" accessibilityLabel={cta}
                style={({ pressed }) => ({ minHeight: 54, borderRadius: 27, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center", opacity: busy ? 0.6 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                <Txt v="bodyB" color="#1a1204" style={{ letterSpacing: 0.6 }}>{cta}</Txt>
              </Pressable>

              <Row style={{ justifyContent: "space-between" }}>
                <Pressable onPress={() => { tap(); redeem(); }} accessibilityRole="button" hitSlop={10}><Txt v="smallB" style={{ textDecorationLine: "underline" }}>REDEEM CODE</Txt></Pressable>
                <Pressable onPress={() => { tap(); setShowAll(!showAll); }} accessibilityRole="button" accessibilityState={{ expanded: showAll }} hitSlop={10}>
                  <Txt v="smallB" style={{ textDecorationLine: "underline" }}>{showAll ? "HIDE PLANS" : "VIEW ALL PLANS"}</Txt>
                </Pressable>
              </Row>

              {showAll ? (
                <View style={{ gap: 8 }} accessibilityRole="radiogroup">
                  {list.map((p) => <PlanRow key={p.identifier} pkg={p} trial={trialFor(p)} selected={chosen.identifier === p.identifier} onPress={() => setSel(p.identifier)} />)}
                </View>
              ) : null}

              <Txt v="tiny" muted style={{ textAlign: "center" }}>
                {subscription
                  ? (trial
                      ? `${trial.free ? "Free" : trial.priceString} for ${trial.length}, then ${chosen.product.priceString} per ${per}, charged to your ${STORE} when the trial ends. `
                      : `${chosen.product.priceString} per ${per}, charged to your ${STORE} when you confirm. `)
                    + `Renews automatically each ${per} unless cancelled at least 24 hours before the period ends. Cancel any time in ${MANAGE_WHERE}.`
                  : `One-time payment of ${chosen.product.priceString}, charged to your ${STORE}. No subscription, no renewals.`}
              </Txt>
            </>
          )}

          {msg ? <Note tone={isPro ? "ok" : "acc"} icon={isPro ? "PartyPopper" : "Info"}>{msg}</Note> : null}

          <Row style={{ justifyContent: "space-between", paddingTop: 4 }}>
            <Pressable onPress={() => open(LINKS.terms)} accessibilityRole="link" hitSlop={10}><Txt v="tiny" muted>Terms of Use</Txt></Pressable>
            <Pressable onPress={doRestore} disabled={busy} accessibilityRole="button" hitSlop={10}><Txt v="tiny" muted>Restore Purchase</Txt></Pressable>
            <Pressable onPress={() => open(LINKS.privacy)} accessibilityRole="link" hitSlop={10}><Txt v="tiny" muted>Privacy Policy</Txt></Pressable>
          </Row>

          {!isPro ? (
            <View style={{ gap: 6, padding: 14, borderRadius: 16, backgroundColor: t.c.sunk }}>
              <Txt v="smallB">Always free</Txt>
              {FREE_FEATURES.map((f) => <Row key={f} gap={8}><Icon name="Check" size={14} color={t.c.ok} /><Txt v="small" style={{ flex: 1 }}>{f}</Txt></Row>)}
            </View>
          ) : null}

          {__DEV__ ? (
            <View style={{ gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: t.c.line }}>
              <Txt v="eyebrow">Developer only (not in store builds)</Txt>
              {/REPLACE_ME/.test(String(LINKS.privacy)) ? <Txt v="tiny" muted>Privacy Policy link is still a placeholder in app.json — Apple rejects paywalls without a working one.</Txt> : null}
              <Btn small kind="secondary" icon="FlaskConical" title={devUnlock ? "Lock Pro again" : "Unlock Pro for testing"} onPress={() => setDevUnlock(!devUnlock)} />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
