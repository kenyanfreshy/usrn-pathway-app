// Pro paywall: app icon, rotating feature headline, plan cards (yearly / monthly / one-time / free),
// a feature list you can expand, one main button, Restore Purchases, renewal terms, Manage Subscription,
// disclaimer, and Privacy · Terms. The layout follows the paywall Alex shipped in an earlier App Store app.
//
// Prices, currencies, the free trial and the special offer all come from Apple or Google for the shopper's own
// country (set them up in App Store Connect and Play Console; see PRICING.md). Nothing here is a hard-coded price.
// Store rules (App Store 3.1.1 / 3.1.2, Google Play Payments and Subscriptions):
//  • the amount billed and how often it's billed is the most prominent price text
//  • a trial is only promised to people the store says can get one, and always says what it costs afterwards
//  • "Save %" figures are worked out from real store prices; the special offer is a real, cheaper store product
//  • auto-renewal terms, Restore Purchases, Manage Subscription, Privacy Policy and Terms of Use (EULA) are all here
//  • a free plan is shown, so it's clear the core app works without paying
import React, { useEffect, useState } from "react";
import { View, Pressable, Linking, Platform, ScrollView, Image, Animated, Easing, AccessibilityInfo, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop, Rect, RadialGradient, Ellipse } from "react-native-svg";
import { Txt, Icon, Row, tap, buzz } from "../src/ui";
import { usePro, PRO_FEATURES, LINKS } from "../src/pro";
import { scheduleTrialReminder } from "../src/notify";
import { fmtDate } from "../src/util";

let RC = {};
try { RC = require("react-native-purchases"); } catch (e) { RC = {}; }

/* NurseBound palette (from the app icon) */
const C = {
  bg: "#0B0F19", bg2: "#141238", card: "rgba(255,255,255,0.045)", cardOn: "rgba(6,182,212,0.12)",
  line: "rgba(255,255,255,0.12)", ink: "#F1F5F9", muted: "#A9B4C8", faint: "#7C879C",
  cyan: "#22D3EE", cyanDeep: "#06B6D4", teal: "#14B8A6", gold: "#FBBF24", coral: "#FB7185", navyInk: "#04131A",
};
const SANS = Platform.select({ ios: "System", default: undefined });

