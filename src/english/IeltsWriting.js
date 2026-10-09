// IELTS Academic Writing: Task 1 healthcare charts (drawn with SVG) with Band 7+ models, Task 2 essay plans,
// and a vocabulary booster.
import React, { useState } from "react";
import { View } from "react-native";
import Svg, { Rect, Line, Polyline, Circle, Text as SvgText } from "react-native-svg";
import { Card, Row, Txt, Btn, Note, Seg, Accordion, Bullets, CopyButton } from "../ui";
import { useTheme, FONTS } from "../theme";
import P from "../data/english-practice.json";

const COLORS = ["#2563eb", "#ea580c", "#059669", "#9333ea"];

/** Bar chart: one group per category, one bar per series, each series on its own scale (labels show values). */
function Bars({ d, w, t }) {
  const H = 210, padL = 8, padB = 34, padT = 18, innerW = w - padL * 2, innerH = H - padB - padT;
  const gw = innerW / d.categories.length; const bw = Math.min(22, (gw - 10) / d.series.length);
  const maxes = d.series.map((s) => Math.max(...s.values) || 1);
  return (
    <Svg width={w} height={H}>
      <Line x1={padL} y1={H - padB} x2={w - padL} y2={H - padB} stroke={t.c.line} strokeWidth={1} />
      {d.categories.map((c, ci) => {
        const x0 = padL + ci * gw + (gw - bw * d.series.length) / 2;
        return (
          <React.Fragment key={c}>
            {d.series.map((s, si) => {
              const h = (s.values[ci] / maxes[si]) * innerH; const x = x0 + si * bw;
              return (
                <React.Fragment key={s.name}>
                  <Rect x={x + 1} y={H - padB - h} width={bw - 2} height={h} rx={3} fill={COLORS[si % COLORS.length]} />
                  <SvgText x={x + bw / 2} y={H - padB - h - 4} fontSize={9} fill={t.c.ink} textAnchor="middle" fontFamily={FONTS.mono}>{s.values[ci]}</SvgText>
                </React.Fragment>
              );
            })}
            <SvgText x={padL + ci * gw + gw / 2} y={H - padB + 16} fontSize={10} fill={t.c.muted} textAnchor="middle">{c}</SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function Lines({ d, w, t }) {
  const H = 210, padL = 30, padR = 10, padB = 30, padT = 12, innerW = w - padL - padR, innerH = H - padB - padT;
  const all = d.series.flatMap((s) => s.values); const lo = Math.floor(Math.min(...all) - 1), hi = Math.ceil(Math.max(...all) + 1);
  const x = (i) => padL + (i / Math.max(1, d.categories.length - 1)) * innerW;
  const y = (v) => padT + (1 - (v - lo) / (hi - lo || 1)) * innerH;
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  return (
    <Svg width={w} height={H}>
      {ticks.map((v) => (
        <React.Fragment key={v}>
          <Line x1={padL} y1={y(v)} x2={w - padR} y2={y(v)} stroke={t.c.line} strokeWidth={1} />
          <SvgText x={padL - 4} y={y(v) + 3} fontSize={9} fill={t.c.muted} textAnchor="end" fontFamily={FONTS.mono}>{v}</SvgText>
        </React.Fragment>
      ))}
      {d.series.map((s, si) => (
        <React.Fragment key={s.name}>
          <Polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth={2.5} />
          {s.values.map((v, i) => <Circle key={i} cx={x(i)} cy={y(v)} r={2.8} fill={COLORS[si % COLORS.length]} />)}
        </React.Fragment>
      ))}
      {d.categories.map((c, i) => (i % 2 === 0 || d.categories.length <= 6 ? <SvgText key={c} x={x(i)} y={H - 10} fontSize={9} fill={t.c.muted} textAnchor="middle">{c}</SvgText> : null))}
    </Svg>
  );
}

function Task1({ mod }) {
  const t = useTheme(mod); const [id, setId] = useState(P.task1[0].id); const [w, setW] = useState(0); const [show, setShow] = useState(false);
  const d = P.task1.find((x) => x.id === id);
  return (
    <Card mod={mod} style={{ gap: 12 }}>
      <Txt v="eyebrow">Task 1 · at least 150 words · 20 minutes</Txt>
      <Seg mod={mod} even value={id} onChange={(v) => { setId(v); setShow(false); }} options={P.task1.map((x, k) => ({ id: x.id, label: x.kind === "bar" ? "Bar chart" : "Line graph" }))} />
      <Txt v="bodyB">{d.title}</Txt>
      <View onLayout={(e) => setW(Math.floor(e.nativeEvent.layout.width))} style={{ borderRadius: 12, backgroundColor: t.c.sunk, paddingVertical: 8 }}
        accessible accessibilityLabel={`${d.title}. ${d.series.map((s) => `${s.name}: ${d.categories.map((c, i) => `${c} ${s.values[i]}`).join(", ")}`).join(". ")}`}>
        {w ? (d.kind === "bar" ? <Bars d={d} w={w} t={t} /> : <Lines d={d} w={w} t={t} />) : null}
      </View>
      <Row wrap gap={10}>
        {d.series.map((s, si) => <Row key={s.name} gap={6}><View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS[si % COLORS.length] }} /><Txt v="tiny">{s.name}</Txt></Row>)}
      </Row>
      <Txt v="tiny" muted>Units: {d.unit}{d.kind === "bar" ? ". Bars show each measure on its own scale." : ""}</Txt>
      <Txt v="body" style={{ fontStyle: "italic" }}>{d.prompt}</Txt>
      <Txt v="smallB">Plan it</Txt>
      <Bullets numbered items={d.template} />
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.soft, gap: 4 }}>
        <Txt v="eyebrow" color={t.tint}>Overview (the key to Band 7)</Txt>
        <Txt v="body">{d.overview}</Txt>
      </View>
      {show ? <><Txt v="body" style={{ lineHeight: 23 }}>{d.model}</Txt><CopyButton mod={mod} text={d.model} /></> : null}
      <Btn mod={mod} small kind={show ? "secondary" : "primary"} icon="FileText" title={show ? "Hide model answer" : "Write yours, then show the model"} onPress={() => setShow(!show)} />
    </Card>
  );
}

function Task2({ mod }) {
  const t = useTheme(mod);
  return (
    <View style={{ gap: 10 }}>
      <Txt v="eyebrow">Task 2 · at least 250 words · 40 minutes · worth twice Task 1</Txt>
      {P.task2.map((e) => (
        <Accordion key={e.id} mod={mod} title={`${e.type}: ${e.prompt.length > 70 ? e.prompt.slice(0, 68) + "…" : e.prompt}`}>
          <Txt v="body" style={{ fontStyle: "italic" }}>{e.prompt}</Txt>
          <Txt v="smallB">Essay plan</Txt>
          <Bullets items={e.plan} />
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.soft, gap: 6 }}>
            <Txt v="eyebrow" color={t.tint}>Model introduction</Txt>
            <Txt v="body">{e.intro}</Txt>
            <Txt v="eyebrow" color={t.tint}>Model conclusion</Txt>
            <Txt v="body">{e.conclusion}</Txt>
          </View>
          <Txt v="smallB">Useful linking phrases</Txt>
          <Bullets items={e.phrases} />
        </Accordion>
      ))}
    </View>
  );
}

