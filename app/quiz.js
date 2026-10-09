// Quiz runner screen: question bank, Diagnostic Baseline, NGN case study, CAT predictor and flashcards.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, Pressable, Animated, PanResponder } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Line, Polyline, Circle, Text as SvgText } from "react-native-svg";
import { Screen, Card, Row, Txt, Btn, Chip, Note, Bar, Option, Check, Select, Accordion, Sheet, Icon, Grad, tap, buzz } from "../src/ui";
import { BackRow, Medal } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { useApp } from "../src/state";
import { ProGate } from "../src/pro";
import { todayKey, shuffle } from "../src/util";
import { getRun } from "../src/runStore";
import { DIAG, CAT_POOL, NGN_CASE, NGN_ITEMS, DIFF } from "../src/data/content";
import BANK_ALL from "../src/data/questions.json";

const MOD = "nclex";
const BANK = BANK_ALL.filter((q) => q.active !== false);
const bold = { fontFamily: FONTS.bodyBold, fontWeight: FONTS.bodyBold ? undefined : "700" };

/* ---------- shared pieces ---------- */
function SingleQuestion({ item, value, onChange, locked, reveal }) {
  return (
    <View style={{ gap: 9 }}>
      <Txt v="bodyB" style={{ fontSize: 16, lineHeight: 23 }}>{item.stem}</Txt>
      {item.options.map((o) => {
        const state = reveal ? (o.id === item.answer ? "right" : value === o.id ? "wrong" : null) : value === o.id ? "sel" : null;
        const why = reveal && (o.id === item.answer || o.id === value) && o.why ? (o.id === item.answer ? "Why it's right: " : "Why it's wrong: ") + o.why : null;
        return <Option key={o.id} mod={MOD} letter={o.id} label={o.text} why={why} state={state} disabled={locked || reveal} onPress={() => onChange(o.id)} />;
      })}
    </View>
  );
}

function RationaleSheet({ item, chosen, onClose }) {
  const t = useTheme(MOD);
  const right = item ? (Array.isArray(item.answer) ? item.answer : [item.answer]) : [];
  const picks = Array.isArray(chosen) ? chosen : [chosen];
  return (
    <Sheet mod={MOD} visible={!!item} onClose={onClose} title="Rationale review">
      {item ? (
        <View style={{ gap: 12 }}>
          <Chip mod={MOD} tone="acc" text={item.cat} />
          <Txt v="bodyB">{item.stem}</Txt>
          {item.options.map((o) => {
            const ok = right.includes(o.id), picked = picks.includes(o.id);
            const col = ok ? [t.c.okSoft, t.c.ok] : picked ? [t.c.critSoft, t.c.crit] : [t.c.surface, t.c.line];
            return (
              <View key={o.id} style={{ flexDirection: "row", gap: 10, padding: 13, borderRadius: 14, borderWidth: 1.5, borderColor: col[1], backgroundColor: col[0] }}>
                <Txt v="mono" style={{ width: 16, textTransform: "uppercase", fontFamily: FONTS.monoBold }}>{o.id}</Txt>
                <View style={{ flex: 1, gap: 5 }}>
                  <Txt v="bodyB">{o.text}</Txt>
                  {ok ? <Chip tone="ok" text="Correct" /> : picked ? <Chip tone="crit" text="Your answer" /> : null}
                  <Txt v="small" muted>{(ok ? "Why it's right: " : "Why it's wrong: ") + (o.why || "")}</Txt>
                </View>
              </View>
            );
          })}
          {item.takeaway ? <Note mod={MOD} tone="acc2" icon="Lightbulb" title="High-yield takeaway">{item.takeaway}</Note> : null}
        </View>
      ) : null}
    </Sheet>
  );
}

