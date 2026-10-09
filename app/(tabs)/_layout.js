import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, Grad } from "../../src/ui";
import { useTheme, FONTS, tabColor } from "../../src/theme";

const TABS = [
  ["index", "Today", "LayoutDashboard", "home"],
  ["roadmap", "Roadmap", "Map", "roadmap"],
  ["nclex", "NCLEX", "Brain", "nclex"],
  ["prep", "English", "Languages", "bedside"],
  ["visa", "Visa", "Plane", "imm"],
  ["more", "More", "LayoutGrid", "more"],
];

// Each bottom tab keeps its own fixed color in every theme and in light or dark mode (see TAB_COLORS).
function TabIcon({ name, index, focused }) {
  const t = useTheme(); const c = tabColor(index, t.dark);
  if (!focused) return <Icon name={name} size={21} color={c.fg} />;
  return <View style={{ width: 44, height: 30, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: c.fill }}><Icon name={name} size={19} color={c.onFill} /></View>;
}

export default function TabLayout() {
  const t = useTheme(); const ins = useSafeAreaInsets();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: t.c.ink, tabBarInactiveTintColor: t.c.muted,
      tabBarLabelStyle: { fontFamily: FONTS.bodyBold, fontSize: 10.5 },
      // Six equal columns on every phone; labels always sit under the icon (also on wide screens and landscape).
      tabBarItemStyle: { flex: 1 }, tabBarLabelPosition: "below-icon",
      tabBarStyle: { backgroundColor: t.c.surface, borderTopColor: t.c.line, height: 62 + ins.bottom, paddingTop: 6, paddingBottom: Math.max(ins.bottom, 8) },
    }}>
      {TABS.map(([route, label, icon], i) => {
        const c = tabColor(i, t.dark);
        return (
          <Tabs.Screen key={route} name={route} options={{ title: label, tabBarActiveTintColor: c.fg, tabBarInactiveTintColor: c.fg,
            tabBarIcon: ({ focused }) => <TabIcon name={icon} index={i} focused={focused} /> }} />
        );
      })}
    </Tabs>
  );
}
