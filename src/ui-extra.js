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
