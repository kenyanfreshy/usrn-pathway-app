// UI kit: every screen builds from these pieces so the look stays consistent.
import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Modal, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { ICONS } from "./icons";
import { useTheme, FONTS, mix } from "./theme";

export const tap = () => { try { Haptics.selectionAsync(); } catch (e) {} };
export const buzz = () => { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {} };

export function Icon({ name, size = 18, color, strokeWidth = 2 }) {
  const C = ICONS[name] || ICONS.Circle;
  return <C size={size} color={color} strokeWidth={strokeWidth} />;
}

const SIZES = {
  hero: { fontSize: 34, lineHeight: 38, f: "displayX" }, h1: { fontSize: 26, lineHeight: 31, f: "displayX" }, h2: { fontSize: 21, lineHeight: 26, f: "display" },
  h3: { fontSize: 17, lineHeight: 22, f: "display" }, body: { fontSize: 15, lineHeight: 22, f: "body" }, bodyB: { fontSize: 15, lineHeight: 22, f: "bodyBold" },
  small: { fontSize: 13, lineHeight: 18, f: "body" }, smallB: { fontSize: 13, lineHeight: 18, f: "bodySemi" }, tiny: { fontSize: 11.5, lineHeight: 15, f: "body" },
  eyebrow: { fontSize: 10.5, lineHeight: 14, f: "monoBold", ls: 1.2, upper: true }, mono: { fontSize: 13, lineHeight: 18, f: "mono" }, big: { fontSize: 38, lineHeight: 42, f: "displayX" },
};
/** Txt v="h1|h2|h3|body|bodyB|small|smallB|tiny|eyebrow|mono|big|hero" muted color */
export function Txt({ v = "body", muted, color, style, children, ...rest }) {
  const t = useTheme(); const s = SIZES[v] || SIZES.body;
  return (
    <Text {...rest} style={[{ fontSize: s.fontSize, lineHeight: s.lineHeight, color: color || (muted || v === "eyebrow" ? t.c.muted : t.c.ink), fontFamily: FONTS[s.f], letterSpacing: s.ls || 0, textTransform: s.upper ? "uppercase" : "none", fontWeight: FONTS[s.f] ? undefined : (/display|Bold|Semi/.test(s.f) ? "700" : "400") }, style]}>
      {children}
    </Text>
  );
}

export function Screen({ mod = "home", children, scroll = true, pad = true, header }) {
  const t = useTheme(mod); const ins = useSafeAreaInsets();
  const body = <View style={{ padding: pad ? 16 : 0, paddingTop: (pad ? 12 : 0), paddingBottom: 40, gap: 16 }}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: t.c.bg, paddingTop: ins.top }}>
      <LinearGradient colors={[t.soft, t.c.bg]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 0.45 }} pointerEvents="none" />
      {header}
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">{body}</ScrollView> : body}
    </View>
  );
}

export function Row({ children, gap = 8, wrap, style, center = true }) {
  return <View style={[{ flexDirection: "row", alignItems: center ? "center" : "flex-start", gap, flexWrap: wrap ? "wrap" : "nowrap" }, style]}>{children}</View>;
}

/**
 * Responsive grid. Lays children out in rows of equal-width columns, each at least `min` wide.
 * Uses plain (non-wrapping) rows because React Native mis-measures flexWrap rows whose children
 * grow, which made later content draw on top of the tiles.
 */
export function Grid({ children, min = 150, gap = 10, inset = 64, style }) {
  const { width: win } = useWindowDimensions();
  const [w, setW] = useState(0);
  const items = React.Children.toArray(children).filter(Boolean);
  const width = w || Math.max(0, win - inset);
  const cols = Math.max(1, Math.min(items.length || 1, Math.floor((width + gap) / (min + gap))));
  const rows = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={[{ gap }, style]} onLayout={(e) => { const nw = Math.round(e.nativeEvent.layout.width); if (nw && Math.abs(nw - w) > 1) setW(nw); }}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap, alignItems: "stretch" }}>
          {r.map((c, ci) => <View key={c.key != null ? c.key : ci} style={{ flex: 1, minWidth: 0 }}>{c}</View>)}
          {Array.from({ length: cols - r.length }, (_, k) => <View key={"pad" + k} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

export function Card({ children, style, onPress, mod, accent, padding = 16 }) {
  const t = useTheme(mod);
  const st = [{ backgroundColor: t.c.surface, borderRadius: 18, borderWidth: 1, borderColor: accent ? t.tint : t.c.line, padding, gap: 10,
    shadowColor: t.dark ? "#000" : t.acc[0], shadowOpacity: t.dark ? 0.35 : 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 }, style];
  if (!onPress) return <View style={st}>{children}</View>;
  return <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => [st, pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 }]}>{children}</Pressable>;
}

