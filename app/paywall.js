// Pro paywall. Prices and currencies come from Apple / Google, so every country sees its local price.
// Meets store rules: price and period shown before purchase, auto-renew terms, Restore Purchases, Terms + Privacy links.
import React, { useState } from "react";
import { View, Pressable, Linking, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Screen, Card, Txt, Btn, Icon, Grad, Row, Note, tap, buzz } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme } from "../src/theme";
import { usePro, PRO_FEATURES, FREE_FEATURES, LINKS } from "../src/pro";

const PERIOD = { MONTHLY: "month", ANNUAL: "year", WEEKLY: "week", SIX_MONTH: "6 months", THREE_MONTH: "3 months", TWO_MONTH: "2 months", LIFETIME: null };

function PlanCard({ pkg, selected, onPress }) {
  const t = useTheme("home");
  const per = PERIOD[pkg.packageType];
  const lifetime = pkg.packageType === "LIFETIME";
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: selected }}
      style={{ flex: 1, minWidth: 150, padding: 16, borderRadius: 18, borderWidth: selected ? 2 : 1, borderColor: selected ? t.tint : t.c.line, backgroundColor: selected ? t.soft : t.c.surface, gap: 4 }}>
      {lifetime ? <View style={{ alignSelf: "flex-start", backgroundColor: t.soft2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}><Txt v="eyebrow" color={t.tint2}>Best value</Txt></View> : null}
      <Txt v="eyebrow">{lifetime ? "All-access pass" : "Pro " + (per === "month" ? "monthly" : per || "")}</Txt>
      <Txt v="h1">{pkg.product.priceString}</Txt>
      <Txt v="small" muted>{lifetime ? "One payment, no renewal" : per ? `per ${per} · cancel anytime` : pkg.product.title}</Txt>
    </Pressable>
  );
}

export default function Paywall() {
  const t = useTheme("home");
  const { isPro, packages, buy, restore, storeAvailable, ready, error, devUnlock, setDevUnlock } = usePro();
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const pkgs = [...packages].sort((a, b) => (a.packageType === "LIFETIME") - (b.packageType === "LIFETIME"));
  const chosen = pkgs.find((p) => p.identifier === sel) || pkgs[0];
  const subscription = chosen && chosen.packageType !== "LIFETIME";
  const store = Platform.OS === "ios" ? "Apple ID" : "Google Play";

  const purchase = async () => {
    if (!chosen) return; setBusy(true); setMsg("");
    const r = await buy(chosen); setBusy(false);
    if (r.ok) { buzz(); setMsg("Welcome to Pro! Every Pro tool is now unlocked."); }
    else if (!r.cancelled) setMsg(r.message);
  };
  const doRestore = async () => { setBusy(true); setMsg(""); const r = await restore(); setBusy(false); setMsg(r.message); };
  const open = (url) => { if (url && !/REPLACE_ME/.test(url)) Linking.openURL(url).catch(() => {}); };

  return (
    <Screen mod="home">
      <BackRow title="USRN Pathway Pro" />
      <Grad colors={["#f59e0b", "#db2777"]} style={{ borderRadius: 26, padding: 22, gap: 10, overflow: "hidden" }}>
        <View style={{ position: "absolute", width: 200, height: 200, borderRadius: 100, right: -60, top: -90, backgroundColor: "rgba(255,255,255,0.16)" }} />
        <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" }}><Icon name="Crown" size={28} color="#fff" /></View>
        <Txt v="h1" color="#fff">{isPro ? "You're Pro" : "Unlock every Pro tool"}</Txt>
        <Txt v="body" color="rgba(255,255,255,0.95)">{isPro ? "Thanks for supporting USRN Pathway. Everything below is unlocked." : "Prices are set for your country by the App Store and Google Play, in your local currency."}</Txt>
      </Grad>

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
            <Row wrap gap={10}>{pkgs.map((p) => <PlanCard key={p.identifier} pkg={p} selected={chosen && chosen.identifier === p.identifier} onPress={() => setSel(p.identifier)} />)}</Row>
          ) : (
            <Note tone="warn" icon="Store" title={storeAvailable ? "Plans are loading" : "Store not connected"}>
              {error || (storeAvailable ? "We couldn't load plans from the store. Check your connection and try again." : "Purchases work in the App Store and Google Play builds of the app. Add your RevenueCat keys in app.json to test them.")}
            </Note>
          )}
          {chosen ? <Btn full title={busy ? "Please wait…" : subscription ? `Subscribe for ${chosen.product.priceString}` : `Buy for ${chosen.product.priceString}`} icon="Lock" disabled={busy} onPress={purchase} /> : null}
          {chosen && subscription ? (
            <Txt v="tiny" muted>
              Payment is charged to your {store} account at confirmation. The subscription renews automatically at the same price each {PERIOD[chosen.packageType] || "period"} unless you cancel at least 24 hours before the current period ends. Manage or cancel any time in your {Platform.OS === "ios" ? "App Store account settings" : "Google Play subscriptions"}.
            </Txt>
          ) : null}
        </>
      ) : null}

      {msg ? <Note tone={isPro ? "ok" : "acc"} icon={isPro ? "PartyPopper" : "Info"}>{msg}</Note> : null}

      <Row wrap gap={10}>
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
          <Btn small kind="secondary" icon="FlaskConical" title={devUnlock ? "Lock Pro again" : "Unlock Pro for testing"} onPress={() => setDevUnlock(!devUnlock)} />
        </Card>
      ) : null}
    </Screen>
  );
}
