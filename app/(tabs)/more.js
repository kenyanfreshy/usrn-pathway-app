// More: the modules that don't fit in the tab bar, plus achievements, settings and Pro.
import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen, Hero, Card, Row, Txt, Icon, IconTile, Grad, tap } from "../../src/ui";
import { useTheme } from "../../src/theme";
import { useApp, BADGES } from "../../src/state";
import { usePro } from "../../src/pro";

const TOOLS = [
  { to: "/boards", mod: "boards", icon: "Landmark", title: "Boards", desc: "State boards & endorsement" },
  { to: "/bedside", mod: "bedside", icon: "Stethoscope", title: "Bedside", desc: "U.S. hospital lessons, charting & license protection" },
  { to: "/career", mod: "career", icon: "TrendingUp", title: "Career", desc: "Charge tools, careers, money & insurance" },
  { to: "/driving", mod: "drive", icon: "Car", title: "Driving", desc: "Why to learn before you travel" },
];

function ToolCard({ tool }) {
  const t = useTheme(tool.mod);
  return (
    <Pressable onPress={() => { tap(); router.push(tool.to); }} accessibilityRole="button" accessibilityLabel={`${tool.title}. ${tool.desc}`}
      style={({ pressed }) => [{ flexGrow: 1, flexBasis: 150 }, pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 }]}>
      <Card mod={tool.mod} accent padding={0} style={{ overflow: "hidden", gap: 0, flexGrow: 1 }}>
        <Grad mod={tool.mod} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 5 }} />
        <View style={{ padding: 16, gap: 10, backgroundColor: t.dark ? t.c.surface : t.soft, flexGrow: 1 }}>
          <Row style={{ justifyContent: "space-between" }}>
            <IconTile mod={tool.mod} icon={tool.icon} size={48} />
            <View style={{ width: 30, height: 30, borderRadius: 99, backgroundColor: t.c.surface, alignItems: "center", justifyContent: "center" }}>
              <Icon name="ArrowUpRight" size={16} color={t.tint} />
            </View>
          </Row>
          <Txt v="h2" color={t.dark ? t.c.ink : t.tint}>{tool.title}</Txt>
          <Txt v="small" muted>{tool.desc}</Txt>
        </View>
      </Card>
    </Pressable>
  );
}

function LinkRow({ icon, title, sub, to, colors, right }) {
  const t = useTheme("more");
  return (
    <Pressable onPress={() => { tap(); router.push(to); }} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: pressed ? t.c.sunk : "transparent" })}>
      <IconTile mod="more" icon={icon} size={38} colors={colors} />
      <View style={{ flex: 1 }}>
        <Txt v="bodyB">{title}</Txt>
        <Txt v="small" muted numberOfLines={2}>{sub}</Txt>
      </View>
      {right}
      <Icon name="ChevronRight" size={18} color={t.c.muted} />
    </Pressable>
  );
}

function Disclaimer() {
  const t = useTheme();
  return (
    <View accessibilityRole="text" style={{ flexDirection: "row", gap: 12, padding: 16, borderRadius: 18, backgroundColor: t.c.warnSoft, borderWidth: 2, borderColor: t.c.warn }}>
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: t.c.warn, alignItems: "center", justifyContent: "center" }}><Icon name="AlertTriangle" size={20} color={t.c.surface} /></View>
      <View style={{ flex: 1, gap: 4 }}>
        <Txt v="h3" color={t.c.warn}>For educational purposes only</Txt>
        <Txt v="smallB">This app is not legal, immigration, medical or financial advice. Your progress is saved on your device.</Txt>
      </View>
    </View>
  );
}

export default function More() {
  const { state, lvl, m } = useApp(); const { isPro } = usePro(); const t = useTheme("more");
  const seen = (state.badgesSeen || []).length;
  const name = [state.profile.name, state.profile.lastName].filter(Boolean).join(" ");
  return (
    <Screen mod="more">
      <Hero mod="more" icon="LayoutGrid" eyebrow="USRN Pathway" title="More tools" sub="State boards, bedside skills, career and money, and getting on the road."
        stats={[["Level", lvl.name], ["XP", m.xp], ["Badges", `${seen}/${BADGES.length}`]]} />

      <Row wrap gap={12} center={false}>
        {TOOLS.map((tool) => <ToolCard key={tool.to} tool={tool} />)}
      </Row>

      <Card mod="more" padding={6} style={{ gap: 0 }}>
        <LinkRow icon="Award" title="Achievements" sub={`${seen} of ${BADGES.length} badges unlocked`} to="/badges" colors={["#d97706", "#ea580c"]} />
        <View style={{ height: 1, backgroundColor: t.c.line, marginHorizontal: 12 }} />
        <LinkRow icon="UserCog" title="Profile & settings" sub={name ? `${name} · dates, theme and reset` : "Your name, dates, theme and reset"} to="/settings" />
        <View style={{ height: 1, backgroundColor: t.c.line, marginHorizontal: 12 }} />
        <LinkRow icon="Crown" title="USRN Pathway Pro" sub={isPro ? "You're a Pro member — thank you" : "NGN case study, expiry alerts, endorsement wizard and more"} to="/paywall" colors={["#f59e0b", "#db2777"]}
          right={isPro ? <View style={{ backgroundColor: "#f59e0b", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}><Txt v="eyebrow" color="#1a1204">Pro</Txt></View> : null} />
      </Card>

      <Disclaimer />
    </Screen>
  );
}
