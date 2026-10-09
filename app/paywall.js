// Pro paywall.
// Prices, currencies and the 2-week free trial all come from Apple / Google for the shopper's own country,
// so each country sees the regional price you set in App Store Connect and Play Console.
// Store rules this screen covers (App Store 3.1.1 / 3.1.2, Google Play Payments + Subscriptions policy):
//  • the billed price and period are the most prominent text; the trial is described with what it costs after
//  • the trial is only promised to people the store says are eligible
//  • auto-renewal terms, how to cancel, Restore Purchases, Terms of Use (EULA) and Privacy Policy links
//  • members can open the store's own "Manage subscription" page
import React, { useEffect, useState } from "react";
import { View, Pressable, Linking, Platform, ActivityIndicator } from "react-native";
import { Screen, Card, Txt, Btn, Icon, Grad, Row, Note, tap, buzz } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme } from "../src/theme";
import { usePro, PRO_FEATURES, FREE_FEATURES, LINKS } from "../src/pro";
import { scheduleTrialReminder } from "../src/notify";
import { fmtDate } from "../src/util";

let RC = {};
try { RC = require("react-native-purchases"); } catch (e) { RC = {}; }

const PERIOD = { MONTHLY: "month", ANNUAL: "year", WEEKLY: "week", SIX_MONTH: "6 months", THREE_MONTH: "3 months", TWO_MONTH: "2 months", LIFETIME: null };
const UNIT = { DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year" };
const STORE = Platform.OS === "ios" ? "Apple ID" : "Google Play account";
const MANAGE_WHERE = Platform.OS === "ios" ? "Settings → your name → Subscriptions" : "Google Play → Payments & subscriptions → Subscriptions";

/** "2 weeks", "14 days", "1 month" from a store intro offer. */
function trialLength(intro) {
  const n = intro.periodNumberOfUnits || 1; const u = UNIT[intro.periodUnit] || "day";
  if (u === "day" && n % 7 === 0) return `${n / 7} week${n / 7 > 1 ? "s" : ""}`;
  return `${n} ${u}${n > 1 ? "s" : ""}`;
}
const isoDay = (s) => (s ? String(s).slice(0, 10) : "");

/** The free trial the store will actually give this shopper, or null. */
function useTrials(packages) {
  const [eligible, setEligible] = useState({});
  useEffect(() => {
    const subs = packages.filter((p) => p.packageType !== "LIFETIME" && p.product && p.product.introPrice);
    if (!subs.length) return;
    // Google Play only returns offers the account qualifies for, so the intro price can be trusted.
    // On iOS we must ask: Apple gives one free trial per subscription group per Apple ID.
    if (Platform.OS !== "ios" || !RC.default || !RC.default.checkTrialOrIntroductoryPriceEligibility) {
      setEligible(Object.fromEntries(subs.map((p) => [p.product.identifier, true]))); return;
    }
    const ELIGIBLE = (RC.INTRO_ELIGIBILITY_STATUS && RC.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE) ?? 2;
    RC.default.checkTrialOrIntroductoryPriceEligibility(subs.map((p) => p.product.identifier))
      .then((res) => setEligible(Object.fromEntries(subs.map((p) => [p.product.identifier, res && res[p.product.identifier] && res[p.product.identifier].status === ELIGIBLE]))))
      .catch(() => setEligible({}));
  }, [packages]);
  return (pkg) => {
    const intro = pkg && pkg.product && pkg.product.introPrice;
    if (!intro || pkg.packageType === "LIFETIME" || !eligible[pkg.product.identifier]) return null;
    return { free: !intro.price, length: trialLength(intro), priceString: intro.priceString };
  };
}

function PlanCard({ pkg, trial, selected, onPress }) {
  const t = useTheme("home");
  const per = PERIOD[pkg.packageType];
  const lifetime = pkg.packageType === "LIFETIME";
  const perMonth = pkg.packageType === "ANNUAL" && pkg.product.pricePerMonthString ? ` (${pkg.product.pricePerMonthString}/month)` : "";
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: selected }}
      accessibilityLabel={`${lifetime ? "All-access pass" : "Pro " + per}, ${pkg.product.priceString}${per ? " per " + per : " one time"}${trial ? `, ${trial.length} free trial first` : ""}`}
      style={{ flex: 1, padding: 16, borderRadius: 18, borderWidth: selected ? 2 : 1, borderColor: selected ? t.tint : t.c.line, backgroundColor: selected ? t.soft : t.c.surface, gap: 4 }}>
      {trial ? <View style={{ alignSelf: "flex-start", backgroundColor: t.soft2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}><Txt v="eyebrow" color={t.tint2}>{trial.free ? `${trial.length} free` : `Intro ${trial.priceString}`}</Txt></View> : null}
      {lifetime ? <View style={{ alignSelf: "flex-start", backgroundColor: t.c.sunk, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}><Txt v="eyebrow">No renewal</Txt></View> : null}
      <Txt v="eyebrow">{lifetime ? "All-access pass" : "Pro " + (per === "month" ? "monthly" : per === "year" ? "yearly" : per || "")}</Txt>
      <Txt v="h1">{pkg.product.priceString}</Txt>
      <Txt v="small" muted>{lifetime ? "One payment, yours to keep" : `per ${per}${perMonth}`}</Txt>
      {trial ? <Txt v="tiny" muted>after the {trial.length} {trial.free ? "free trial" : "intro offer"}</Txt> : null}
    </Pressable>
  );
}