export function Grad({ mod, colors, style, children, start = { x: 0, y: 0 }, end = { x: 1, y: 1 } }) {
  const t = useTheme(mod);
  return <LinearGradient colors={colors || t.acc} start={start} end={end} style={style}>{children}</LinearGradient>;
}

export function IconTile({ mod, icon, size = 40, colors }) {
  return (
    <Grad mod={mod} colors={colors} style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: "center", justifyContent: "center" }}>
      <Icon name={icon} size={size * 0.5} color="#fff" />
    </Grad>
  );
}

/** Gradient hero banner at the top of a module. stats: [[label, value], ...] */
export function Hero({ mod, icon, eyebrow, title, sub, stats, children }) {
  return (
    <Grad mod={mod} style={{ borderRadius: 26, padding: 20, gap: 14, overflow: "hidden" }}>
      <View style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, right: -70, top: -100, backgroundColor: "rgba(255,255,255,0.14)" }} />
      <View style={{ position: "absolute", width: 120, height: 120, borderRadius: 60, right: 70, bottom: -70, backgroundColor: "rgba(255,255,255,0.09)" }} />
      <Row gap={14} center={false}>
        {icon ? <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={25} color="#fff" /></View> : null}
        <View style={{ flex: 1, gap: 6 }}>
          {eyebrow ? <Txt v="eyebrow" color="rgba(255,255,255,0.85)">{eyebrow}</Txt> : null}
          <Txt v="h1" color="#fff">{title}</Txt>
          {sub ? <Txt v="body" color="rgba(255,255,255,0.92)">{sub}</Txt> : null}
        </View>
      </Row>
      {stats ? (
        <Row wrap gap={8}>
          {stats.map(([k, v]) => (
            <View key={k} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" }}>
              <Txt v="eyebrow" color="rgba(255,255,255,0.85)">{k}</Txt>
              <Txt v="h3" color="#fff">{String(v)}</Txt>
            </View>
          ))}
        </Row>
      ) : null}
      {children}
    </Grad>
  );
}