function Vocab({ mod }) {
  const t = useTheme(mod);
  return (
    <Card mod={mod} style={{ gap: 8 }}>
      <Txt v="h3">Vocabulary booster</Txt>
      <Txt v="small" muted>Swap everyday words for precise academic ones, but only where they fit the meaning.</Txt>
      {P.vocab.map(([a, b, ex]) => (
        <View key={a} style={{ padding: 10, borderRadius: 12, backgroundColor: t.c.sunk, gap: 3 }}>
          <Row gap={8} wrap><Txt v="small" color={t.c.muted} style={{ textDecorationLine: "line-through" }}>{a}</Txt><Txt v="small">→</Txt><Txt v="smallB" color={t.tint}>{b}</Txt></Row>
          <Txt v="tiny" muted style={{ fontStyle: "italic" }}>{ex}</Txt>
        </View>
      ))}
    </Card>
  );
}

export function IeltsWriting({ mod }) {
  const [part, setPart] = useState("t1");
  return (
    <View style={{ gap: 12 }}>
      <Seg mod={mod} even value={part} onChange={setPart} options={[{ id: "t1", label: "Task 1" }, { id: "t2", label: "Task 2" }, { id: "vocab", label: "Vocabulary" }]} />
      {part === "t1" ? <Task1 mod={mod} /> : null}
      {part === "t2" ? <Task2 mod={mod} /> : null}
      {part === "vocab" ? <Vocab mod={mod} /> : null}
      <Note mod={mod} icon="Info">Practice charts use fictional data. Band 7+ needs a clear overview, accurate comparisons and a range of grammar and vocabulary.</Note>
    </View>
  );
}
