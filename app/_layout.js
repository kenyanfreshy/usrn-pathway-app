import React, { useEffect, useState } from "react";
import { View, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useApp } from "../src/state";
import { ProProvider } from "../src/pro";
import { FONTS, useTheme } from "../src/theme";
import { Overlays } from "../src/overlays";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Load fonts defensively: pick the weights that exist in each package, fall back to system fonts if any are missing.
function fontMap() {
  const map = {}; const set = (slot, mod, suffix) => {
    if (!mod) return; const key = Object.keys(mod).find((k) => k.endsWith(suffix) && typeof mod[k] !== "function");
    if (key) { map[key] = mod[key]; FONTS[slot] = key; }
  };
  let BG = null, FT = null, JB = null;
  try { BG = require("@expo-google-fonts/bricolage-grotesque"); } catch (e) {}
  try { FT = require("@expo-google-fonts/figtree"); } catch (e) {}
  try { JB = require("@expo-google-fonts/jetbrains-mono"); } catch (e) {}
  set("display", BG, "_700Bold"); set("displayX", BG, "_800ExtraBold");
  set("body", FT, "_400Regular"); set("bodyMed", FT, "_500Medium"); set("bodySemi", FT, "_600SemiBold"); set("bodyBold", FT, "_700Bold");
  set("mono", JB, "_500Medium"); set("monoBold", JB, "_700Bold");
  if (!FONTS.displayX) FONTS.displayX = FONTS.display;
  return map;
}

function Shell() {
  const { ready } = useApp(); const t = useTheme(); const [fonts, setFonts] = useState(false);
  useEffect(() => {
    const map = fontMap();
    Font.loadAsync(map).catch(() => { Object.keys(FONTS).forEach((k) => { FONTS[k] = undefined; }); }).finally(() => setFonts(true));
  }, []);
  useEffect(() => { if (ready && fonts) SplashScreen.hideAsync().catch(() => {}); }, [ready, fonts]);
  if (!ready || !fonts) return <View style={{ flex: 1, backgroundColor: t.c.bg }} />;
  return (
    <View style={{ flex: 1, backgroundColor: t.c.bg }}>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
        <Stack.Screen name="badges" options={{ presentation: "modal" }} />
      </Stack>
      <Overlays />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ProProvider>
          <Shell />
        </ProProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
