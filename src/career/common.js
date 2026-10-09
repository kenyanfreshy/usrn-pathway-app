// Shared building blocks for the Career & wealth sections.
import React from "react";
import { View, Text } from "react-native";
import { Txt, Row, Field, Grad, Bar, Icon } from "../ui";
import { useTheme, FONTS } from "../theme";
import { money } from "../util";

export const MOD = "career";

/** Tone colors: "teal" → module accent, "indigo" → module accent 2, plus status tones. Returns [fg, soft]. */
export function useTone(tone) {
  const t = useTheme(MOD);
  const map = { teal: [t.tint, t.soft], indigo: [t.tint2, t.soft2], ok: [t.c.ok, t.c.okSoft], warn: [t.c.warn, t.c.warnSoft], crit: [t.c.crit, t.c.critSoft] };
  return map[tone] || [t.c.ink, t.c.sunk];
}
/** Map web chip tone names to ui.js Chip tones. */
export const chipTone = (tone) => ({ teal: "acc", indigo: "acc2", ok: "ok", warn: "warn", crit: "crit" }[tone] || "mute");

/** Text with **bold** fragments. */
export function Rich({ text, v = "body", muted, color, style }) {
  const parts = String(text).split("**");
  return (
    <Txt v={v} muted={muted} color={color} style={style}>
      {parts.map((p, i) => (i % 2 ? <Text key={i} style={{ fontFamily: FONTS.bodyBold, fontWeight: FONTS.bodyBold ? undefined : "700" }}>{p}</Text> : p))}
    </Txt>
  );
}

/** Bulleted list where items may contain **bold**. */
export function RichBullets({ items, v = "body", numbered }) {
  const t = useTheme(MOD);
  return (
    <View style={{ gap: 7 }}>
      {items.map((it, i) => (
        <Row key={i} gap={9} center={false}>
          {numbered
            ? <View style={{ width: 20, height: 20, borderRadius: 7, backgroundColor: t.soft, alignItems: "center", justifyContent: "center", marginTop: 1 }}><Txt v="tiny" color={t.tint} style={{ fontFamily: FONTS.monoBold }}>{i + 1}</Txt></View>
            : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.tint, marginTop: v === "body" ? 8 : 6, marginHorizontal: 3 }} />}
          <Rich text={it} v={v} style={{ flex: 1 }} />
        </Row>
      ))}
    </View>
  );
}

/** Sunken panel. */
export function Panel({ children, style, tone, border }) {
  const t = useTheme(MOD); const [fg, soft] = useTone(tone);
  return (
    <View style={[{ backgroundColor: tone && !border ? soft : t.c.sunk, borderRadius: 14, padding: 12, gap: 4 },
      border ? { borderTopWidth: 4, borderTopColor: fg } : null, style]}>{children}</View>
  );
}

/** Title + description tile (the web's sunk "p-3 rounded-xl" boxes). */
export function Tile({ title, desc, tone, titleTone, outline, style }) {
  const t = useTheme(MOD); const [fg] = useTone(titleTone);
  return (
    <View style={[{ backgroundColor: outline ? "transparent" : t.c.sunk, borderWidth: outline ? 1 : 0, borderColor: t.c.line, borderRadius: 14, padding: 12, gap: 4 }, style]}>
      <Txt v="smallB" color={titleTone ? fg : t.c.ink}>{title}</Txt>
      <Txt v="small" muted>{desc}</Txt>
    </View>
  );
}

/** Responsive grid: children wrap with a minimum basis. */
export function Grid({ children, basis = 150, gap = 10 }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap, alignItems: "stretch" }}>
      {React.Children.toArray(children).filter(Boolean).map((c, i) => <View key={i} style={{ flexGrow: 1, flexBasis: basis, minWidth: 0 }}>{c}</View>)}
    </View>
  );
}

/** Heading inside a card. */
export function H({ children, eyebrow, sub, size = "h2" }) {
  return (
    <View style={{ gap: 3 }}>
      {eyebrow ? <Txt v="eyebrow">{eyebrow}</Txt> : null}
      <Txt v={size}>{children}</Txt>
      {sub ? <Txt v="small" muted>{sub}</Txt> : null}
    </View>
  );
}

/** Numeric text field (decimal pad). Stores the raw string; parse with num(). */
export function NumField({ label, value, onChange }) {
  return <Field mod={MOD} label={label} value={value} onChangeText={(x) => onChange(x.replace(/[^\d.,-]/g, ""))} keyboardType="decimal-pad" />;
}

/** Two-column field grid. */
export function FieldGrid({ children }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {React.Children.toArray(children).filter(Boolean).map((c, i) => <View key={i} style={{ flexGrow: 1, flexBasis: 130 }}>{c}</View>)}
    </View>
  );
}

/** White result tile. */
export function ResultTile({ label, value, sub, subColor }) {
  const t = useTheme(MOD);
  return (
    <View style={{ flex: 1, minWidth: 120, backgroundColor: t.c.surface, borderRadius: 14, padding: 12, gap: 2, borderWidth: 1, borderColor: t.c.line }}>
      <Txt v="eyebrow">{label}</Txt>
      <Txt v="h3" style={{ fontFamily: FONTS.monoBold }}>{value}</Txt>
      {sub ? <Txt v="tiny" color={subColor || t.c.muted}>{sub}</Txt> : null}
    </View>
  );
}

/** Gradient result tile. */
export function GradTile({ label, value, sub, big, suffix, style }) {
  return (
    <Grad mod={MOD} style={[{ flex: 1, minWidth: 120, borderRadius: 16, padding: big ? 16 : 12, gap: 3, overflow: "hidden" }, style]}>
      <View style={{ position: "absolute", width: 120, height: 120, borderRadius: 60, right: -40, top: -50, backgroundColor: "rgba(255,255,255,0.14)" }} />
      <Txt v="eyebrow" color="rgba(255,255,255,0.88)">{label}</Txt>
      <Txt v={big ? "h1" : "h3"} color="#fff" style={big ? null : { fontFamily: FONTS.monoBold }}>
        {value}{suffix ? <Txt v="bodyB" color="#fff">{suffix}</Txt> : null}
      </Txt>
      {sub ? <Txt v="tiny" color="rgba(255,255,255,0.92)">{sub}</Txt> : null}
    </Grad>
  );
}

/** Label + bar + amount row. */
export function BarRow({ label, value, pct }) {
  return (
    <View style={{ gap: 5 }}>
      <Row>
        <Txt v="small" style={{ flex: 1 }}>{label}</Txt>
        <Txt v="mono">{money(value)}</Txt>
      </Row>
      <Bar mod={MOD} pct={pct} height={8} />
    </View>
  );
}

/** Card heading with a gradient icon tile. */
export function IconHead({ icon, children }) {
  return (
    <Row gap={10}>
      <Grad mod={MOD} style={{ width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={18} color="#fff" /></Grad>
      <Txt v="h3" style={{ flex: 1 }}>{children}</Txt>
    </Row>
  );
}