export function Btn({ title, icon, onPress, kind = "primary", mod, disabled, small, full, style }) {
  const t = useTheme(mod);
  const inner = (
    <Row gap={6} style={{ justifyContent: "center" }}>
      {icon ? <Icon name={icon} size={small ? 15 : 17} color={kind === "primary" ? "#fff" : kind === "danger" ? t.c.crit : t.c.ink} /> : null}
      {title ? <Txt v={small ? "smallB" : "bodyB"} color={kind === "primary" ? "#fff" : kind === "danger" ? t.c.crit : t.c.ink}>{title}</Txt> : null}
    </Row>
  );
  const pad = { paddingVertical: small ? 8 : 12, paddingHorizontal: small ? 12 : 16, borderRadius: 13 };
  return (
    <Pressable disabled={disabled} onPress={() => { tap(); onPress && onPress(); }} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => [{ opacity: disabled ? 0.45 : 1, alignSelf: full ? "stretch" : "flex-start", transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}>
      {kind === "primary"
        ? <Grad mod={mod} style={pad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>{inner}</Grad>
        : <View style={[pad, { backgroundColor: kind === "ghost" ? "transparent" : t.c.surface, borderWidth: 1, borderColor: kind === "danger" ? t.c.crit : t.c.line }]}>{inner}</View>}
    </Pressable>
  );
}

export function Chip({ text, tone = "mute", icon, mod, onPress, active }) {
  const t = useTheme(mod);
  const map = { ok: [t.c.okSoft, t.c.ok], warn: [t.c.warnSoft, t.c.warn], crit: [t.c.critSoft, t.c.crit], acc: [t.soft, t.tint], acc2: [t.soft2, t.tint2], mute: [t.c.sunk, t.c.muted] };
  const [bg, fg] = map[tone] || map.mute;
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start", borderWidth: active ? 1.5 : 0, borderColor: fg }}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 11.5, fontFamily: FONTS.monoBold, fontWeight: FONTS.monoBold ? undefined : "700" }}>{text}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={() => { tap(); onPress(); }}>{body}</Pressable> : body;
}

// True when children are only strings/numbers (e.g. `Saves {x} today`), which must be wrapped in <Text> on native.
const isTextish = (ch) => typeof ch === "string" || typeof ch === "number" || (Array.isArray(ch) && ch.length > 0 && ch.every((c) => typeof c === "string" || typeof c === "number"));

export function Note({ tone = "acc", icon = "Info", title, children, mod }) {
  const t = useTheme(mod);
  const map = { acc: [t.soft, t.tint], ok: [t.c.okSoft, t.c.ok], warn: [t.c.warnSoft, t.c.warn], crit: [t.c.critSoft, t.c.crit], acc2: [t.soft2, t.tint2] };
  const [bg, fg] = map[tone] || map.acc;
  return (
    <View style={{ flexDirection: "row", gap: 10, backgroundColor: bg, borderRadius: 14, padding: 12 }}>
      <View style={{ paddingTop: 2 }}><Icon name={icon} size={16} color={fg} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        {title ? <Txt v="smallB" color={fg}>{title}</Txt> : null}
        {isTextish(children) ? <Txt v="small">{children}</Txt> : children}
      </View>
    </View>
  );
}

export function Bar({ pct = 0, mod, height = 9 }) {
  const t = useTheme(mod);
  return (
    <View style={{ height, borderRadius: 99, backgroundColor: t.c.sunk, overflow: "hidden" }}>
      <Grad mod={mod} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.max(0, Math.min(100, pct * 100))}%`, height: "100%", borderRadius: 99 }} />
    </View>
  );
}

/** Segmented control (scrolls horizontally when it doesn't fit). options: [{id,label,icon}] */
export function Seg({ value, onChange, options, mod }) {
  const t = useTheme(mod);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, padding: 4, backgroundColor: t.c.sunk, borderRadius: 16, borderWidth: 1, borderColor: t.c.line }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable key={o.id} onPress={() => { tap(); onChange(o.id); }} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: on ? t.c.surface : "transparent", borderWidth: on ? 1 : 0, borderColor: t.c.line }}>
            {o.icon ? <Icon name={o.icon} size={15} color={on ? t.tint : t.c.muted} /> : null}
            <Txt v="smallB" color={on ? t.tint : t.c.muted}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Accordion({ title, meta, children, defaultOpen, mod }) {
  const t = useTheme(mod); const [open, setOpen] = useState(!!defaultOpen);
  return (
    <Card mod={mod} padding={0} style={{ gap: 0 }}>
      <Pressable onPress={() => { tap(); setOpen(!open); }} style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 10 }} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Txt v="bodyB" style={{ flex: 1 }}>{title}</Txt>
        {meta}
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} color={t.c.muted} />
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>{children}</View> : null}
    </Card>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType, multiline, mono, error, hint, mod, maxLength, autoCapitalize, style }) {
  const t = useTheme(mod); const [focus, setFocus] = useState(false);
  return (
    <View style={[{ gap: 5 }, style]}>
      {label ? <Txt v="smallB" muted>{label}</Txt> : null}
      <TextInput value={value == null ? "" : String(value)} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={t.c.muted}
        keyboardType={keyboardType} multiline={multiline} maxLength={maxLength} autoCapitalize={autoCapitalize}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ borderWidth: 1.5, borderColor: error ? t.c.crit : focus ? t.tint : t.c.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 12 : 9,
          color: t.c.ink, backgroundColor: t.c.surface, fontSize: 15, fontFamily: mono ? FONTS.mono : FONTS.body, minHeight: multiline ? 84 : undefined, textAlignVertical: multiline ? "top" : "center" }} />
      {error ? <Txt v="tiny" color={t.c.crit}>{error}</Txt> : hint ? <Txt v="tiny" muted>{hint}</Txt> : null}
    </View>
  );
}

/** Date entry as YYYY-MM-DD with validation (no extra native date-picker dependency). */
export function DateField({ label, value, onChange, mod }) {
  const ok = !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
  return <Field mod={mod} label={label} value={value} onChangeText={(v) => onChange(v.replace(/[^\d-]/g, "").slice(0, 10))} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" mono error={ok ? null : "Use the format 2026-05-31"} />;
}

export function Sheet({ visible, onClose, title, children, mod }) {
  const t = useTheme(mod); const ins = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(5,8,20,0.55)" }} onPress={onClose} />
      <View style={{ maxHeight: "88%", backgroundColor: t.c.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingBottom: ins.bottom + 10 }}>
        <Row style={{ padding: 16, paddingBottom: 8 }}>
          <Txt v="h2" style={{ flex: 1 }}>{title}</Txt>
          <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={12} style={{ padding: 6, borderRadius: 99, backgroundColor: t.c.sunk }}><Icon name="X" size={18} color={t.c.ink} /></Pressable>
        </Row>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 12 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </Modal>
  );
}

/** Dropdown: tap to open a sheet of options. options: [{value,label}] or strings */
export function Select({ label, value, options, onChange, placeholder = "Choose…", mod }) {
  const t = useTheme(mod); const [open, setOpen] = useState(false);
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const cur = opts.find((o) => o.value === value);
  return (
    <View style={{ gap: 5 }}>
      {label ? <Txt v="smallB" muted>{label}</Txt> : null}
      <Pressable onPress={() => { tap(); setOpen(true); }} accessibilityRole="button" accessibilityLabel={label}
        style={{ flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: t.c.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: t.c.surface }}>
        <Txt v="body" style={{ flex: 1 }} color={cur ? t.c.ink : t.c.muted} numberOfLines={1}>{cur ? cur.label : placeholder}</Txt>
        <Icon name="ChevronDown" size={17} color={t.c.muted} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label || "Choose"} mod={mod}>
        {opts.map((o) => (
          <Pressable key={String(o.value)} onPress={() => { tap(); onChange(o.value); setOpen(false); }}
            style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, backgroundColor: o.value === value ? t.soft : t.c.surface, borderWidth: 1, borderColor: o.value === value ? t.tint : t.c.line }}>
            <Txt v="body" style={{ flex: 1 }}>{o.label}</Txt>
            {o.value === value ? <Icon name="Check" size={18} color={t.tint} /> : null}
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}

export function Check({ checked, onToggle, label, sub, disabled, mod, strike }) {
  const t = useTheme(mod);
  return (
    <Pressable disabled={disabled} onPress={() => { tap(); onToggle && onToggle(); }} accessibilityRole="checkbox" accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", opacity: disabled ? 0.5 : 1, paddingVertical: 4 }}>
      <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: checked ? t.tint : t.c.line, backgroundColor: checked ? t.tint : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {checked ? <Icon name="Check" size={14} color="#fff" strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Txt v="body" color={checked && strike ? t.c.muted : t.c.ink} style={checked && strike ? { textDecorationLine: "line-through" } : null}>{label}</Txt>
        {sub ? <Txt v="small" muted>{sub}</Txt> : null}
      </View>
    </Pressable>
  );
}

/** Answer option. state: null | "sel" | "right" | "wrong" */
export function Option({ letter, label, why, state, onPress, disabled, mod, multi }) {
  const t = useTheme(mod);
  const col = state === "right" ? [t.c.okSoft, t.c.ok] : state === "wrong" ? [t.c.critSoft, t.c.crit] : state === "sel" ? [t.soft, t.tint] : [t.c.surface, t.c.line];
  return (
    <Pressable disabled={disabled} onPress={() => { tap(); onPress && onPress(); }} accessibilityRole={multi ? "checkbox" : "radio"} accessibilityState={{ checked: state === "sel" || state === "right" }}
      style={{ flexDirection: "row", gap: 10, padding: 13, borderRadius: 14, borderWidth: 1.5, borderColor: col[1], backgroundColor: col[0] }}>
      {letter ? <Txt v="mono" style={{ width: 16, textTransform: "uppercase", fontFamily: FONTS.monoBold }}>{letter}</Txt> : null}
      <View style={{ flex: 1, gap: 4 }}>
        <Txt v="body">{label}</Txt>
        {why ? <Txt v="small" muted>{why}</Txt> : null}
      </View>
    </Pressable>
  );
}

export function Stat({ label, value, mod, tone }) {
  const t = useTheme(mod);
  return (
    <View style={{ flex: 1, minWidth: 96, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk, gap: 2 }}>
      <Txt v="eyebrow">{label}</Txt>
      <Txt v="h3" color={tone ? t.c[tone] : t.c.ink}>{String(value)}</Txt>
    </View>
  );
}

export function SectionTitle({ eyebrow, title, sub }) {
  return (
    <View style={{ gap: 4 }}>
      {eyebrow ? <Txt v="eyebrow">{eyebrow}</Txt> : null}
      <Txt v="h2">{title}</Txt>
      {sub ? <Txt v="small" muted>{sub}</Txt> : null}
    </View>
  );
}

export function Bullets({ items, numbered }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((it, i) => (
        <Row key={i} gap={8} center={false}>
          <Txt v="body" muted style={{ width: numbered ? 20 : 12 }}>{numbered ? i + 1 + "." : "•"}</Txt>
          {typeof it === "string" ? <Txt v="body" style={{ flex: 1 }}>{it}</Txt> : <View style={{ flex: 1 }}>{it}</View>}
        </Row>
      ))}
    </View>
  );
}

export function CopyButton({ text, label = "Copy", mod }) {
  const [done, setDone] = useState(false);
  return <Btn small kind="secondary" mod={mod} icon={done ? "Check" : "Copy"} title={done ? "Copied" : label} onPress={async () => { try { await Clipboard.setStringAsync(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch (e) {} }} />;
}

export function Divider() { const t = useTheme(); return <View style={{ height: 1, backgroundColor: t.c.line }} />; }

export const softOf = (hex, dark) => mix(hex, dark ? "#111527" : "#ffffff", dark ? 0.78 : 0.88);
