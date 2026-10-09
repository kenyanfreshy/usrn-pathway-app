import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, Grad } from "../../src/ui";
import { useTheme, FONTS } from "../../src/theme";

const TABS = [
  ["index", "Today", "LayoutDashboard", "home"],
  ["roadmap", "Roadmap", "Map", "roadmap"],
  ["nclex", "NCLEX", "Brain", "nclex"],
  ["visa", "Visa", "Plane", "imm"],
  ["more", "More", "LayoutGrid", "more"],
];

function TabIcon({ name, mod, focused }) {
  const t = useTheme(mod);
  if (!focused) return <Icon name={name} size={21} color={t.tint} />;
  return <Grad mod={mod} style={{ width: 44, height: 30, borderRadius: 12, alignItems: "center", justifyContent: "center" }}><Icon name={name} size={19} color="#fff" /></Grad>;
}

export default function TabLayout() {
  const t = useTheme(); const ins = useSafeAreaInsets();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: t.c.ink, tabBarInactiveTintColor: t.c.muted,
      tabBarLabelStyle: { fontFamily: FONTS.bodyBold, fontSize: 11 },
      tabBarStyle: { backgroundColor: t.c.surface, borderTopColor: t.c.line, height: 62 + ins.bottom, paddingTop: 6, paddingBottom: Math.max(ins.bottom, 8) },
    }}>
      {TABS.map(([route, label, icon, mod]) => (
        <Tabs.Screen key={route} name={route} options={{ title: label, tabBarIcon: ({ focused }) => <TabIcon name={icon} mod={mod} focused={focused} /> }} />
      ))}
    </Tabs>
  );
}