// Marquee at the top: only things that are really gated behind Pro (titles come from PRO_FEATURES in src/pro.js).
const SHORT_NAMES = { "Personal Study Plan & Smart Review": "Study Plan & Smart Review", "Automated Expiration Alerts": "Expiration Alerts", "Charge Nurse Command Center": "Charge Nurse Tools", "Overtime Tax Shield (U.S.)": "Overtime Tax Tools (U.S.)" };
const MARQUEE = PRO_FEATURES.map(([ic, title]) => [ic, SHORT_NAMES[title] || title]);
const PERIOD = { MONTHLY: "month", ANNUAL: "year", WEEKLY: "week", SIX_MONTH: "6 months", THREE_MONTH: "3 months", TWO_MONTH: "2 months", LIFETIME: null };
const SHORT = { MONTHLY: "/mo", ANNUAL: "/yr", WEEKLY: "/wk", SIX_MONTH: "/6 mo", THREE_MONTH: "/3 mo", TWO_MONTH: "/2 mo" };
const UNIT = { DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year" };
const ORDER = { ANNUAL: 0, MONTHLY: 1, SIX_MONTH: 2, THREE_MONTH: 3, TWO_MONTH: 4, WEEKLY: 5, LIFETIME: 9 };
const STORE_SETTINGS = Platform.OS === "ios" ? "App Store account settings" : "Google Play subscriptions";
const ACCOUNT = Platform.OS === "ios" ? "Apple ID" : "Google Play account";
const FREE_ID = "__free__";

/** "2-week" (for buttons) and "2 weeks" (for sentences) from a store intro offer. */
function trialLength(intro) {
  let n = intro.periodNumberOfUnits || 1; let u = UNIT[intro.periodUnit] || "day";
  if (u === "day" && n % 7 === 0) { n = n / 7; u = "week"; }
  return { adj: `${n}-${u}`, words: `${n} ${u}${n > 1 ? "s" : ""}` };
}
const isoDay = (s) => (s ? String(s).slice(0, 10) : "");

/** Free trial the store will actually give this shopper for a package, or null. */
function useTrials(packages) {
  const [eligible, setEligible] = useState({});
  const ids = packages.map((p) => p.identifier).join("|");
  useEffect(() => {
    const subs = packages.filter((p) => p.packageType !== "LIFETIME" && p.product && p.product.introPrice);
    if (!subs.length) return;
    if (Platform.OS !== "ios" || !RC.default || !RC.default.checkTrialOrIntroductoryPriceEligibility) {
      setEligible(Object.fromEntries(subs.map((p) => [p.product.identifier, true]))); return;   // Play only returns eligible offers
    }
    const ELIGIBLE = (RC.INTRO_ELIGIBILITY_STATUS && RC.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) ?? 2;
    RC.default.checkTrialOrIntroductoryPriceEligibility(subs.map((p) => p.product.identifier))
      .then((res) => setEligible(Object.fromEntries(subs.map((p) => [p.product.identifier, !!(res && res[p.product.identifier] && res[p.product.identifier].status === ELIGIBLE)]))))
      .catch(() => setEligible({}));
  }, [ids]);
  return (pkg) => {
    const intro = pkg && pkg.product && pkg.product.introPrice;
    if (!intro || pkg.packageType === "LIFETIME" || !eligible[pkg.product.identifier]) return null;
    const L = trialLength(intro);
    return { free: !intro.price, length: L.adj, words: L.words, priceString: intro.priceString };
  };
}

/* ---------- background: navy gradient with a faint heartbeat trace ---------- */
function Backdrop() {
  const { width, height } = useWindowDimensions();
  const y = height * 0.52, w = width;
  const ecg = `M0 ${y} L${w * 0.22} ${y} L${w * 0.27} ${y - 18} L${w * 0.31} ${y + 10} L${w * 0.36} ${y} L${w * 0.5} ${y} L${w * 0.54} ${y - 26} L${w * 0.58} ${y - 210} L${w * 0.62} ${y + 60} L${w * 0.66} ${y} L${w * 0.78} ${y} L${w * 0.81} ${y - 30} L${w * 0.85} ${y} L${w} ${y}`;
  return (
    <Svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <SvgGrad id="pwbg" x1="0" y1="0" x2="0.6" y2="1"><Stop offset="0" stopColor={C.bg} /><Stop offset="1" stopColor={C.bg2} /></SvgGrad>
        <RadialGradient id="pwglow" cx="0.5" cy="0.12" r="0.6"><Stop offset="0" stopColor="#6366F1" stopOpacity="0.32" /><Stop offset="1" stopColor="#6366F1" stopOpacity="0" /></RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill="url(#pwbg)" />
      <Ellipse cx={width / 2} cy={height * 0.12} rx={width * 0.9} ry={height * 0.3} fill="url(#pwglow)" />
      <Path d={ecg} stroke={C.cyan} strokeOpacity={0.13} strokeWidth={2} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

/* ---------- pieces ---------- */
function Radio({ on }) {
  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? C.cyan : "rgba(255,255,255,0.28)", alignItems: "center", justifyContent: "center" }}>
      {on ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.cyan }} /> : null}
    </View>
  );
}

function Badge({ text, color = C.cyan }) {
  return (
    <View style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: color, backgroundColor: "rgba(6,182,212,0.12)", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Txt v="eyebrow" color={color} style={{ letterSpacing: 2 }}>{text}</Txt>
    </View>
  );
}

