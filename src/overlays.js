// App-wide overlays: badge / level-up celebrations with confetti, and the "+XP" toast.
import React, { useEffect, useMemo, useRef } from "react";
import { View, Modal, Animated, Easing, Dimensions, Share } from "react-native";
import { useApp, BADGES, BADGE_HUES } from "./state";
import { destOf, destId } from "./data/global";
import { useTheme } from "./theme";
import { Txt, Btn, Icon, Grad, Row, buzz } from "./ui";

export function Medal({ badge, idx = 0, size = 64, locked }) {
  const h = BADGE_HUES[idx % BADGE_HUES.length]; const t = useTheme();
  if (locked) return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.c.sunk, borderWidth: 1, borderColor: t.c.line, alignItems: "center", justifyContent: "center" }}><Icon name="Lock" size={size * 0.38} color={t.c.muted} /></View>;
  return (
    <Grad colors={h} style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" }}>
      <Icon name={badge.icon} size={size * 0.42} color="#fff" />
    </Grad>
  );
}

function Confetti({ run }) {
  const { width, height } = Dimensions.get("window");
  const pieces = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ x: Math.random() * width, delay: Math.random() * 400, rot: Math.random() * 360, color: ["#0891b2", "#10b981", "#f59e0b", "#e11d48", "#9333ea", "#4f46e5", "#ea580c"][i % 7], w: 6 + Math.random() * 6 })), [run]);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { anim.setValue(0); Animated.timing(anim, { toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(); }, [run]);
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width, height }}>
      {pieces.map((p, i) => (
        <Animated.View key={i} style={{ position: "absolute", left: p.x, top: -20, width: p.w, height: p.w * 0.5, backgroundColor: p.color, borderRadius: 2,
          opacity: anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, height * (0.6 + (i % 5) * 0.08)] }) }, { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: [`${p.rot}deg`, `${p.rot + 540}deg`] }) }] }} />
      ))}
    </View>
  );
}

function Toast() {
  const { toast, clearToast } = useApp(); const t = useTheme();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!toast) return;
    a.setValue(0);
    Animated.sequence([Animated.spring(a, { toValue: 1, useNativeDriver: true }), Animated.delay(1200), Animated.timing(a, { toValue: 0, duration: 250, useNativeDriver: true })]).start(() => clearToast());
  }, [toast && toast.k]);
  if (!toast) return null;
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", top: 60, alignSelf: "center", opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }, { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}>
      <Grad colors={t.acc} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99 }}>
        <Icon name="Zap" size={15} color="#fff" /><Txt v="h3" color="#fff">{toast.text}</Txt>
      </Grad>
    </Animated.View>
  );
}

export function Overlays() {
  const { celebrate, popCelebrate, m, lvl, state } = useApp(); const t = useTheme();
  const item = celebrate[0];
  useEffect(() => { if (item) buzz(); }, [item]);
  const share = () => Share.share({ message: `I'm ${Math.round(m.roadPct * 100)}% through my journey to the ${destOf(destId(state)).short} bedside. Level: ${lvl.name}. Streak: ${m.streak} ${m.streak === 1 ? "day" : "days"}. I'm tracking it with NurseBound.` }).catch(() => {});
  return (
    <>
      <Toast />
      <Modal visible={!!item} transparent animationType="fade" onRequestClose={popCelebrate}>
        <View style={{ flex: 1, backgroundColor: "rgba(5,8,20,0.6)", alignItems: "center", justifyContent: "center", padding: 24 }}>
          {item ? <Confetti run={celebrate.length} /> : null}
          {item ? (
            <View style={{ backgroundColor: t.c.surface, borderRadius: 26, padding: 26, alignItems: "center", gap: 10, width: "100%", maxWidth: 380 }}>
              <Txt v="eyebrow">{item.pro ? "NurseBound Pro" : item.badge ? "Achievement unlocked" : "Level up"}</Txt>
              {item.pro ? <Grad colors={["#0891b2", "#10b981"]} style={{ width: 108, height: 108, borderRadius: 32, alignItems: "center", justifyContent: "center" }}><Icon name="PartyPopper" size={50} color="#fff" /></Grad>
                : item.badge ? <Medal badge={item.badge} idx={Math.max(0, BADGES.findIndex((b) => b.id === item.badge.id))} size={108} /> : <Grad colors={["#2563eb", "#c026d3"]} style={{ width: 108, height: 108, borderRadius: 32, alignItems: "center", justifyContent: "center" }}><Icon name="Crown" size={50} color="#fff" /></Grad>}
              <Txt v="h1" style={{ textAlign: "center" }}>{item.pro ? item.pro.title : item.badge ? item.badge.name : item.level}</Txt>
              <Txt v="body" muted style={{ textAlign: "center" }}>{item.pro ? item.pro.body : item.badge ? item.badge.desc : "You reached a new level. Keep the momentum going."}</Txt>
              {item.pro ? <Btn icon="ArrowRight" title="Start Studying" onPress={popCelebrate} full style={{ marginTop: 6 }} /> : <Row gap={10} style={{ marginTop: 6 }}>
                <Btn kind="secondary" icon="Share2" title="Share" onPress={share} />
                <Btn icon="Check" title="Keep Going" onPress={popCelebrate} />
              </Row>}
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
