// Achievements: every badge (locked until earned), your level, XP and the level ladder.
import React from "react";
import { View } from "react-native";
import { Screen, Card, Row, Txt, Icon, Grad } from "../src/ui";
import { BackRow, Medal } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { useApp, BADGES, LEVELS } from "../src/state";

export default function Badges() {
  const { state, m, lvl } = useApp(); const t = useTheme("home");
  const seen = state.badgesSeen || [];
  const got = BADGES.filter((b) => seen.includes(b.id)).length;
  return (
    <Screen mod="home">
      <BackRow title={`Achievements · ${got}/${BADGES.length}`} mod="home" />

      <Grad mod="home" style={{ borderRadius: 24, padding: 18, gap: 12, overflow: "hidden" }}>
        <View pointerEvents="none" style={{ position: "absolute", width: 180, height: 180, borderRadius: 90, right: -60, top: -80, backgroundColor: "rgba(255,255,255,0.14)" }} />
        <Row gap={12}>
          <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="Crown" size={25} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="eyebrow" color="rgba(255,255,255,0.85)">Level {lvl.idx + 1}</Txt>
            <Txt v="h1" color="#fff">{lvl.name}</Txt>
          </View>
        </Row>
        <View style={{ height: 9, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" }} accessible accessibilityLabel={`Level progress ${Math.round(lvl.pct * 100)}%`}>
          <View style={{ height: "100%", width: `${Math.max(0, Math.min(100, lvl.pct * 100))}%`, backgroundColor: "#fff", borderRadius: 99 }} />
        </View>
        <Txt v="small" color="rgba(255,255,255,0.92)" style={{ fontFamily: FONTS.mono }}>{m.xp} XP{lvl.next ? ` · ${lvl.next - m.xp} to ${lvl.nextName}` : " · top level reached"}</Txt>
      </Grad>

      <Row wrap gap={10} center={false}>
        {BADGES.map((b, i) => {
          const on = seen.includes(b.id);
          return (
            <View key={b.id} accessible accessibilityLabel={`${b.name}${on ? ", unlocked" : ", locked"}. ${b.desc}`}
              style={{ flexGrow: 1, flexBasis: 150, alignItems: "center", gap: 8, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: t.c.line, backgroundColor: on ? t.c.surface : t.c.sunk }}>
              <Medal badge={b} idx={i} size={64} locked={!on} />
              <Txt v="bodyB" style={{ textAlign: "center" }} color={on ? t.c.ink : t.c.muted}>{b.name}</Txt>
              <Txt v="tiny" muted style={{ textAlign: "center" }}>{b.desc}</Txt>
            </View>
          );
        })}
      </Row>

      <Card mod="home">
        <Txt v="eyebrow">Level ladder</Txt>
        {LEVELS.map(([xp, name], i) => {
          const reached = m.xp >= xp; const cur = i === lvl.idx;
          return (
            <Row key={name} gap={12} style={{ paddingVertical: 4 }}>
              {reached
                ? <Grad mod="home" style={{ width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" }}><Txt v="smallB" color="#fff">{i + 1}</Txt></Grad>
                : <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: t.c.sunk, borderWidth: 1, borderColor: t.c.line, alignItems: "center", justifyContent: "center" }}><Txt v="smallB" muted>{i + 1}</Txt></View>}
              <Txt v={cur ? "bodyB" : "body"} color={reached ? t.c.ink : t.c.muted} style={{ flex: 1 }}>{name}{cur ? "  ← you" : ""}</Txt>
              <Txt v="mono" muted>{xp} XP</Txt>
            </Row>
          );
        })}
      </Card>

      <View style={{ gap: 6, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk }}>
        <Row gap={6}><Icon name="Zap" size={16} color={t.tint} /><Txt v="smallB">Earn XP</Txt></Row>
        <Txt v="tiny" muted>Roadmap step +20 · benchmark +50 (+50 at 75%+) · lesson +40 · daily question +5/+20 · flashcard +2 · ladder entry +15</Txt>
      </View>
    </Screen>
  );
}