function ResultTable({ items, answers, onOpen }) {
  const t = useTheme(MOD);
  return (
    <View style={{ gap: 8 }}>
      {items.map((it, i) => {
        const ok = answers[it.id] === it.answer;
        return (
          <Pressable key={it.id} onPress={() => { tap(); onOpen(it); }} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk }}>
            <Txt v="mono" muted style={{ width: 22 }}>{i + 1}</Txt>
            <Icon name={ok ? "CheckCircle2" : "XCircle"} size={19} color={ok ? t.c.ok : t.c.crit} />
            <View style={{ flex: 1 }}>
              <Txt v="small" numberOfLines={1}>{it.stem}</Txt>
              <Txt v="tiny" muted>{it.cat}</Txt>
            </View>
            <Row gap={2}><Txt v="smallB" color={t.tint}>Rationale</Txt><Icon name="ChevronRight" size={15} color={t.tint} /></Row>
          </Pressable>
        );
      })}
    </View>
  );
}

const breakdown = (items, ans) => {
  const byCat = {};
  items.forEach((q) => { byCat[q.cat] = byCat[q.cat] || [0, 0]; byCat[q.cat][1]++; if (ans[q.id] === q.answer) byCat[q.cat][0]++; });
  return byCat;
};

/* ---------- QuizRunner (bank + diagnostic) ---------- */
function QuizRunner({ items, mode, onDone, timed, tutor, onStat, onRestart }) {
  const t = useTheme(MOD);
  const [i, setI] = useState(0); const [ans, setAns] = useState({}); const [done, setDone] = useState(false); const [open, setOpen] = useState(null);
  const [checked, setChecked] = useState({});
  const [left, setLeft] = useState(timed ? items.length * 90 : 0);
  const fin = useRef(null);
  const item = items[i];
  const finish = () => {
    if (done) return; setDone(true); buzz();
    const score = items.filter((q) => ans[q.id] === q.answer).length;
    onDone({ mode, score: `${score}/${items.length}`, pct: Math.round((score / items.length) * 100), date: todayKey(), byCat: breakdown(items, ans) });
    if (onStat && !tutor) onStat(Object.fromEntries(items.map((q) => [q.id, ans[q.id] === q.answer])));
  };
  const check = () => { setChecked({ ...checked, [item.id]: true }); onStat && onStat({ [item.id]: ans[item.id] === item.answer }); };
  fin.current = finish;
  useEffect(() => {
    if (!timed || done) return;
    if (left <= 0) { fin.current(); return; }
    const h = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(h);
  }, [left, timed, done]);

  if (done) {
    const byCat = breakdown(items, ans);
    const score = items.filter((q) => ans[q.id] === q.answer).length; const pct = Math.round((score / items.length) * 100);
    return (
      <View style={{ gap: 16 }}>
        <Card mod={MOD} style={{ gap: 6 }}>
          <Txt v="eyebrow">{mode}</Txt>
          <Row gap={14}>
            <Txt v="big" color={t.tint} style={{ fontSize: 56, lineHeight: 60 }}>{pct}%</Txt>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="bodyB">{score} of {items.length} correct</Txt>
              <Txt v="small" muted>{pct >= 75 ? "Excellent — that's benchmark-ace territory." : pct >= 60 ? "Solid. Review the rationales below to push higher." : "Good baseline. The rationales are where the learning happens."}</Txt>
            </View>
          </Row>
        </Card>
        <Card mod={MOD} style={{ gap: 10 }}>
          <Txt v="eyebrow">Client Needs breakdown</Txt>
          {Object.entries(byCat).map(([c, [r, n]]) => (
            <View key={c} style={{ gap: 5 }}>
              <Row><Txt v="small" style={{ flex: 1 }}>{c}</Txt><Txt v="mono">{r}/{n}</Txt></Row>
              <Bar mod={MOD} pct={r / n} />
            </View>
          ))}
        </Card>
        <ResultTable items={items} answers={ans} onOpen={setOpen} />
        <Row gap={10} wrap>
          {onRestart ? <Btn mod={MOD} kind="secondary" icon="RotateCcw" title="Retake" onPress={onRestart} /> : null}
          <Btn mod={MOD} icon="Check" title="Done" onPress={() => router.back()} />
        </Row>
        <RationaleSheet item={open} chosen={open && ans[open.id]} onClose={() => setOpen(null)} />
      </View>
    );
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const revealed = tutor && checked[item.id];
  const correct = ans[item.id] === item.answer;
  return (
    <View style={{ gap: 14 }}>
      <Row gap={8} wrap>
        <Chip mod={MOD} tone="acc" text={item.cat} />
        <View style={{ flex: 1 }} />
        {timed ? <Chip mod={MOD} tone={left < 60 ? "crit" : "acc2"} icon="Timer" text={`${mm}:${ss}`} /> : null}
        <Txt v="mono" muted>Question {i + 1} of {items.length}</Txt>
      </Row>
      <Bar mod={MOD} pct={i / items.length} />
      {item.topic ? (
        <Row gap={6} wrap>
          <Chip text={item.topic} />
          {item.bank === "CCRN" ? <Chip mod={MOD} tone="acc2" text="CCRN level" /> : null}
        </Row>
      ) : null}
      <Card mod={MOD}>
        <SingleQuestion item={item} value={ans[item.id]} onChange={(v) => setAns({ ...ans, [item.id]: v })} reveal={revealed} />
      </Card>
      {revealed ? (
        <View style={{ gap: 8 }}>
          <Row gap={8}>
            <Icon name={correct ? "CheckCircle2" : "XCircle"} size={19} color={correct ? t.c.ok : t.c.crit} />
            <Txt v="bodyB" color={correct ? t.c.ok : t.c.crit} style={{ flex: 1 }}>{correct ? "Correct" : "Not quite — the correct answer is " + String(item.answer).toUpperCase()}</Txt>
          </Row>
          {item.takeaway ? <Note mod={MOD} tone="acc2" icon="Lightbulb" title="Takeaway">{item.takeaway}</Note> : null}
          {item.flag && item.source === "nb2025" ? <Txt v="tiny" muted>Note: {item.flag}</Txt> : null}
        </View>
      ) : null}
      <Row gap={10} style={{ justifyContent: "space-between" }}>
        <Btn mod={MOD} kind="secondary" icon="ArrowLeft" title="Back" disabled={i === 0} onPress={() => setI(i - 1)} />
        {tutor && !checked[item.id] ? <Btn mod={MOD} icon="Check" title="Check answer" disabled={!ans[item.id]} onPress={check} />
          : i < items.length - 1 ? <Btn mod={MOD} icon="ArrowRight" title="Next" disabled={!ans[item.id]} onPress={() => setI(i + 1)} />
          : <Btn mod={MOD} icon="Send" title="Submit exam" disabled={Object.keys(ans).length < items.length} onPress={finish} />}
      </Row>
    </View>
  );
}

/* ---------- NGN case study ---------- */
function scoreNgn(item, a) {
  if (!a) return [0, item.kind === "single" ? 1 : item.kind === "cloze" ? item.blanks.length : item.kind === "matrix" ? item.rows.length : item.answer.length];
  if (item.kind === "single") return [a === item.answer ? 1 : 0, 1];
  if (item.kind === "cloze") return [item.blanks.filter((b) => a[b.id] === b.answer).length, item.blanks.length];
  if (item.kind === "matrix") return [item.rows.filter(([id, , ans]) => a[id] === ans).length, item.rows.length];
  // multi: +/- scoring, floor 0 (mirrors NGN partial-credit style)
  const plus = a.filter((x) => item.answer.includes(x)).length, minus = a.filter((x) => !item.answer.includes(x)).length;
  return [Math.max(0, plus - minus), item.answer.length];
}

function Pill({ label, on, onPress }) {
  const t = useTheme(MOD);
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: on }}
      style={{ flexGrow: 1, flexBasis: 90, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 12, alignItems: "center", borderWidth: 1.5, borderColor: on ? t.tint : t.c.line, backgroundColor: on ? t.soft : t.c.surface }}>
      <Txt v="smallB" color={on ? t.tint : t.c.ink}>{label}</Txt>
    </Pressable>
  );
}