function PlanCard({ label, badge, price, unit, strike, lines, saveText, on, onPress, wide }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: on }}
      accessibilityLabel={[label, strike ? `regular price ${strike}` : null, price + (unit || ""), ...(lines || []), saveText].filter(Boolean).join(", ")}
      style={({ pressed }) => ({
        flex: wide ? undefined : 1, padding: 12, borderRadius: 18, gap: 3,
        borderWidth: on ? 2.5 : 1.5, borderColor: on ? C.cyan : C.line, backgroundColor: on ? C.cardOn : C.card,
        shadowColor: C.cyanDeep, shadowOpacity: on ? 0.45 : 0, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, gap: 4 }}>
          {badge ? <Badge text={badge} /> : null}
          <Txt v="eyebrow" color={C.muted} style={{ fontSize: 12, letterSpacing: 2.4 }}>{label}</Txt>
        </View>
        <Radio on={on} />
      </Row>
      {strike ? <Txt v="small" color={C.faint} style={{ textDecorationLine: "line-through" }}>{strike}</Txt> : null}
      <Row gap={2} style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
        <Txt color={C.ink} style={{ fontSize: wide ? 22 : 26, lineHeight: wide ? 28 : 32, fontWeight: "800", fontFamily: SANS }} numberOfLines={1} adjustsFontSizeToFit>{price}</Txt>
        {unit ? <Txt v="body" color={C.muted} style={{ paddingBottom: 4 }}>{unit}</Txt> : null}
      </Row>
      {(lines || []).map((l) => <Txt key={l} color={C.muted} style={{ fontSize: 13, lineHeight: 17, fontFamily: SANS }}>{l}</Txt>)}
      {saveText ? <Txt v="smallB" color={C.gold}>{saveText}</Txt> : null}
    </Pressable>
  );
}

/** Auto-scrolling strip of the Pro features. Static (swipeable) when the phone has Reduce Motion on. */
function Marquee() {
  const x = React.useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0); const [still, setStill] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then((v) => setStill(!!v)).catch(() => {}); }, []);
  useEffect(() => {
    if (!w || still) return;
    x.setValue(0);
    const loop = Animated.loop(Animated.timing(x, { toValue: -w, duration: w * 28, easing: Easing.linear, useNativeDriver: true }));
    loop.start(); return () => loop.stop();
  }, [w, still]);
  const chips = (k) => (
    <View key={k} style={{ flexDirection: "row" }} onLayout={k === 0 ? (e) => setW(e.nativeEvent.layout.width) : undefined}>
      {MARQUEE.map(([ic, label]) => (
        <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, borderRadius: 999, backgroundColor: "rgba(6,182,212,0.12)", borderWidth: 1, borderColor: "rgba(34,211,238,0.35)" }}>
          <Icon name={ic} size={14} color={C.cyan} />
          <Txt color={C.ink} style={{ fontSize: 14, fontWeight: "600", fontFamily: SANS }}>{label}</Txt>
        </View>
      ))}
    </View>
  );
  const label = `Pro includes: ${MARQUEE.map((m) => m[1]).join(", ")}`;
  if (still) {
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={label}>{chips(0)}</ScrollView>;
  }
  return (
    <View style={{ overflow: "hidden", marginHorizontal: -20 }} accessible accessibilityLabel={label}>
      <Animated.View style={{ flexDirection: "row", paddingLeft: 20, transform: [{ translateX: x }] }}>{chips(0)}{chips(1)}</Animated.View>
    </View>
  );
}

/** Placeholder plan cards while prices load from the store (no prices are ever hard-coded). */
function PlanSkeleton() {
  const a = React.useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 0.8, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start(); return () => loop.stop();
  }, []);
  const bar = (w, h = 12) => <View style={{ width: w, height: h, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.18)" }} />;
  const card = (k) => (
    <Animated.View key={k} style={{ flex: 1, minHeight: 130, padding: 16, borderRadius: 20, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.card, gap: 12, opacity: a }}>
      {bar("45%", 10)}{bar("70%", 30)}{bar("85%")}{bar("60%")}
    </Animated.View>
  );
  return (
    <View accessible accessibilityLabel="Loading plans and prices from the store">
      <Row gap={12} center={false} style={{ alignItems: "stretch" }}>{card(1)}{card(2)}</Row>
    </View>
  );
}

function LinkText({ children, onPress, color = C.cyan, underline, size = 17 }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="link" hitSlop={8}>
      <Txt color={color} style={{ fontSize: size, lineHeight: size + 6, textDecorationLine: underline ? "underline" : "none", fontFamily: SANS, fontWeight: underline ? "400" : "600" }}>{children}</Txt>
    </Pressable>
  );
}

