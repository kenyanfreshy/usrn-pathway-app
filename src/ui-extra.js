// Small shared pieces used by pushed screens.
import React from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Row, Txt, Icon, tap } from "./ui";
import { useTheme } from "./theme";
export { Medal } from "./overlays";

/** Back button row for screens pushed onto the stack (not tabs). */
export function BackRow({ title, mod }) {
  const t = useTheme(mod);
  return (
    <Row gap={10}>
      <Pressable onPress={() => { tap(); if (router.canGoBack()) router.back(); else router.replace("/"); }} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}
        style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.c.surface, borderWidth: 1, borderColor: t.c.line, alignItems: "center", justifyContent: "center" }}>
        <Icon name="ChevronLeft" size={20} color={t.c.ink} />
      </Pressable>
      {title ? <Txt v="h3" style={{ flex: 1 }}>{title}</Txt> : null}
    </Row>
  );
}

/** "Sources & references" link shown under each question's rationale. Opens Settings → References & Study Resources.
 *  `before` closes a sheet first (a modal sheet would otherwise stay on top of the new screen). */
export function SourcesLink({ mod, before, tab = "standards" }) {
  const t = useTheme(mod);
  const go = () => {
    tap();
    if (before) { before(); setTimeout(() => router.push({ pathname: "/references", params: { tab } }), 350); }
    else router.push({ pathname: "/references", params: { tab } });
  };
  return (
    <Pressable onPress={go} accessibilityRole="link" accessibilityLabel="Sources and references for this question" hitSlop={8}
      style={({ pressed }) => ({ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, opacity: pressed ? 0.6 : 1 })}>
      <Icon name="BookOpenCheck" size={16} color={t.tint} />
      <Txt v="smallB" color={t.tint}>Sources & references</Txt>
      <Icon name="ChevronRight" size={15} color={t.tint} />
    </Pressable>
  );
}