function MemberCard() {
  const t = useTheme("home"); const { membership, manage, packages } = usePro();
  if (!membership) return null;
  const pkg = packages.find((p) => p.product && p.product.identifier === membership.productId);
  const price = pkg ? `${pkg.product.priceString}${PERIOD[pkg.packageType] ? " per " + PERIOD[pkg.packageType] : ""}` : null;
  let line;
  if (membership.lifetime) line = "All-access pass · yours for good, no renewals.";
  else if (membership.trial && membership.willRenew) line = `Free trial until ${fmtDate(isoDay(membership.expires))}. Then it renews${price ? " at " + price : ""} unless you cancel at least 24 hours before.`;
  else if (membership.trial) line = `Free trial until ${fmtDate(isoDay(membership.expires))}. You've cancelled, so you won't be charged.`;
  else if (membership.willRenew) line = `Renews on ${fmtDate(isoDay(membership.expires))}${price ? " at " + price : ""}.`;
  else line = `Cancelled · Pro stays on until ${fmtDate(isoDay(membership.expires))}.`;
  return (
    <Card style={{ gap: 10 }}>
      <Row gap={8}><Icon name="BadgeCheck" size={18} color={t.c.ok} /><Txt v="h3">Your membership</Txt></Row>
      <Txt v="body">{line}</Txt>
      {!membership.lifetime ? <Btn kind="secondary" icon="ExternalLink" title="Manage subscription" onPress={manage} /> : null}
      {membership.sandbox && __DEV__ ? <Txt v="tiny" muted>Sandbox purchase (test account).</Txt> : null}
    </Card>
  );
}