/* ---------- screen ---------- */
export default function Paywall() {
  const ins = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { isPro, membership, packages, specialPackages, winBack, buy, restore, manage, reload, storeAvailable, ready, error, errorDetail, devUnlock, setDevUnlock } = usePro();
  const trialFor = useTrials([...packages, ...specialPackages]);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const source = (winBack ? specialPackages : packages).slice().sort((a, b) => (ORDER[a.packageType] ?? 8) - (ORDER[b.packageType] ?? 8));
  const subs = source.filter((p) => p.packageType !== "LIFETIME");
  const lifetime = source.find((p) => p.packageType === "LIFETIME");
  const annual = source.find((p) => p.packageType === "ANNUAL");
  const monthly = source.find((p) => p.packageType === "MONTHLY");
  const defaultId = (annual || monthly || subs[0] || lifetime || {}).identifier;
  const selId = sel || defaultId;
  const chosen = source.find((p) => p.identifier === selId) || null;
  const freeChosen = selId === FREE_ID;
  const trial = chosen ? trialFor(chosen) : null;
  const per = chosen ? PERIOD[chosen.packageType] : null;
  const short = chosen ? SHORT[chosen.packageType] : "";

  // Real savings only: yearly vs 12 × monthly, special offer vs regular price of the same plan.
  const yearlySave = annual && monthly && monthly.product.price > 0 ? Math.round((1 - annual.product.price / (monthly.product.price * 12)) * 100) : 0;
  const regularOf = (p) => (winBack ? packages.find((r) => r.packageType === p.packageType) : null);
  const offerSave = (p) => { const r = regularOf(p); return r && r.product.price > p.product.price ? Math.round((1 - p.product.price / r.product.price) * 100) : 0; };

  const close = () => { if (router.canGoBack()) router.back(); else router.replace("/"); };
  const purchase = async () => {
    if (freeChosen) { close(); return; }
    if (!chosen || busy) return; setBusy(true); setMsg("");
    const r = await buy(chosen); setBusy(false);
    if (r.ok) {
      buzz();
      if (trial) {
        const end = (r.membership && r.membership.expires) || new Date(Date.now() + 14 * 86400000).toISOString();
        scheduleTrialReminder(end, `${chosen.product.priceString} per ${per}`);
        setMsg(`Your ${trial.words} free trial has started. Every Pro tool is unlocked. We'll remind you 2 days before it ends.`);
      } else setMsg("Welcome to Pro! Every Pro tool is now unlocked.");
    } else if (!r.cancelled) setMsg(r.message);
  };
  const doRestore = async () => { setBusy(true); setMsg(""); const r = await restore(); setBusy(false); setMsg(r.message); };
  const open = (url) => { if (url && !/REPLACE_ME/.test(url)) Linking.openURL(url).catch(() => {}); };

  const cardFor = (p, wide) => {
    const t = trialFor(p); const life = p.packageType === "LIFETIME"; const save = offerSave(p); const reg = save > 0 ? regularOf(p) : null;
    const lines = [];
    // e.g. "2 weeks free, then $99.99/year": the full price stays the biggest text on the card (App Store 3.1.2).
    const pPer = PERIOD[p.packageType];
    if (t) lines.push(t.free ? `${t.words} free, then ${p.product.priceString}${pPer ? "/" + pPer : ""}` : `${t.priceString} for ${t.words}, then ${p.product.priceString}${pPer ? "/" + pPer : ""}`);
    if (p.packageType === "ANNUAL" && p.product.pricePerMonthString) lines.push(`${p.product.pricePerMonthString}/mo billed yearly`);
    if (p.packageType === "MONTHLY") lines.push("Cancel anytime");
    if (life) lines.push("One payment · no renewal");
    let saveText = null;
    if (save > 0) saveText = `Special offer · Save ${save}%`;
    else if (p.packageType === "ANNUAL" && yearlySave > 0) saveText = `Save ~${yearlySave}%`;
    return (
      <PlanCard key={p.identifier} wide={wide} on={selId === p.identifier} onPress={() => setSel(p.identifier)}
        label={life ? "ALL-ACCESS PASS" : p.packageType === "ANNUAL" ? "ANNUAL" : p.packageType === "MONTHLY" ? "MONTHLY" : (per || "PLAN").toUpperCase()}
        badge={p.packageType === "ANNUAL" && yearlySave > 0 ? "BEST VALUE" : save > 0 ? "SPECIAL OFFER" : life ? "PAY ONCE" : null}
        price={p.product.priceString} unit={life ? null : SHORT[p.packageType]} strike={reg ? reg.product.priceString : null}
        lines={lines} saveText={saveText} />
    );
  };

  const ctaTitle = freeChosen ? "Continue with Free"
    : !chosen ? "" : busy ? "Please wait…"
    : trial ? (trial.free ? "Start Free Trial" : `Start for ${trial.priceString}`)
    : "Unlock Pro Access";
  const ctaSub = freeChosen ? "Roadmap, visa bulletin and question bank stay free"
    : !chosen ? "" : trial ? `${trial.free ? `${trial.words} free` : `${trial.priceString} for ${trial.words}`}, then ${chosen.product.priceString}${per ? "/" + per : ""} · cancel anytime`
    : chosen.packageType === "LIFETIME" ? `${chosen.product.priceString} once · no subscription` : `${chosen.product.priceString}${per ? "/" + per : ""} · cancel anytime`;

  const renewLine = chosen && !freeChosen && chosen.packageType !== "LIFETIME"
    ? (trial ? `${trial.words} free, then ${chosen.product.priceString}/${per}, renewing automatically.` : `${chosen.product.priceString}/${per}, renewing automatically.`)
    : null;

  // Pro member status line
  let memberLine = null;
  if (isPro && membership) {
    if (membership.lifetime) memberLine = "All-access pass · yours to keep, with no renewals.";
    else if (membership.trial && membership.willRenew) memberLine = `Free trial until ${fmtDate(isoDay(membership.expires))}, then it renews unless you cancel at least 24 hours before it ends.`;
    else if (membership.trial) memberLine = `Free trial until ${fmtDate(isoDay(membership.expires))}. You've canceled, so you won't be charged.`;
    else if (membership.willRenew) memberLine = `Renews on ${fmtDate(isoDay(membership.expires))}.`;
    else memberLine = `Canceled · Pro stays on until ${fmtDate(isoDay(membership.expires))}.`;
  } else if (isPro) memberLine = "Every Pro tool is unlocked.";

  const tight = height < 740;   // iPhone SE / mini: tighter spacing so everything fits on one screen
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Backdrop />
      {/* Everything fits on one screen; the ScrollView only kicks in on very small phones or with very large text. */}
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between", paddingTop: ins.top + 10, paddingBottom: ins.bottom + 10, paddingHorizontal: 20, gap: tight ? 8 : 12 }}>
        <View style={{ gap: tight ? 8 : 12 }}>
          {/* header */}
          <Row gap={12} style={{ paddingRight: 48 }}>
            <Image source={require("../assets/icon.png")} style={{ width: tight ? 44 : 52, height: tight ? 44 : 52, borderRadius: 12 }} accessibilityIgnoresInvertColors accessible accessibilityLabel="NurseBound app icon" />
            <View style={{ flex: 1 }}>
              <Txt color={C.cyan} style={{ fontSize: 13, letterSpacing: 3.5, fontWeight: "800", fontFamily: SANS }}>NURSEBOUND PRO</Txt>
              <Txt color="#fff" style={{ fontSize: tight ? 19 : 21, lineHeight: tight ? 24 : 27, fontWeight: "800", fontFamily: SANS }} accessibilityRole="header">Prepare to Pass the NCLEX-RN on Your First Attempt</Txt>
            </View>
          </Row>
          <Marquee />

          {/* plans */}
          {isPro ? (
            <View style={{ padding: 14, gap: 8, alignItems: "center", borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.card }}>
              <Row gap={8}><Icon name="BadgeCheck" size={20} color={C.cyan} /><Txt v="h3" color={C.ink}>You're a Pro member</Txt></Row>
              <Txt v="body" color={C.muted} style={{ textAlign: "center" }}>{memberLine}</Txt>
            </View>
          ) : !ready ? <PlanSkeleton /> : !source.length ? (
            <View style={{ padding: 14, gap: 8, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.card }}>
              <Row gap={8}><Icon name="Store" size={18} color={C.gold} /><Txt v="bodyB" color={C.ink}>{storeAvailable ? "Plans Didn't Load" : "Store Not Connected"}</Txt></Row>
              <Txt v="small" color={C.muted}>{storeAvailable ? (error || "We couldn't load plans from the store. Check your connection and try again.")
                : (Platform.OS === "ios" ? "Purchases work in the App Store version of the app." : "Purchases work in the Google Play version of the app.") + (__DEV__ ? " Add your RevenueCat keys in app.json to test them." : "")}</Txt>
              {storeAvailable && errorDetail ? <Txt v="tiny" color={C.faint} selectable>Details: {errorDetail}</Txt> : null}
              {storeAvailable ? <LinkText onPress={reload}>Try Again</LinkText> : null}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {winBack ? <View style={{ alignSelf: "center" }}><Badge text="SPECIAL OFFER FOR YOU" color={C.gold} /></View> : null}
              {subs.length >= 2 ? (
                <Row gap={10} center={false} style={{ alignItems: "stretch" }}>{subs.slice(0, 2).map((p) => cardFor(p))}</Row>
              ) : subs.length === 1 && lifetime ? (
                <Row gap={10} center={false} style={{ alignItems: "stretch" }}>{cardFor(subs[0])}{cardFor(lifetime)}</Row>
              ) : subs.length === 1 ? cardFor(subs[0], true) : null}
              {subs.slice(2).map((p) => cardFor(p, true))}
              {lifetime && subs.length !== 1 ? cardFor(lifetime, true) : null}
            </View>
          )}
        </View>

        <View style={{ gap: tight ? 8 : 10 }}>
          {msg ? (
            <View style={{ borderRadius: 14, padding: 10, backgroundColor: "rgba(251,191,36,0.12)", borderWidth: 1, borderColor: "rgba(251,191,36,0.4)" }}>
              <Txt v="small" color={C.ink}>{msg}</Txt>
            </View>
          ) : null}

          {/* main button */}
          {!isPro && chosen ? (
            <Pressable onPress={purchase} disabled={busy} accessibilityRole="button" accessibilityLabel={`${ctaTitle}. ${ctaSub}`}
              style={({ pressed }) => ({ borderRadius: 20, paddingVertical: tight ? 11 : 14, paddingHorizontal: 18, alignItems: "center", gap: 1,
                backgroundColor: C.cyan, opacity: busy ? 0.6 : 1,
                shadowColor: C.cyanDeep, shadowOpacity: 0.55, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }, elevation: 6,
                transform: [{ scale: pressed ? 0.985 : 1 }] })}>
              <Txt color={C.navyInk} style={{ fontSize: 19, lineHeight: 24, fontWeight: "800", textAlign: "center", fontFamily: SANS }}>{ctaTitle}</Txt>
              <Txt color="#0B3B47" style={{ fontSize: 14, lineHeight: 19, textAlign: "center", fontFamily: SANS }}>{ctaSub}</Txt>
            </Pressable>
          ) : null}

          <Row gap={14} style={{ justifyContent: "center" }}>
            <LinkText size={16} onPress={doRestore}>Restore Purchases</LinkText>
            <Txt color={C.faint}>·</Txt>
            <LinkText size={16} onPress={manage}>Manage Subscription</LinkText>
          </Row>

          {/* Apple 3.1.2 terms: billed amount, period, auto-renewal and how to cancel */}
          <Txt color={C.muted} style={{ textAlign: "center", fontSize: 11.5, lineHeight: 15.5, fontFamily: SANS }}>
            {renewLine && !isPro ? renewLine + " " : ""}Payment is charged to your {ACCOUNT} at confirmation of purchase{trial ? " (for a free trial, when the trial ends)" : ""}. Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period. {Platform.OS === "ios" ? "Cancel anytime in your Apple ID account settings." : "Cancel anytime in Google Play subscriptions."} The all-access pass is a one-time purchase. NurseBound is for education only; it is not legal, immigration or medical advice.
          </Txt>

          <Row gap={10} style={{ justifyContent: "center" }}>
            <LinkText underline color={C.muted} size={13} onPress={() => open(LINKS.privacy)}>Privacy Policy</LinkText>
            <Txt color={C.faint}>·</Txt>
            <LinkText underline color={C.muted} size={13} onPress={() => open(LINKS.terms)}>Terms of Use (EULA)</LinkText>
          </Row>

          {__DEV__ ? (
            <View style={{ alignItems: "center" }}>
              <LinkText size={13} color={C.faint} onPress={() => setDevUnlock(!devUnlock)}>{devUnlock ? "Dev: Lock Pro Again" : "Dev: Unlock Pro for Testing"}</LinkText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Pressable onPress={() => { tap(); close(); }} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}
        style={{ position: "absolute", top: ins.top + 8, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
        <Icon name="X" size={22} color={C.ink} />
      </Pressable>
    </View>
  );
}