function NGN({ onDone }) {
  const t = useTheme(MOD);
  const [i, setI] = useState(0); const [ans, setAns] = useState({}); const [done, setDone] = useState(false);
  const item = NGN_ITEMS[i]; const a = ans[item.id];
  const setA = (v) => setAns({ ...ans, [item.id]: v });
  const answered = (it) => { const x = ans[it.id]; if (!x) return false; if (it.kind === "multi") return x.length > 0; if (it.kind === "cloze") return it.blanks.every((b) => x[b.id]); if (it.kind === "matrix") return it.rows.every(([id]) => x[id]); return true; };
  const totals = NGN_ITEMS.map((it) => scoreNgn(it, ans[it.id]));
  const got = totals.reduce((n, x) => n + x[0], 0), max = totals.reduce((n, x) => n + x[1], 0);
  const finish = () => { setDone(true); buzz(); onDone({ mode: "NGN Case Study", score: `${got}/${max} pts`, pct: Math.round(got / max * 100), date: todayKey() }); };
  const all = NGN_ITEMS.every(answered);
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD} style={{ backgroundColor: t.c.sunk, gap: 8 }}>
        <Txt v="eyebrow">Client record</Txt>
        <Txt v="bodyB">{NGN_CASE.title}</Txt>
        {NGN_CASE.chart.map(([h, x]) => (
          <View key={h} style={{ gap: 2 }}>
            <Txt v="tiny" color={t.tint2} style={{ fontFamily: FONTS.monoBold }}>{h}</Txt>
            <Txt v="small">{x}</Txt>
          </View>
        ))}
      </Card>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {NGN_ITEMS.map((it, j) => <Chip key={it.id} mod={MOD} tone={j === i && !done ? "acc" : answered(it) ? "acc2" : "mute"} active={j === i && !done} text={`${j + 1}. ${it.step}`} onPress={() => { setI(j); }} />)}
      </ScrollView>
      {done ? (
        <View style={{ gap: 12 }}>
          <Card mod={MOD} style={{ gap: 4 }}>
            <Txt v="eyebrow">NGN Case Study</Txt>
            <Txt v="big" color={t.tint}>{got}/{max}</Txt>
            <Txt v="small" muted>points · partial credit scoring</Txt>
          </Card>
          {NGN_ITEMS.map((it, j) => (
            <Accordion key={it.id} mod={MOD} title={`${j + 1}. ${it.step}`} meta={<Chip text={`${totals[j][0]}/${totals[j][1]}`} />}>
              <Txt v="small" muted>{it.stem}</Txt>
              {it.kind === "multi" ? <Txt v="small"><Txt v="smallB">Correct: </Txt>{it.options.filter(([id]) => it.answer.includes(id)).map(([, x]) => x).join("; ")}</Txt> : null}
              {it.kind === "single" ? <Txt v="small"><Txt v="smallB">Correct: </Txt>{it.options.find(([id]) => id === it.answer)[1]}</Txt> : null}
              {it.kind === "cloze" ? <Txt v="small"><Txt v="smallB">Correct: </Txt>{it.blanks.map((b) => b.answer).join(" · ")}</Txt> : null}
              {it.kind === "matrix" ? (
                <View style={{ gap: 4 }}>
                  {it.rows.map(([id, x, c]) => (
                    <Txt key={id} v="small">• {x}: <Txt v="smallB">{c}</Txt>{ans[it.id] && ans[it.id][id] !== c ? <Txt v="small" color={t.c.crit}> (you chose {ans[it.id][id] || "nothing"})</Txt> : null}</Txt>
                  ))}
                </View>
              ) : null}
              <Note mod={MOD} tone="acc2" icon="Lightbulb">{it.rationale}</Note>
            </Accordion>
          ))}
          <Btn mod={MOD} icon="Check" title="Done" onPress={() => router.back()} />
        </View>
      ) : (
        <Card mod={MOD} key={item.id} style={{ gap: 12 }}>
          <Txt v="eyebrow">Clinical judgment step {i + 1} · {item.step}</Txt>
          <Txt v="bodyB" style={{ fontSize: 16, lineHeight: 23 }}>{item.stem}</Txt>
          {item.kind === "multi" ? item.options.map(([id, x]) => {
            const sel = (a || []).includes(id);
            return <Check key={id} mod={MOD} checked={sel} label={x} onToggle={() => setA(sel ? a.filter((y) => y !== id) : [...(a || []), id])} />;
          }) : null}
          {item.kind === "single" ? item.options.map(([id, x]) => (
            <Option key={id} mod={MOD} label={x} state={a === id ? "sel" : null} onPress={() => setA(id)} />
          )) : null}
          {item.kind === "cloze" ? item.blanks.map((b) => (
            <View key={b.id} style={{ gap: 6 }}>
              <Txt v="body">{b.pre}</Txt>
              <Select mod={MOD} value={(a || {})[b.id] || ""} placeholder="Select…" options={b.opts} onChange={(v) => setA({ ...(a || {}), [b.id]: v })} />
            </View>
          )) : null}
          {item.kind === "matrix" ? item.rows.map(([id, x]) => (
            <View key={id} style={{ gap: 7, padding: 11, borderRadius: 14, backgroundColor: t.c.sunk }}>
              <Txt v="smallB">{x}</Txt>
              <Row gap={6} wrap>
                {item.cols.map((c) => <Pill key={c} label={c} on={(a || {})[id] === c} onPress={() => setA({ ...(a || {}), [id]: c })} />)}
              </Row>
            </View>
          )) : null}
          <Row gap={10} style={{ justifyContent: "space-between", marginTop: 4 }}>
            <Btn mod={MOD} kind="secondary" icon="ArrowLeft" title="Back" disabled={i === 0} onPress={() => setI(i - 1)} />
            {i < NGN_ITEMS.length - 1 ? <Btn mod={MOD} icon="ArrowRight" title="Next" onPress={() => setI(i + 1)} />
              : <Btn mod={MOD} icon="Send" title="Submit case study" disabled={!all} onPress={finish} />}
          </Row>
          {i === NGN_ITEMS.length - 1 && !all ? <Txt v="tiny" muted>Answer all six steps to submit. Unanswered steps are grey in the bar above.</Txt> : null}
        </Card>
      )}
    </View>
  );
}