export default function Paywall() {
  const t = useTheme("home");
  const { isPro, membership, packages, buy, restore, reload, storeAvailable, ready, error, devUnlock, setDevUnlock } = usePro();
  const trialFor = useTrials(packages);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  // Subscription first (that's the one with the trial), then the one-time pass.
  const pkgs = [...packages].sort((a, b) => (a.packageType === "LIFETIME") - (b.packageType === "LIFETIME"));
  const chosen = pkgs.find((p) => p.identifier === sel) || pkgs[0];
  const subscription = chosen && chosen.packageType !== "LIFETIME";
  const trial = chosen ? trialFor(chosen) : null;
  const per = chosen ? PERIOD[chosen.packageType] : null;
  const anyTrial = pkgs.map(trialFor).find(Boolean);

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

  const cta = !chosen ? "" : busy ? "Please wait…"
    : trial ? (trial.free ? `Start ${trial.length} free trial` : `Start for ${trial.priceString}`)
    : subscription ? `Subscribe for ${chosen.product.priceString}/${per}` : `Buy for ${chosen.product.priceString}`;

  return (
    <Screen mod="home">
      <BackRow title="USRN Pathway Pro" />
      <Grad colors={["#f59e0b", "#db2777"]} style={{ borderRadius: 26, padding: 22, gap: 10, overflow: "hidden" }}>
        <View style={{ position: "absolute", width: 200, height: 200, borderRadius: 100, right: -60, top: -90, backgroundColor: "rgba(255,255,255,0.16)" }} />
        <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" }}><Icon name="Crown" size={28} color="#fff" /></View>
        <Txt v="h1" color="#fff">{isPro ? "You're Pro" : anyTrial && anyTrial.free ? `Try Pro free for ${anyTrial.length}` : "Unlock every Pro tool"}</Txt>
        <Txt v="body" color="rgba(255,255,255,0.95)">
          {isPro ? "Thanks for supporting USRN Pathway. Everything below is unlocked."
            : "Prices are in your local currency, set for your country by the " + (Platform.OS === "ios" ? "App Store." : "Google Play Store.")}
        </Txt>
      </Grad>

      {isPro ? <MemberCard /> : null}

      <Card style={{ gap: 12 }}>
        <Row gap={8}><Icon name="Crown" size={18} color={t.tint} /><Txt v="h3">Pro includes</Txt></Row>
        {PRO_FEATURES.map(([ic, title, d]) => (
          <Row key={title} gap={12} center={false}>
            <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: t.soft, alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={17} color={t.tint} /></View>
            <View style={{ flex: 1 }}><Txt v="bodyB">{title}</Txt><Txt v="small" muted>{d}</Txt></View>
          </Row>
        ))}
      </Card>

      {!isPro ? (
        <>
          {!ready ? <ActivityIndicator color={t.tint} /> : pkgs.length ? (
            <Row gap={10} center={false} style={{ alignItems: "stretch" }}>
              {pkgs.map((p) => <PlanCard key={p.identifier} pkg={p} trial={trialFor(p)} selected={chosen && chosen.identifier === p.identifier} onPress={() => setSel(p.identifier)} />)}
            </Row>
          ) : (
            <Note tone="warn" icon="Store" title={storeAvailable ? "Plans didn't load" : "Store not connected"}>
              {storeAvailable ? (error || "We couldn't load plans from the store.") + " Check your connection and try again."
                : "Purchases work in the App Store and Google Play builds of the app. Add your RevenueCat keys in app.json to test them."}
            </Note>
          )}
          {ready && !pkgs.length && storeAvailable ? <Btn kind="secondary" icon="RefreshCw" title="Try again" onPress={reload} /> : null}

          {chosen ? (
            <View style={{ gap: 6 }}>
              <Btn full title={cta} icon={trial ? "Sparkles" : "Lock"} disabled={busy} onPress={purchase} />
              {trial ? <Txt v="smallB" style={{ textAlign: "center" }}>{trial.free ? `${trial.length} free, then ${chosen.product.priceString} per ${per}` : `${trial.priceString} for ${trial.length}, then ${chosen.product.priceString} per ${per}`}</Txt> : null}
            </View>
          ) : null}

          {chosen && subscription ? (
            <Txt v="tiny" muted>
              {trial
                ? `${trial.free ? "Free" : trial.priceString} for ${trial.length}, then ${chosen.product.priceString} per ${per}. Your ${STORE} is charged when the trial ends unless you cancel at least 24 hours before it ends. `
                : `Payment of ${chosen.product.priceString} is charged to your ${STORE} when you confirm. `}
              The subscription renews automatically at {chosen.product.priceString} each {per || "period"} unless you cancel at least 24 hours before the current period ends; renewal is charged within the 24 hours before then. Cancel any time in {MANAGE_WHERE}.
              {trial ? " If you buy the All-access pass during the trial, cancel the trial in the same place." : ""}
            </Txt>
          ) : chosen ? (
            <Txt v="tiny" muted>One-time payment of {chosen.product.priceString}, charged to your {STORE} when you confirm. No subscription and no renewals.</Txt>
          ) : null}
        </>
      ) : null}

      {msg ? <Note tone={isPro ? "ok" : "acc"} icon={isPro ? "PartyPopper" : "Info"}>{msg}</Note> : null}

      <Row gap={10} style={{ flexWrap: "wrap" }}>
        <Btn small kind="secondary" icon="RotateCcw" title="Restore purchases" onPress={doRestore} disabled={busy} />
        <Btn small kind="ghost" title="Terms of Use" onPress={() => open(LINKS.terms)} />
        <Btn small kind="ghost" title="Privacy Policy" onPress={() => open(LINKS.privacy)} />
      </Row>

      <Card style={{ gap: 8, backgroundColor: t.c.sunk }}>
        <Txt v="bodyB">Always free</Txt>
        {FREE_FEATURES.map((f) => <Row key={f} gap={8}><Icon name="Check" size={16} color={t.c.ok} /><Txt v="small" style={{ flex: 1 }}>{f}</Txt></Row>)}
      </Card>

      {__DEV__ ? (
        <Card style={{ borderStyle: "dashed" }}>
          <Txt v="eyebrow">Developer only (not in store builds)</Txt>
          {/REPLACE_ME/.test(String(LINKS.privacy)) ? <Txt v="tiny" muted>Privacy Policy link is still a placeholder in app.json — Apple rejects paywalls without a working one.</Txt> : null}
          <Btn small kind="secondary" icon="FlaskConical" title={devUnlock ? "Lock Pro again" : "Unlock Pro for testing"} onPress={() => setDevUnlock(!devUnlock)} />
        </Card>
      ) : null}
    </Screen>
  );
}
