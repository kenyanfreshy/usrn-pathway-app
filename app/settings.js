// Profile & settings: about you, key dates, theme and reset. Everything stays on the device.
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen, Card, Row, Txt, Icon, Grad, Field, DateField, Select, Btn, Note, buzz, tap, Grid } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme, PALETTES } from "../src/theme";
import { useApp } from "../src/state";
import { BOARDS } from "../src/data/content";
import { useBulletin } from "../src/bulletin";
import { DESTINATIONS, destId } from "../src/data/global";
import { RegionSelect } from "../src/dest";

const SPECIALTIES = ["Medical-surgical", "ICU / critical care", "Emergency", "Operating room", "Labor & delivery", "Pediatrics", "Oncology", "Telemetry / step-down", "Psychiatric", "Long-term care", "Other"];

function Avatar({ size = 56 }) {
  const { state } = useApp(); const p = state.profile;
  const ini = ((p.name || "").trim()[0] || "") + ((p.lastName || "").trim()[0] || "");
  return (
    <Grad mod="home" style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.45)" }}>
      {ini ? <Txt v="h2" color="#fff" style={{ fontSize: size * 0.38, lineHeight: size * 0.48 }}>{ini.toUpperCase()}</Txt> : <Icon name="User" size={Math.round(size * 0.5)} color="#fff" />}
    </Grad>
  );
}

export default function Settings() {
  const { state, dispatch, lvl, m } = useApp(); const t = useTheme("home"); const p = state.profile; const BULLETIN = useBulletin();
  const [confirm, setConfirm] = useState(false); const [didReset, setDidReset] = useState(false);
  const set = (k) => (v) => dispatch({ type: "profile", patch: { [k]: v } });
  const fullName = [p.name, p.lastName].filter(Boolean).join(" ");
  const col = { flexGrow: 1 };

  return (
    <Screen mod="home">
      <BackRow title="Profile & settings" mod="home" />

      <Grad mod="home" style={{ borderRadius: 22, padding: 18, flexDirection: "row", alignItems: "center", gap: 14, overflow: "hidden" }}>
        <View pointerEvents="none" style={{ position: "absolute", width: 160, height: 160, borderRadius: 80, right: -50, top: -70, backgroundColor: "rgba(255,255,255,0.14)" }} />
        <Avatar size={60} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="h2" color="#fff" numberOfLines={2}>{fullName || "Your profile"}</Txt>
          <Txt v="small" color="rgba(255,255,255,0.9)">Level {lvl.idx + 1} · {lvl.name} · {m.xp} XP</Txt>
        </View>
      </Grad>
      <Note tone="acc" icon="Lock">Everything here is optional and stays on this device.</Note>

      <Card mod="home">
        <Txt v="eyebrow">About you</Txt>
        <Grid min={200} gap={12}>
          <Field style={col} label="First name" value={p.name} onChangeText={set("name")} placeholder="e.g. Grace" autoCapitalize="words" />
          <Field style={col} label="Last name" value={p.lastName} onChangeText={set("lastName")} placeholder="Optional" autoCapitalize="words" />
        </Grid>
        <Field label="Home country" value={p.homeCountry} onChangeText={set("homeCountry")} placeholder="e.g. Kenya" autoCapitalize="words" />
        <Select label="Specialty" value={p.specialty} onChange={set("specialty")} options={[{ value: "", label: "Choose…" }, ...SPECIALTIES]} />
        <Select label="Destination country" value={destId(state)} onChange={set("dest")} options={DESTINATIONS.map((d) => ({ value: d.id, label: `${d.flag} ${d.name}` }))} />
        <RegionSelect mod="home" />
        {destId(state) === "US" ? <Select label="Target state" value={p.targetState} onChange={set("targetState")} placeholder="Not decided"
          options={[{ value: "", label: "Not decided" }, ...BOARDS.map((b) => ({ value: b.name, label: b.name }))]} /> : null}
      </Card>

      <Card mod="home">
        <Txt v="eyebrow">Your dates</Txt>
        {destId(state) === "US" ? <>
          <Select label="Visa chargeability" value={p.country} onChange={set("country")} options={BULLETIN.rows.map((r) => ({ value: r.key, label: r.name }))} />
          <DateField label="Priority date (if filed)" value={p.pd} onChange={set("pd")} />
        </> : null}
        <DateField label={destId(state) === "NZ" ? "Theory exam date" : "NCLEX test date"} value={p.testDate} onChange={set("testDate")} />
        {destId(state) === "US" ? <DateField label="ATT window ends" value={p.attEnd} onChange={set("attEnd")} /> : null}
        <Txt v="tiny" muted>Dates power the countdowns and visa wait estimate on Today.</Txt>
      </Card>

      <Card mod="home">
        <Txt v="eyebrow">Theme</Txt>
        <Grid min={140} gap={10}>
          {Object.entries(PALETTES).map(([k, v]) => {
            const on = (state.palette || "vivid") === k;
            return (
              <Pressable key={k} onPress={() => { tap(); dispatch({ type: "palette", key: k }); }} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${v.label} theme`}
                style={{ flexGrow: 1, gap: 8, padding: 12, borderRadius: 16, borderWidth: on ? 2 : 1, borderColor: on ? t.tint : t.c.line, backgroundColor: v.dark ? "#0d1324" : t.c.surface }}>
                <Row gap={4}>
                  {["roadmap", "nclex", "imm", "career"].map((md) => <Grad key={md} colors={v.colors[md]} style={{ flex: 1, height: 22, borderRadius: 7 }} />)}
                </Row>
                <Row gap={6}>
                  <Txt v="smallB" color={v.dark ? "#fff" : t.c.ink} style={{ flex: 1 }}>{v.label}</Txt>
                  {on ? <Icon name="CheckCircle2" size={16} color={v.dark ? "#fff" : t.tint} /> : null}
                </Row>
              </Pressable>
            );
          })}
        </Grid>
      </Card>

      <Btn title="Save" icon="Check" full onPress={() => { if (router.canGoBack()) router.back(); else router.replace("/"); }} />

      <Card style={{ borderColor: t.c.crit }}>
        <Row gap={8}><Icon name="RotateCcw" size={16} color={t.c.crit} /><Txt v="bodyB" color={t.c.crit}>Reset progress</Txt></Row>
        {confirm ? (
          <View style={{ gap: 10 }}>
            <Txt v="small">Clear all progress, badges and XP and restore the sample data? Your profile and dates are cleared too; your theme is kept.</Txt>
            <Row wrap gap={8}>
              <Btn kind="danger" small icon="Trash2" title="Yes, reset" onPress={() => { dispatch({ type: "reset" }); setConfirm(false); setDidReset(true); buzz(); }} />
              <Btn kind="secondary" small title="Cancel" onPress={() => setConfirm(false)} />
            </Row>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Txt v="small" muted>{didReset ? "Progress cleared. You're starting fresh." : "Start over from the beginning. This can't be undone."}</Txt>
            <Btn kind="danger" small icon="RotateCcw" title="Reset progress" onPress={() => { setDidReset(false); setConfirm(true); }} />
          </View>
        )}
      </Card>
    </Screen>
  );
}