/* ---------- CAT predictor ---------- */
function AbilityTrace({ hist }) {
  const t = useTheme(MOD); const [w, setW] = useState(0);
  const W = 520, H = 160, pad = 28;
  const pts = [0, ...hist.map((h) => h.theta)];
  const x = (i) => pad + (i / Math.max(1, pts.length - 1)) * (W - pad * 2); const y = (v) => H / 2 - (v / 2) * (H / 2 - 16);
  return (
    <Card mod={MOD} padding={10}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityLabel="Ability estimate after each item">
        {w > 0 ? (
          <Svg width={w} height={(w * H) / W} viewBox={`0 0 ${W} ${H}`}>
            <Line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} stroke={t.tint} strokeDasharray="5 4" strokeWidth={1.5} />
            <SvgText x={W - pad} y={y(0) - 6} textAnchor="end" fontSize="12" fill={t.tint} fontFamily={FONTS.mono}>passing line</SvgText>
            <Polyline fill="none" stroke={t.tint2} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" points={pts.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
            {pts.map((v, i) => (i > 0 ? <Circle key={i} cx={x(i)} cy={y(v)} r={5} fill={hist[i - 1].ok ? t.c.ok : t.c.crit} /> : null))}
            <SvgText x={pad} y={H - 6} fontSize="12" fill={t.c.muted} fontFamily={FONTS.mono}>start</SvgText>
            <SvgText x={W - pad} y={H - 6} textAnchor="end" fontSize="12" fill={t.c.muted} fontFamily={FONTS.mono}>item {hist.length}</SvgText>
          </Svg>
        ) : <View style={{ height: 120 }} />}
      </View>
    </Card>
  );
}

