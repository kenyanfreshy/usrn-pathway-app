// Countdown timer for speaking practice: runs through phases (e.g. 3 min prep, then 5 min role-play).
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Row, Txt, Btn, buzz } from "../ui";
import { useTheme, FONTS } from "../theme";

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** phases: [[label, seconds], ...] */
export function PhaseTimer({ phases, mod }) {
  const t = useTheme(mod);
  const [i, setI] = useState(0); const [left, setLeft] = useState(phases[0][1]); const [on, setOn] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!on) return;
    ref.current = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(ref.current);
  }, [on]);
  useEffect(() => {
    if (left > 0) return;
    buzz();
    if (i < phases.length - 1) { setI(i + 1); setLeft(phases[i + 1][1]); }
    else { setOn(false); setLeft(0); }
  }, [left]);
  const reset = () => { setOn(false); setI(0); setLeft(phases[0][1]); };
  const done = !on && i === phases.length - 1 && left === 0;
  const pct = 1 - left / phases[i][1];
  return (
    <View style={{ padding: 14, borderRadius: 16, backgroundColor: t.soft, gap: 10 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Txt v="eyebrow" color={t.tint}>{done ? "Time's up" : `${phases[i][0]} · step ${i + 1} of ${phases.length}`}</Txt>
        <Txt v="h2" color={t.tint} style={{ fontFamily: FONTS.monoBold }} accessibilityLiveRegion="polite">{mmss(Math.max(0, left))}</Txt>
      </Row>
      <View style={{ height: 8, borderRadius: 99, backgroundColor: t.c.surface, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%`, backgroundColor: t.tint }} />
      </View>
      <Row wrap gap={8}>
        {!done ? <Btn mod={mod} small icon={on ? "Timer" : "Play"} title={on ? "Pause" : i === 0 && left === phases[0][1] ? "Start" : "Resume"} onPress={() => setOn(!on)} /> : null}
        {on && i < phases.length - 1 ? <Btn mod={mod} small kind="secondary" icon="ArrowRight" title={`Skip to ${phases[i + 1][0]}`} onPress={() => { setI(i + 1); setLeft(phases[i + 1][1]); }} /> : null}
        <Btn mod={mod} small kind="secondary" icon="RotateCcw" title="Reset" onPress={reset} />
      </Row>
      <Txt v="tiny" muted>{phases.map(([l, s]) => `${l} ${mmss(s)}`).join(" → ")}</Txt>
    </View>
  );
}