function CAT({ onDone, onRestart }) {
  const [theta, setTheta] = useState(0); const [hist, setHist] = useState([]); const [cur, setCur] = useState(() => CAT_POOL.find((q) => q.d === 2));
  const [sel, setSel] = useState(null); const [done, setDone] = useState(false); const [open, setOpen] = useState(null);
  const MIN = 6, MAX = 10;
  const pick = (th, used) => CAT_POOL.filter((q) => !used.includes(q.id)).sort((a, b) => Math.abs(DIFF[a.d] - th) - Math.abs(DIFF[b.d] - th) || Math.random() - 0.5)[0];
  const submit = () => {
    const ok = sel === cur.answer; const n = hist.length + 1; const step = 1 / (1 + 0.35 * n);
    const th = Math.max(-2, Math.min(2, theta + (ok ? step : -step)));
    const h = [...hist, { item: cur, chosen: sel, ok, theta: th }];
    setHist(h); setTheta(th); setSel(null);
    const confident = n >= MIN && Math.abs(th) > 0.55;
    const next = pick(th, h.map((z) => z.item.id));
    if (n >= MAX || confident || !next) {
      setDone(true); buzz();
      const verdict = th > 0.2 ? "Above passing line" : th < -0.2 ? "Below passing line" : "Near passing line";
      const byCat = {}; h.forEach((z) => { const c = z.item.cat; byCat[c] = byCat[c] || [0, 0]; byCat[c][1]++; if (z.ok) byCat[c][0]++; });
      onDone({ mode: "CAT Predictor", score: verdict, pct: Math.round((th + 2) / 4 * 100), date: todayKey(), byCat });
    } else setCur(next);
  };
  if (done) {
    const verdict = theta > 0.2 ? ["Above the simulated passing line", "ok"] : theta < -0.2 ? ["Below the simulated passing line", "crit"] : ["Near the simulated passing line", "warn"];
    return (
      <View style={{ gap: 14 }}>
        <Chip tone={verdict[1]} icon="Gauge" text={verdict[0]} />
        <Txt v="small" muted>Stopped after {hist.length} items · ability estimate <Txt v="mono">{theta.toFixed(2)}</Txt></Txt>
        <AbilityTrace hist={hist} />
        <Note mod={MOD}>This simulates how computer-adaptive testing works — harder items after correct answers, easier after misses, stopping once the estimate is clearly above or below the line. A 12-item pool cannot predict your real NCLEX result.</Note>
        <ResultTable items={hist.map((h) => h.item)} answers={Object.fromEntries(hist.map((h) => [h.item.id, h.chosen]))} onOpen={setOpen} />
        <Row gap={10} wrap>
          <Btn mod={MOD} kind="secondary" icon="RotateCcw" title="Retake" onPress={onRestart} />
          <Btn mod={MOD} icon="Check" title="Done" onPress={() => router.back()} />
        </Row>
        <RationaleSheet item={open} chosen={open && (hist.find((h) => h.item.id === open.id) || {}).chosen} onClose={() => setOpen(null)} />
      </View>
    );
  }
  return (
    <View style={{ gap: 14 }}>
      <Row gap={8} wrap>
        <Chip mod={MOD} tone="acc" text={cur.cat} />
        <View style={{ flex: 1 }} />
        <Txt v="mono" muted>Item {hist.length + 1} · difficulty {"●".repeat(cur.d)}{"○".repeat(3 - cur.d)}</Txt>
      </Row>
      <Card mod={MOD}><SingleQuestion item={cur} value={sel} onChange={setSel} /></Card>
      <Row style={{ justifyContent: "flex-end" }}><Btn mod={MOD} icon="Send" title="Submit answer" disabled={!sel} onPress={submit} /></Row>
      <Txt v="tiny" muted>No going back — like the real CAT, each answer is final.</Txt>
    </View>
  );
}

/* ---------- Flashcards ---------- */
const makeDeck = () => {
  const src = BANK.length ? shuffle(BANK.filter((q) => q.bank === "NCLEX")).slice(0, 40) : [...DIAG, ...CAT_POOL];
  return shuffle(src.map((q) => ({ id: q.id, cat: q.cat, front: q.stem, answer: (q.options.find((o) => o.id === q.answer) || {}).text, back: q.takeaway })));
};

function Flashcards() {
  const t = useTheme(MOD); const { dispatch } = useApp();
  const [deck, setDeck] = useState(makeDeck); const [flip, setFlip] = useState(false); const [known, setKnown] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const card = deck[0];

  useEffect(() => { Animated.spring(rot, { toValue: flip ? 1 : 0, useNativeDriver: true, friction: 8, tension: 60 }).start(); }, [flip]);

  const flying = useRef(false);
  const commit = (dir) => {
    dispatch({ type: "flash" });
    if (dir > 0) { setKnown((k) => k + 1); setDeck((d) => d.slice(1)); } else setDeck((d) => [...d.slice(1), d[0]]);
    setFlip(false); rot.setValue(0); pan.setValue(0); flying.current = false;
  };
  // Guard against double taps / swipe + tap committing the same card twice.
  const fly = (dir) => { if (flying.current) return; flying.current = true; tap(); Animated.timing(pan, { toValue: dir * 480, duration: 200, useNativeDriver: true }).start(() => commit(dir)); };
  const flyRef = useRef(fly); flyRef.current = fly;

  const responder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderTerminationRequest: () => false,
    onPanResponderMove: (_, g) => pan.setValue(g.dx),
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > 90) flyRef.current(Math.sign(g.dx));
      else Animated.spring(pan, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
    },
    onPanResponderTerminate: () => Animated.spring(pan, { toValue: 0, useNativeDriver: true }).start(),
  })).current;

  if (!card) return (
    <Card mod={MOD} style={{ alignItems: "center", paddingVertical: 28, gap: 12 }}>
      <Medal badge={{ icon: "Layers" }} idx={1} size={72} />
      <Txt v="h2">Deck complete</Txt>
      <Txt v="body" muted style={{ textAlign: "center" }}>You marked {known} cards as known. Shuffle and go again to lock them in.</Txt>
      <Btn mod={MOD} icon="Shuffle" title="Shuffle deck" onPress={() => { setDeck(makeDeck()); setKnown(0); }} />
    </Card>
  );

  const H = 400;
  const tilt = pan.interpolate({ inputRange: [-300, 0, 300], outputRange: ["-14deg", "0deg", "14deg"] });
  const frontRot = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRot = rot.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOp = rot.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [1, 1, 0, 0] });
  const backOp = rot.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });
  const againOp = pan.interpolate({ inputRange: [-90, 0], outputRange: [1, 0], extrapolate: "clamp" });
  const gotOp = pan.interpolate({ inputRange: [0, 90], outputRange: [0, 1], extrapolate: "clamp" });
  const face = { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: 24, padding: 20, gap: 12, backfaceVisibility: "hidden" };

  return (
    <View style={{ gap: 14 }}>
      <Row>
        <Txt v="mono" muted style={{ flex: 1 }}>{deck.length} left · {known} known</Txt>
        <Txt v="tiny" muted>Tap to flip · swipe right if you knew it</Txt>
      </Row>
      <View style={{ height: H + 16 }}>
        <View style={{ position: "absolute", left: 22, right: 22, top: 16, height: H, borderRadius: 24, backgroundColor: t.c.surface, borderWidth: 1, borderColor: t.c.line, opacity: 0.5 }} />
        <View style={{ position: "absolute", left: 11, right: 11, top: 8, height: H, borderRadius: 24, backgroundColor: t.c.surface, borderWidth: 1, borderColor: t.c.line, opacity: 0.8 }} />
        <Animated.View {...responder.panHandlers} style={{ height: H, transform: [{ translateX: pan }, { rotate: tilt }] }}>
          <Pressable style={{ flex: 1 }} onPress={() => { tap(); setFlip((f) => !f); }} accessibilityRole="button" accessibilityLabel={flip ? "Show question" : "Reveal answer"}>
            <Animated.View style={[face, { backgroundColor: t.c.surface, borderWidth: 1, borderColor: t.c.line, opacity: frontOp, transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
              <Chip mod={MOD} tone="acc" text={card.cat} />
              <Txt v="h3" style={{ fontSize: 18, lineHeight: 25 }} numberOfLines={11}>{card.front}</Txt>
              <View style={{ flex: 1 }} />
              <Row gap={6}><Icon name="RotateCw" size={14} color={t.c.muted} /><Txt v="small" muted>Tap to reveal the answer</Txt></Row>
            </Animated.View>
            <Animated.View style={[face, { padding: 0, overflow: "hidden", opacity: backOp, transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
              <Grad mod={MOD} style={{ flex: 1, padding: 20, gap: 12 }}>
                <Txt v="eyebrow" color="rgba(255,255,255,0.85)">Answer</Txt>
                <Txt v="h3" color="#fff" style={{ fontSize: 18, lineHeight: 25 }} numberOfLines={5}>{card.answer}</Txt>
                <Txt v="body" color="rgba(255,255,255,0.95)" numberOfLines={9}>{card.back}</Txt>
              </Grad>
            </Animated.View>
          </Pressable>
          <Animated.View pointerEvents="none" style={{ position: "absolute", top: 14, right: 14, opacity: againOp, transform: [{ rotate: "8deg" }] }}><Chip tone="crit" text="AGAIN" /></Animated.View>
          <Animated.View pointerEvents="none" style={{ position: "absolute", top: 14, left: 14, opacity: gotOp, transform: [{ rotate: "-8deg" }] }}><Chip tone="ok" text="GOT IT" /></Animated.View>
        </Animated.View>
      </View>
      <Row gap={8} style={{ justifyContent: "center" }}>
        <Btn mod={MOD} kind="secondary" icon="Undo2" title="Again" onPress={() => fly(-1)} />
        <Btn mod={MOD} kind="secondary" icon="RotateCw" title="Flip" onPress={() => setFlip((f) => !f)} />
        <Btn mod={MOD} icon="Check" title="Got it" onPress={() => fly(1)} />
      </Row>
    </View>
  );
}

/* ---------- screen ---------- */
const TITLES = { bank: "Question bank", diag: "Diagnostic Baseline", ngn: "NGN Case Study", cat: "CAT Predictor", flash: "Flashcards" };

export default function Quiz() {
  const p = useLocalSearchParams();
  const mode = TITLES[p.mode] ? p.mode : "diag";
  const timed = p.timed === "1";
  const { dispatch } = useApp();
  const [runKey, setRunKey] = useState(0);
  const run = useMemo(() => (mode === "bank" ? getRun() : null), [mode]);
  const record = (rec) => dispatch({ type: "exam", rec });
  const restart = () => setRunKey((k) => k + 1);

  let body = null;
  if (mode === "bank") {
    body = run && run.items && run.items.length
      ? <QuizRunner key={runKey} items={run.items} mode="Question Bank" tutor={run.tutor} onDone={record} onStat={(res) => dispatch({ type: "qstat", res })} />
      : <Note mod={MOD} tone="warn" icon="AlertTriangle" title="No question set">Go back to the NCLEX tab and build a set from the question bank.</Note>;
  } else if (mode === "diag") {
    body = <QuizRunner key={runKey} items={DIAG} mode="Diagnostic Baseline" timed={timed} onDone={record} onRestart={restart} />;
  } else if (mode === "ngn") {
    body = <ProGate mod={MOD} feature="NGN case study simulation" desc="All six clinical-judgment steps with full distractor rationales."><NGN onDone={record} /></ProGate>;
  } else if (mode === "cat") {
    body = <CAT key={runKey} onDone={record} onRestart={restart} />;
  } else {
    body = <Flashcards />;
  }

  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title={TITLES[mode] + (mode === "diag" && timed ? " · Timed" : mode === "bank" && run ? (run.tutor ? " · Tutor" : " · Exam") : "")} />
      {body}
    </Screen>
  );
}
