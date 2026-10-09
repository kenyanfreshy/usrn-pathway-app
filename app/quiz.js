// Quiz runner screen: question bank, the three benchmark exams (Diagnostic Benchmark, NGN Clinical Judgment Simulator,
// Comprehensive Predictor), NGN case-study practice and flashcards.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, Pressable, Animated, PanResponder } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Line, Polyline, Circle, Text as SvgText } from "react-native-svg";
import { Screen, Card, Row, Txt, Btn, Chip, Note, Bar, Option, Check, Select, Accordion, Sheet, Icon, Grad, tap, buzz, Grid, Seg, IconTile, HScroll } from "../src/ui";
import { BackRow, Medal } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { useApp } from "../src/state";
import { ProGate, usePro } from "../src/pro";
import { maybeAskForRating } from "../src/rate";
import { todayKey, shuffle } from "../src/util";
import { getRun } from "../src/runStore";
import { DIAG, CAT_POOL, DIFF } from "../src/data/content";
import { NGN_CASES, scoreNgnItem } from "../src/data/ngn";
import { typeOf, scoreItem, isCorrect, isAnswered, answerText, breakdown, TESTS, T2_CASES, buildTest1, buildTest2, nextItem, stopRule, difficultyOf, CAT_MIN, CAT_MAX } from "../src/exam";
import BANK_ALL from "../src/data/questions.json";

const MOD = "nclex";
const BANK = BANK_ALL.filter((q) => q.active !== false);
const bold = { fontFamily: FONTS.bodyBold, fontWeight: FONTS.bodyBold ? undefined : "700" };

/* ---------- shared pieces ---------- */
const TYPE_HINT = { sata: "Select all that apply", order: "Tap the options in the correct order" };

/** One question of any type: single answer, select-all-that-apply or ordered response. */
function QuestionView({ item, value, onChange, locked, reveal }) {
  const t = useTheme(MOD); const type = typeOf(item);
  const right = Array.isArray(item.answer) ? item.answer : [item.answer];
  return (
    <View style={{ gap: 9 }}>
      <Txt v="bodyB" style={{ fontSize: 16, lineHeight: 23 }}>{item.stem}</Txt>
      {TYPE_HINT[type] ? <Chip mod={MOD} tone="acc2" icon={type === "order" ? "ListChecks" : "CheckCircle2"} text={TYPE_HINT[type]} /> : null}

      {type === "single" ? item.options.map((o) => {
        const state = reveal ? (o.id === item.answer ? "right" : value === o.id ? "wrong" : null) : value === o.id ? "sel" : null;
        const why = reveal && (o.id === item.answer || o.id === value) && o.why ? (o.id === item.answer ? "Why it's right: " : "Why it's wrong: ") + o.why : null;
        return <Option key={o.id} mod={MOD} letter={o.id} label={o.text} why={why} state={state} disabled={locked || reveal} onPress={() => onChange(o.id)} />;
      }) : null}

      {type === "sata" ? item.options.map((o) => {
        const sel = (value || []).includes(o.id); const ok = right.includes(o.id);
        const state = reveal ? (ok ? "right" : sel ? "wrong" : null) : sel ? "sel" : null;
        const why = reveal && (ok || sel) && o.why ? (ok ? (sel ? "Correct choice: " : "Missed — should be selected: ") : "Should not be selected: ") + o.why : null;
        return <Option key={o.id} mod={MOD} multi letter={o.id} label={(sel ? "☑ " : "☐ ") + o.text} why={why} state={state} disabled={locked || reveal}
          onPress={() => onChange(sel ? value.filter((x) => x !== o.id) : [...(value || []), o.id])} />;
      }) : null}

      {type === "order" ? (
        <View style={{ gap: 8 }}>
          {item.options.map((o) => {
            const pos = (value || []).indexOf(o.id); const truePos = item.answer.indexOf(o.id);
            const good = reveal && pos === truePos;
            const border = reveal ? (good ? t.c.ok : t.c.crit) : pos >= 0 ? t.tint : t.c.line;
            return (
              <Pressable key={o.id} disabled={locked || reveal} accessibilityRole="button" accessibilityLabel={`${o.text}${pos >= 0 ? `, step ${pos + 1}` : ""}`}
                onPress={() => { tap(); const cur = value || []; onChange(pos >= 0 ? cur.filter((y) => y !== o.id) : [...cur, o.id]); }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: border, backgroundColor: reveal ? (good ? t.c.okSoft : t.c.critSoft) : pos >= 0 ? t.soft : t.c.surface }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: pos >= 0 ? t.tint : t.c.sunk }}>
                  <Txt v="smallB" color={pos >= 0 ? "#fff" : t.c.muted}>{pos >= 0 ? pos + 1 : "–"}</Txt>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt v="body">{o.text}</Txt>
                  {reveal ? <Txt v="small" muted>{`Correct position: ${truePos + 1}. ${o.why || ""}`}</Txt> : null}
                </View>
              </Pressable>
            );
          })}
          {!reveal && !locked && (value || []).length ? <Pressable onPress={() => { tap(); onChange([]); }} hitSlop={8}><Txt v="smallB" color={t.tint2}>Clear order</Txt></Pressable> : null}
        </View>
      ) : null}
    </View>
  );
}
const SingleQuestion = QuestionView;

function RationaleSheet({ item, chosen, onClose }) {
  const t = useTheme(MOD);
  const type = item ? typeOf(item) : "single";
  const right = item ? (Array.isArray(item.answer) ? item.answer : [item.answer]) : [];
  const picks = Array.isArray(chosen) ? chosen : chosen ? [chosen] : [];
  const pts = item ? scoreItem(item, chosen) : [0, 0];
  return (
    <Sheet mod={MOD} visible={!!item} onClose={onClose} title="Rationale review">
      {item ? (
        <View style={{ gap: 12 }}>
          <Row gap={6} wrap><Chip mod={MOD} tone="acc" text={item.cat} />{type !== "single" ? <Chip mod={MOD} tone="acc2" text={type === "sata" ? `SATA · ${pts[0]}/${pts[1]} pts (+/− scoring)` : `Ordered response · ${pts[0]}/1`} /> : null}</Row>
          <Txt v="bodyB">{item.stem}</Txt>
          {type === "order" ? <Note mod={MOD} tone="acc" icon="ListChecks" title="Correct order">{item.answer.map((id, k) => `${k + 1}. ${(item.options.find((o) => o.id === id) || {}).text}`).join("\n")}</Note> : null}
          {item.options.map((o) => {
            const ok = type === "order" ? true : right.includes(o.id), picked = picks.includes(o.id);
            const col = type === "order" ? [t.c.surface, t.c.line] : ok ? [t.c.okSoft, t.c.ok] : picked ? [t.c.critSoft, t.c.crit] : [t.c.surface, t.c.line];
            return (
              <View key={o.id} style={{ flexDirection: "row", gap: 10, padding: 13, borderRadius: 14, borderWidth: 1.5, borderColor: col[1], backgroundColor: col[0] }}>
                <Txt v="mono" style={{ width: 16, textTransform: "uppercase", fontFamily: FONTS.monoBold }}>{o.id}</Txt>
                <View style={{ flex: 1, gap: 5 }}>
                  <Txt v="bodyB">{o.text}</Txt>
                  {type === "order" ? <Chip tone="mute" text={`Step ${item.answer.indexOf(o.id) + 1}${picked ? ` · you put it at ${picks.indexOf(o.id) + 1}` : ""}`} />
                    : ok ? <Chip tone="ok" text={picked ? "Correct · you chose it" : "Correct"} /> : picked ? <Chip tone="crit" text="Your answer" /> : null}
                  <Txt v="small" muted>{(type === "order" ? "" : ok ? "Why it's right: " : "Why it's wrong: ") + (o.why || "")}</Txt>
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
        const [g, m] = scoreItem(it, answers[it.id]); const ok = g === m;
        return (
          <Pressable key={it.id} onPress={() => { tap(); onOpen(it); }} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk }}>
            <Txt v="mono" muted style={{ width: 26 }}>{i + 1}</Txt>
            <Icon name={ok ? "CheckCircle2" : g > 0 ? "CircleDot" : "XCircle"} size={19} color={ok ? t.c.ok : g > 0 ? t.c.warn : t.c.crit} />
            <View style={{ flex: 1 }}>
              <Txt v="small" numberOfLines={1}>{it.stem}</Txt>
              <Txt v="tiny" muted>{it.cat}{m > 1 ? ` · ${g}/${m} pts` : ""}</Txt>
            </View>
            <Row gap={2}><Txt v="smallB" color={t.tint}>Rationale</Txt><Icon name="ChevronRight" size={15} color={t.tint} /></Row>
          </Pressable>
        );
      })}
    </View>
  );
}

function CatBreakdown({ byCat }) {
  return (
    <Card mod={MOD} style={{ gap: 10 }}>
      <Txt v="eyebrow">Client Needs breakdown (points)</Txt>
      {Object.entries(byCat).map(([c, [r, n]]) => (
        <View key={c} style={{ gap: 5 }}>
          <Row><Txt v="small" style={{ flex: 1 }}>{c}</Txt><Txt v="mono">{r}/{n}</Txt></Row>
          <Bar mod={MOD} pct={n ? r / n : 0} />
        </View>
      ))}
    </Card>
  );
}

/* ---------- QuizRunner (question bank, Test 1, and the stand-alone sections of Test 2) ----------
 * initial / onProgress let long exams be saved and resumed. In segment mode the runner hands its answers
 * to onSegmentDone instead of showing its own results.
 */
function QuizRunner({ items, mode, onDone, timed, tutor, onStat, onRestart, initial, onProgress, segment, onSegmentDone, label, after }) {
  const t = useTheme(MOD);
  const [i, setI] = useState((initial && initial.i) || 0); const [ans, setAns] = useState((initial && initial.ans) || {});
  const [done, setDone] = useState(false); const [open, setOpen] = useState(null);
  const [checked, setChecked] = useState({});
  const [left, setLeft] = useState(initial && initial.left != null ? initial.left : timed ? items.length * 90 : 0);
  const fin = useRef(null);
  const item = items[i];
  useEffect(() => { if (onProgress && !done) onProgress({ i, ans, left: timed ? left : null }); }, [i, ans]);
  useEffect(() => { if (onProgress && timed && !done && left % 15 === 0) onProgress({ i, ans, left }); }, [left]);
  const totals = () => { let g = 0, m = 0; items.forEach((q) => { const s = scoreItem(q, ans[q.id]); g += s[0]; m += s[1]; }); return [g, m]; };
  const finish = () => {
    if (done) return;
    if (segment) { onSegmentDone && onSegmentDone(ans); return; }
    setDone(true); buzz();
    const [g, m] = totals(); const right = items.filter((q) => isCorrect(q, ans[q.id])).length;
    onDone({ mode, score: `${right}/${items.length}`, pct: Math.round((g / m) * 100), date: todayKey(), byCat: breakdown(items, ans) });
    if (onStat && !tutor) onStat(Object.fromEntries(items.map((q) => [q.id, isCorrect(q, ans[q.id])])));
  };
  const check = () => { setChecked({ ...checked, [item.id]: true }); onStat && onStat({ [item.id]: isCorrect(item, ans[item.id]) }); };
  fin.current = finish;
  useEffect(() => {
    if (!timed || done) return;
    if (left <= 0) { fin.current(); return; }
    const h = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(h);
  }, [left, timed, done]);

  if (done) {
    const byCat = breakdown(items, ans); const [g, m] = totals();
    const right = items.filter((q) => isCorrect(q, ans[q.id])).length; const pct = Math.round((g / m) * 100);
    return (
      <View style={{ gap: 16 }}>
        <Card mod={MOD} style={{ gap: 6 }}>
          <Txt v="eyebrow">{mode}</Txt>
          <Row gap={14}>
            <Txt v="big" color={t.tint} style={{ fontSize: 56, lineHeight: 60 }}>{pct}%</Txt>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="bodyB">{right} of {items.length} fully correct · {g}/{m} points</Txt>
              <Txt v="small" muted>{pct >= 75 ? "Excellent — that's benchmark-ace territory." : pct >= 60 ? "Solid. Review the rationales below to push higher." : "Good baseline. The rationales are where the learning happens."}</Txt>
            </View>
          </Row>
          <Txt v="tiny" muted>SATA items use NCSBN +/− scoring (+1 per correct choice, −1 per wrong choice, minimum 0).</Txt>
        </Card>
        <CatBreakdown byCat={byCat} />
        {after || null}
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
  const correct = isCorrect(item, ans[item.id]); const pts = scoreItem(item, ans[item.id]);
  const allAnswered = items.every((q) => isAnswered(q, ans[q.id]));
  return (
    <View style={{ gap: 14 }}>
      {label ? <Txt v="eyebrow">{label}</Txt> : null}
      <Row gap={8} wrap>
        <Chip mod={MOD} tone="acc" text={item.cat} />
        <View style={{ flex: 1 }} />
        {timed ? <Chip mod={MOD} tone={left < 60 ? "crit" : "acc2"} icon="Timer" text={`${String(Math.floor(left / 3600)) !== "0" ? Math.floor(left / 3600) + ":" : ""}${String(Math.floor((left % 3600) / 60)).padStart(2, "0")}:${ss}`} /> : null}
        <Txt v="mono" muted>Question {i + 1} of {items.length}</Txt>
      </Row>
      <Bar mod={MOD} pct={i / items.length} />
      {item.topic ? <Row gap={6} wrap><Chip text={item.topic} /></Row> : null}
      <Card mod={MOD}>
        <QuestionView item={item} value={ans[item.id]} onChange={(v) => setAns({ ...ans, [item.id]: v })} reveal={revealed} />
      </Card>
      {revealed ? (
        <View style={{ gap: 8 }}>
          <Row gap={8}>
            <Icon name={correct ? "CheckCircle2" : "XCircle"} size={19} color={correct ? t.c.ok : t.c.crit} />
            <Txt v="bodyB" color={correct ? t.c.ok : t.c.crit} style={{ flex: 1 }}>{correct ? "Correct" : `Not quite — the correct answer is ${answerText(item)}`}{typeOf(item) === "sata" ? ` (${pts[0]}/${pts[1]} pts)` : ""}</Txt>
          </Row>
          {item.takeaway ? <Note mod={MOD} tone="acc2" icon="Lightbulb" title="Takeaway">{item.takeaway}</Note> : null}
          {item.flag && item.source === "nb2025" ? <Txt v="tiny" muted>Note: {item.flag}</Txt> : null}
        </View>
      ) : null}
      <Row gap={10} style={{ justifyContent: "space-between" }}>
        <Btn mod={MOD} kind="secondary" icon="ArrowLeft" title="Back" disabled={i === 0} onPress={() => setI(i - 1)} />
        {tutor && !checked[item.id] ? <Btn mod={MOD} icon="Check" title="Check answer" disabled={!isAnswered(item, ans[item.id])} onPress={check} />
          : i < items.length - 1 ? <Btn mod={MOD} icon="ArrowRight" title="Next" disabled={!isAnswered(item, ans[item.id])} onPress={() => setI(i + 1)} />
          : <Btn mod={MOD} icon="Send" title={segment ? "Finish section" : "Submit exam"} disabled={!allAnswered} onPress={finish} />}
      </Row>
      {onProgress ? <Txt v="tiny" muted>Your progress saves automatically. You can leave and resume this exam later.</Txt> : null}
    </View>
  );
}

/* ---------- NGN case studies ---------- */
function Pill({ label, on, onPress }) {
  const t = useTheme(MOD);
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="radio" accessibilityState={{ checked: on }}
      style={{ flexGrow: 1, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 12, alignItems: "center", borderWidth: 1.5, borderColor: on ? t.tint : t.c.line, backgroundColor: on ? t.soft : t.c.surface }}>
      <Txt v="smallB" color={on ? t.tint : t.c.ink}>{label}</Txt>
    </Pressable>
  );
}

const EHR_TABS = ["Notes", "Vitals", "Labs", "Orders"];

/** The client's chart with Notes / Vitals / Labs / Orders tabs, like the NGN exam screen. */
function Ehr({ cs }) {
  const t = useTheme(MOD); const [tab, setTab] = useState("Notes"); const [open, setOpen] = useState(true);
  const rows = cs.ehr[tab] || [];
  return (
    <Card mod={MOD} style={{ backgroundColor: t.c.sunk, gap: 10 }}>
      <Pressable onPress={() => { tap(); setOpen(!open); }} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Row>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="eyebrow">Electronic health record</Txt>
            <Txt v="bodyB">{cs.title}</Txt>
          </View>
          <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} color={t.c.muted} />
        </Row>
      </Pressable>
      {open ? (
        <>
          <Txt v="small" muted>{cs.profile}</Txt>
          <Seg mod={MOD} value={tab} onChange={setTab} options={EHR_TABS.map((x) => ({ id: x, label: x }))} />
          {rows.map(([h, x]) => (
            <View key={h} style={{ gap: 2 }}>
              <Txt v="tiny" color={t.tint2} style={{ fontFamily: FONTS.monoBold }}>{h}</Txt>
              <Txt v="small">{x}</Txt>
            </View>
          ))}
        </>
      ) : null}
    </Card>
  );
}

/** Trend exhibit shown above an NGN item (values over time). Scrolls sideways on narrow phones. */
function TrendTable({ table }) {
  const t = useTheme(MOD); const W = 92;
  return (
    <View style={{ gap: 4 }}>
      <Txt v="eyebrow">Trend</Txt>
      <HScroll mod={MOD} fade={t.c.surface} hint="Swipe to see every column">
        <View style={{ borderWidth: 1, borderColor: t.c.line, borderRadius: 12, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", backgroundColor: t.soft }}>
            {table.cols.map((c) => <Txt key={c} v="tiny" style={{ width: W, padding: 8, fontFamily: FONTS.bodyBold }}>{c}</Txt>)}
          </View>
          {table.rows.map((r, k) => (
            <View key={k} style={{ flexDirection: "row", backgroundColor: k % 2 ? t.c.sunk : t.c.surface }}>
              {r.map((v, j) => <Txt key={j} v="small" style={{ width: W, padding: 8, fontFamily: j ? FONTS.mono : FONTS.bodyBold }}>{v}</Txt>)}
            </View>
          ))}
        </View>
      </HScroll>
    </View>
  );
}

/** Bowtie item: 1 condition in the middle, 2 actions on the left, 2 parameters to monitor on the right. */
function Bowtie({ item, a, setA }) {
  const t = useTheme(MOD);
  const pick = (key, id, limit) => {
    if (limit === 1) { setA({ ...a, [key]: id }); return; }
    const cur = a[key] || [];
    if (cur.includes(id)) setA({ ...a, [key]: cur.filter((x) => x !== id) });
    else if (cur.length < limit) setA({ ...a, [key]: [...cur, id] });
    else setA({ ...a, [key]: [...cur.slice(1), id] });
  };
  const name = (grp, id) => (grp.opts.find(([x]) => x === id) || [, ""])[1];
  const Slot = ({ text, ph, tone }) => (
    <View style={{ flex: 1, minHeight: 44, padding: 8, borderRadius: 10, borderWidth: 1.5, borderStyle: text ? "solid" : "dashed", borderColor: text ? tone : t.c.line, backgroundColor: text ? t.c.surface : "transparent", justifyContent: "center" }}>
      <Txt v="tiny" color={text ? t.c.ink : t.c.muted} numberOfLines={3}>{text || ph}</Txt>
    </View>
  );
  const acts = a.actions || [], pars = a.params || [];
  const group = (key, grp, limit, title, tone) => (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: "space-between" }}><Txt v="smallB">{title}</Txt><Txt v="mono" muted style={{ fontSize: 12 }}>{limit === 1 ? (a[key] ? 1 : 0) : (a[key] || []).length}/{limit}</Txt></Row>
      {grp.opts.map(([id, x]) => {
        const on = limit === 1 ? a[key] === id : (a[key] || []).includes(id);
        return (
          <Pressable key={id} onPress={() => { tap(); pick(key, id, limit); }} accessibilityRole={limit === 1 ? "radio" : "checkbox"} accessibilityState={{ checked: on }}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 11, borderRadius: 12, borderWidth: on ? 2 : 1, borderColor: on ? tone : t.c.line, backgroundColor: on ? t.soft : t.c.surface }}>
            <Icon name={on ? "CheckCircle2" : "Circle"} size={17} color={on ? tone : t.c.muted} />
            <Txt v="small" style={{ flex: 1 }}>{x}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
  return (
    <View style={{ gap: 14 }}>
      <View style={{ padding: 10, borderRadius: 14, backgroundColor: t.c.sunk, gap: 6 }} accessible accessibilityLabel="Bowtie summary">
        <Row gap={6} center={false}>
          <View style={{ flex: 1, gap: 6 }}><Slot text={name(item.actions, acts[0])} ph="Action 1" tone={t.tint} /><Slot text={name(item.actions, acts[1])} ph="Action 2" tone={t.tint} /></View>
          <View style={{ flex: 1.1, justifyContent: "center" }}><Slot text={name(item.condition, a.condition)} ph="Condition" tone={t.tint2} /></View>
          <View style={{ flex: 1, gap: 6 }}><Slot text={name(item.params, pars[0])} ph="Monitor 1" tone={t.c.ok} /><Slot text={name(item.params, pars[1])} ph="Monitor 2" tone={t.c.ok} /></View>
        </Row>
      </View>
      {group("condition", item.condition, 1, "Condition most likely (choose 1)", t.tint2)}
      {group("actions", item.actions, 2, "Actions to take (choose 2)", t.tint)}
      {group("params", item.params, 2, "Parameters to monitor (choose 2)", t.c.ok)}
    </View>
  );
}

/** "Correct answer" summary for the review screen. */
function NgnKey({ it, a }) {
  const t = useTheme(MOD);
  if (it.kind === "multi") return <Txt v="small"><Txt v="smallB">Correct: </Txt>{it.options.filter(([id]) => it.answer.includes(id)).map(([, x]) => x).join("; ")}</Txt>;
  if (it.kind === "highlight") return <Txt v="small"><Txt v="smallB">Cues to highlight: </Txt>{it.passage.filter(([, id]) => id && it.answer.includes(id)).map(([x]) => x).join("; ")}</Txt>;
  if (it.kind === "single") return <Txt v="small"><Txt v="smallB">Correct: </Txt>{it.options.find(([id]) => id === it.answer)[1]}</Txt>;
  if (it.kind === "cloze") return <Txt v="small"><Txt v="smallB">Correct: </Txt>{it.blanks.map((b) => b.answer).join(" · ")}</Txt>;
  if (it.kind === "order") return (
    <View style={{ gap: 3 }}>
      <Txt v="smallB">Correct order:</Txt>
      {it.answer.map((id, n) => {
        const label = it.steps.find(([s]) => s === id)[1]; const wrong = a && a[n] !== id;
        return <Txt key={id} v="small">{n + 1}. {label}{wrong ? <Txt v="small" color={t.c.crit}> (you put {a[n] ? `"${it.steps.find(([s]) => s === a[n])[1]}"` : "nothing"} here)</Txt> : null}</Txt>;
      })}
    </View>
  );
  if (it.kind === "bowtie") {
    const name = (grp, id) => (grp.opts.find(([x]) => x === id) || [, id])[1];
    return (
      <View style={{ gap: 4 }}>
        <Txt v="small"><Txt v="smallB">Condition: </Txt>{name(it.condition, it.condition.answer)}{a && a.condition !== it.condition.answer ? <Txt v="small" color={t.c.crit}> (you chose {a.condition ? name(it.condition, a.condition) : "nothing"})</Txt> : null}</Txt>
        <Txt v="small"><Txt v="smallB">Actions: </Txt>{it.actions.answer.map((id) => name(it.actions, id)).join("; ")}</Txt>
        <Txt v="small"><Txt v="smallB">Monitor: </Txt>{it.params.answer.map((id) => name(it.params, id)).join("; ")}</Txt>
      </View>
    );
  }
  if (it.kind === "matrix") return (
    <View style={{ gap: 4 }}>
      {it.rows.map(([id, x, c]) => (
        <Txt key={id} v="small">• {x}: <Txt v="smallB">{c}</Txt>{a && a[id] !== c ? <Txt v="small" color={t.c.crit}> (you chose {a[id] || "nothing"})</Txt> : null}</Txt>
      ))}
    </View>
  );
  return null;
}

function NgnCase({ cs, onDone, onExit, exam, initial, onProgress, onSubmit }) {
  const t = useTheme(MOD);
  const items = cs.items;
  const [i, setI] = useState((initial && initial.i) || 0); const [ans, setAns] = useState((initial && initial.ans) || {}); const [done, setDone] = useState(false);
  useEffect(() => { if (onProgress) onProgress({ i, ans }); }, [i, ans]);
  const item = items[i]; const a = ans[item.id];
  const setA = (v) => setAns({ ...ans, [item.id]: v });
  const answered = (it) => {
    const x = ans[it.id]; if (!x) return false;
    if (it.kind === "multi" || it.kind === "highlight") return x.length > 0;
    if (it.kind === "order") return x.length === it.steps.length;
    if (it.kind === "cloze") return it.blanks.every((b) => x[b.id]);
    if (it.kind === "matrix") return it.rows.every(([id]) => x[id]);
    if (it.kind === "bowtie") return !!x.condition && (x.actions || []).length === 2 && (x.params || []).length === 2;
    return true;
  };
  const totals = items.map((it) => scoreNgnItem(it, ans[it.id]));
  const got = totals.reduce((n, x) => n + x[0], 0), max = totals.reduce((n, x) => n + x[1], 0);
  const all = items.every(answered);
  const finish = () => {
    if (exam) { onSubmit && onSubmit({ got, max, ans }); return; }
    setDone(true); buzz(); onDone({ mode: "NGN Case Study", score: `${got}/${max} pts · ${cs.title}`, pct: Math.round(got / max * 100), date: todayKey() });
  };

  return (
    <View style={{ gap: 14 }}>
      <Ehr cs={cs} />
      <HScroll mod={MOD} fade={t.c.bg} hint="Swipe to see all six steps" contentContainerStyle={{ gap: 6 }}>
        {items.map((it, j) => <Chip key={it.id} mod={MOD} tone={j === i && !done ? "acc" : answered(it) ? "acc2" : "mute"} active={j === i && !done} text={`${j + 1}. ${it.step}`} onPress={() => { setI(j); }} />)}
      </HScroll>
      {done ? (
        <View style={{ gap: 12 }}>
          <Card mod={MOD} style={{ gap: 4 }}>
            <Txt v="eyebrow">NGN case study · {cs.title}</Txt>
            <Txt v="big" color={t.tint}>{got}/{max}</Txt>
            <Txt v="small" muted>points · 0/1 and +/− partial-credit scoring, as on the NGN</Txt>
          </Card>
          {items.map((it, j) => (
            <Accordion key={it.id} mod={MOD} title={`${j + 1}. ${it.step}`} meta={<Chip text={`${totals[j][0]}/${totals[j][1]}`} />}>
              <Txt v="small" muted>{it.stem}</Txt>
              <NgnKey it={it} a={ans[it.id]} />
              <Note mod={MOD} tone="acc2" icon="Lightbulb">{it.rationale}</Note>
            </Accordion>
          ))}
          <Row gap={10}>
            <View style={{ flex: 1 }}><Btn mod={MOD} kind="secondary" icon="Layers" title="Other cases" onPress={onExit} full /></View>
            <View style={{ flex: 1 }}><Btn mod={MOD} icon="Check" title="Done" onPress={() => router.back()} full /></View>
          </Row>
        </View>
      ) : (
        <Card mod={MOD} key={item.id} style={{ gap: 12 }}>
          <Txt v="eyebrow">Clinical judgment step {i + 1} · {item.step}</Txt>
          {item.table ? <TrendTable table={item.table} /> : null}
          <Txt v="bodyB" style={{ fontSize: 16, lineHeight: 23 }}>{item.stem}</Txt>

          {item.kind === "bowtie" ? <Bowtie item={item} a={a || {}} setA={setA} /> : null}

          {item.kind === "multi" ? item.options.map(([id, x]) => {
            const sel = (a || []).includes(id);
            return <Check key={id} mod={MOD} checked={sel} label={x} onToggle={() => setA(sel ? a.filter((y) => y !== id) : [...(a || []), id])} />;
          }) : null}

          {item.kind === "single" ? item.options.map(([id, x]) => (
            <Option key={id} mod={MOD} label={x} state={a === id ? "sel" : null} onPress={() => setA(id)} />
          )) : null}

          {item.kind === "highlight" ? (
            <View style={{ padding: 12, borderRadius: 14, backgroundColor: t.c.sunk }}>
              <Txt v="body" style={{ lineHeight: 30 }}>
                {item.passage.map(([x, id], n) => {
                  if (!id) return <Txt key={n} v="body" muted>{x}</Txt>;
                  const sel = (a || []).includes(id);
                  return (
                    <Txt key={n} v="bodyB" accessibilityRole="checkbox" accessibilityState={{ checked: sel }}
                      onPress={() => { tap(); setA(sel ? a.filter((y) => y !== id) : [...(a || []), id]); }}
                      style={{ backgroundColor: sel ? "#FDE68A" : "transparent", color: sel ? "#1a1204" : t.c.ink, textDecorationLine: sel ? "none" : "underline" }}>{x}</Txt>
                  );
                })}
              </Txt>
              <Txt v="tiny" muted style={{ marginTop: 8 }}>Tap a finding to highlight it; tap again to remove.</Txt>
            </View>
          ) : null}

          {item.kind === "order" ? (
            <View style={{ gap: 8 }}>
              {item.steps.map(([id, x]) => {
                const pos = (a || []).indexOf(id);
                return (
                  <Pressable key={id} accessibilityRole="button" accessibilityLabel={`${x}${pos >= 0 ? `, step ${pos + 1}` : ""}`}
                    onPress={() => { tap(); const cur = a || []; setA(pos >= 0 ? cur.filter((y) => y !== id) : [...cur, id]); }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: pos >= 0 ? t.tint : t.c.line, backgroundColor: pos >= 0 ? t.soft : t.c.surface }}>
                    <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: pos >= 0 ? t.tint : t.c.sunk }}>
                      <Txt v="smallB" color={pos >= 0 ? "#fff" : t.c.muted}>{pos >= 0 ? pos + 1 : "–"}</Txt>
                    </View>
                    <Txt v="body" style={{ flex: 1 }}>{x}</Txt>
                  </Pressable>
                );
              })}
              {(a || []).length ? <Pressable onPress={() => { tap(); setA([]); }} hitSlop={8}><Txt v="smallB" color={t.tint2}>Clear order</Txt></Pressable> : null}
            </View>
          ) : null}

          {item.kind === "cloze" ? item.blanks.map((b) => (
            <View key={b.id} style={{ gap: 6 }}>
              <Txt v="body">{b.pre}</Txt>
              <Select mod={MOD} value={(a || {})[b.id] || ""} placeholder="Select…" options={b.opts} onChange={(v) => setA({ ...(a || {}), [b.id]: v })} />
            </View>
          )) : null}

          {item.kind === "matrix" ? item.rows.map(([id, x]) => (
            <View key={id} style={{ gap: 7, padding: 11, borderRadius: 14, backgroundColor: t.c.sunk }}>
              <Txt v="smallB">{x}</Txt>
              <Grid min={90} gap={6}>
                {item.cols.map((c) => <Pill key={c} label={c} on={(a || {})[id] === c} onPress={() => setA({ ...(a || {}), [id]: c })} />)}
              </Grid>
            </View>
          )) : null}

          <Row gap={10} style={{ justifyContent: "space-between", marginTop: 4 }}>
            <Btn mod={MOD} kind="secondary" icon="ArrowLeft" title="Back" disabled={i === 0} onPress={() => setI(i - 1)} />
            {i < items.length - 1 ? <Btn mod={MOD} icon="ArrowRight" title="Next" onPress={() => setI(i + 1)} />
              : <Btn mod={MOD} icon="Send" title={exam ? "Finish case study" : "Submit case study"} disabled={!all} onPress={finish} />}
          </Row>
          {i === items.length - 1 && !all ? <Txt v="tiny" muted>Answer all six steps to submit. Unanswered steps are gray in the bar above.</Txt> : null}
        </Card>
      )}
    </View>
  );
}

/** Case picker, then the chosen case. */
function NGN({ onDone }) {
  const t = useTheme(MOD); const { state } = useApp();
  const [caseId, setCaseId] = useState(null);
  const cs = NGN_CASES.find((c) => c.id === caseId);
  if (cs) return <NgnCase key={cs.id} cs={cs} onDone={onDone} onExit={() => setCaseId(null)} />;
  const best = (c) => {
    const runs = state.exams.filter((e) => e.mode === "NGN Case Study" && String(e.score).includes(c.title));
    return runs.length ? Math.max(...runs.map((e) => e.pct)) : null;
  };
  return (
    <View style={{ gap: 12 }}>
      <Note mod={MOD} tone="acc" icon="Network" title="Next Generation NCLEX case studies">
        Each case unfolds across the six steps of the NCSBN Clinical Judgment Measurement Model. Review the chart tabs (Notes, Vitals, Labs, Orders), answer each item, then submit for NGN-style scoring and full rationales.
      </Note>
      {NGN_CASES.map((c) => {
        const b = best(c);
        return (
          <Card key={c.id} mod={MOD} onPress={() => setCaseId(c.id)} style={{ gap: 8 }}>
            <Row gap={12}>
              <IconTile mod={MOD} icon={c.icon} size={44} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="h3">{c.title}</Txt>
                <Txt v="small" muted>{c.sub}</Txt>
              </View>
              <Icon name="ChevronRight" size={18} color={t.c.muted} />
            </Row>
            <Row gap={6} style={{ flexWrap: "wrap" }}>
              <Chip mod={MOD} tone="mute" text={c.area} />
              <Chip mod={MOD} tone="mute" text={`6 items · ${[...new Set(c.items.map((x) => KIND_LABEL[x.kind]))].join(", ")}`} />
              {b !== null ? <Chip mod={MOD} tone={b >= 75 ? "ok" : "acc2"} text={`Best ${b}%`} /> : null}
            </Row>
          </Card>
        );
      })}
    </View>
  );
}
const KIND_LABEL = { multi: "SATA", single: "MCQ", matrix: "matrix", cloze: "drop-down", highlight: "highlight", order: "ordered response", bowtie: "bowtie" };

/* ---------- the three benchmark exams ---------- */

/** Resume-or-start screen shown before a long exam. */
function StartGate({ title, intro, saved, progress, onResume, onNew, children }) {
  const t = useTheme(MOD);
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD} style={{ gap: 10 }}>
        <Txt v="h2">{title}</Txt>
        <Txt v="body">{intro}</Txt>
        {children}
      </Card>
      {saved ? (
        <Card mod={MOD} accent style={{ gap: 10 }}>
          <Row gap={8}><Icon name="History" size={18} color={t.tint} /><Txt v="bodyB">You have an exam in progress</Txt></Row>
          <Txt v="small" muted>{progress}</Txt>
          <Btn mod={MOD} full icon="Play" title="Resume where I left off" onPress={onResume} />
          <Btn mod={MOD} full kind="secondary" icon="RotateCcw" title="Discard it and start over" onPress={onNew} />
        </Card>
      ) : <Btn mod={MOD} full icon="Play" title="Start exam" onPress={onNew} />}
    </View>
  );
}

/** After the Diagnostic Benchmark: turn the result into a plan (Pro), or open it if already Pro. */
function NextUp() {
  const t = useTheme(MOD); const { isPro } = usePro();
  return (
    <Card mod={MOD} accent style={{ gap: 10 }}>
      <Row gap={10}><Icon name="Route" size={20} color={t.tint} /><Txt v="h3" style={{ flex: 1 }}>{isPro ? "Your study plan is updated" : "Turn this result into a plan"}</Txt></Row>
      <Txt v="small" muted>{isPro ? "Your weakest areas now lead your daily practice, and every miss comes back in smart review."
        : "Pro builds a daily plan around your weakest areas, brings back every question you missed at the right time, and paces you to your exam date."}</Txt>
      <Btn mod={MOD} icon={isPro ? "ArrowRight" : "Crown"} title={isPro ? "Open my study plan" : "See Pro"} onPress={() => router.push(isPro ? "/plan" : "/paywall")} />
    </Card>
  );
}

function Test1({ timed, onDone }) {
  const { state, dispatch } = useApp(); const saved = state.runs && state.runs.t1;
  const [run, setRun] = useState(null);
  const save = (data) => dispatch({ type: "run", key: "t1", data });
  if (!run) {
    return (
      <StartGate title={TESTS.t1.title} saved={saved}
        intro={`${TESTS.t1.count} questions balanced across all eight NCLEX-RN Client Needs categories, scored like the NCLEX, with a full category breakdown and a rationale for every answer.${timed ? " Timed: 90 seconds per question." : ""}`}
        progress={saved ? `Question ${saved.i + 1} of ${saved.items.length}` : null}
        onResume={() => setRun(saved)}
        onNew={() => { const r = { items: buildTest1(), timed, i: 0, ans: {}, left: timed ? TESTS.t1.count * 90 : null }; save(r); setRun(r); }} />
    );
  }
  return (
    <QuizRunner key={run.items[0].id + run.items.length} items={run.items} mode={TESTS.t1.title} timed={!!run.timed} initial={run}
      onProgress={(p) => save({ ...run, ...p })} onStat={(res) => dispatch({ type: "qstat", res })} after={<NextUp />}
      onDone={(rec) => { save(null); onDone(rec); }} onRestart={() => setRun(null)} />
  );
}

function Test2({ onDone }) {
  const t = useTheme(MOD); const { state, dispatch } = useApp(); const saved = state.runs && state.runs.t2;
  const [run, setRun] = useState(null); const [open, setOpen] = useState(null);
  const save = (data) => dispatch({ type: "run", key: "t2", data });
  const qCount = (r) => r.blocks.slice(0, r.b).reduce((n, b) => n + (b.kind === "case" ? 6 : b.items.length), 0);
  if (!run) {
    return (
      <StartGate title={TESTS.t2.title} saved={saved}
        intro={`${TESTS.t2.count} items: ${T2_CASES} unfolding Next Generation NCLEX case studies (picked from ${NGN_CASES.length}, so each attempt is different; 6 clinical-judgment steps each, with chart tabs) placed between sections of stand-alone questions, including select-all-that-apply and ordered-response items.`}
        progress={saved ? `Section ${saved.b + 1} of ${saved.blocks.length} · ${qCount(saved)} of ${TESTS.t2.count} items done` : null}
        onResume={() => setRun(saved)}
        onNew={() => { const r = { blocks: buildTest2(), b: 0, results: [], cur: null }; save(r); setRun(r); }} />
    );
  }

  const next = (res) => {
    const r = { ...run, results: [...run.results, res], b: run.b + 1, cur: null };
    if (r.b >= r.blocks.length) {
      const { g, m, byCat } = tally(r);
      onDone({ mode: TESTS.t2.title, score: `${g}/${m} pts`, pct: Math.round((g / m) * 100), date: todayKey(), byCat });
      buzz(); save(null);
    } else save(r);
    setRun(r);
  };

  if (run.b >= run.blocks.length) {
    const { g, m, byCat } = tally(run);
    const standalone = run.blocks.flatMap((b, k) => (b.kind === "items" ? b.items : []));
    const sAns = Object.assign({}, ...run.blocks.map((b, k) => (b.kind === "items" ? run.results[k].ans : {})));
    return (
      <View style={{ gap: 16 }}>
        <Card mod={MOD} style={{ gap: 6 }}>
          <Txt v="eyebrow">{TESTS.t2.title}</Txt>
          <Row gap={14}>
            <Txt v="big" color={t.tint} style={{ fontSize: 56, lineHeight: 60 }}>{Math.round((g / m) * 100)}%</Txt>
            <View style={{ flex: 1 }}><Txt v="bodyB">{g} of {m} points</Txt><Txt v="small" muted>0/1 scoring for single-answer, ordered-response and matrix rows; +/− for select-all-that-apply and highlight items.</Txt></View>
          </Row>
        </Card>
        <CatBreakdown byCat={byCat} />
        <Txt v="h3">Case studies</Txt>
        {run.blocks.map((b, k) => {
          if (b.kind !== "case") return null;
          const cs = NGN_CASES.find((c) => c.id === b.id); const res = run.results[k];
          return (
            <Accordion key={k} mod={MOD} title={cs.title} meta={<Chip text={`${res.got}/${res.max}`} />}>
              {cs.items.map((it, j) => (
                <View key={it.id} style={{ gap: 6 }}>
                  <Txt v="smallB">{j + 1}. {it.step} · {scoreNgnItem(it, res.ans[it.id])[0]}/{scoreNgnItem(it, res.ans[it.id])[1]}</Txt>
                  <Txt v="small" muted>{it.stem}</Txt>
                  <NgnKey it={it} a={res.ans[it.id]} />
                  <Note mod={MOD} tone="acc2" icon="Lightbulb">{it.rationale}</Note>
                </View>
              ))}
            </Accordion>
          );
        })}
        <Txt v="h3">Stand-alone questions</Txt>
        <ResultTable items={standalone} answers={sAns} onOpen={setOpen} />
        <Row gap={10} wrap>
          <Btn mod={MOD} kind="secondary" icon="RotateCcw" title="Take it again" onPress={() => setRun(null)} />
          <Btn mod={MOD} icon="Check" title="Done" onPress={() => router.back()} />
        </Row>
        <RationaleSheet item={open} chosen={open && sAns[open.id]} onClose={() => setOpen(null)} />
      </View>
    );
  }

  const blk = run.blocks[run.b]; const cs = blk.kind === "case" ? NGN_CASES.find((c) => c.id === blk.id) : null;
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD} style={{ gap: 6, backgroundColor: t.soft }}>
        <Row>
          <Txt v="eyebrow" style={{ flex: 1 }}>Section {run.b + 1} of {run.blocks.length}</Txt>
          <Txt v="mono" muted>{qCount(run)}/{TESTS.t2.count}</Txt>
        </Row>
        <Txt v="bodyB">{cs ? `Case study: ${cs.title}` : `${blk.items.length} stand-alone questions`}</Txt>
        <Bar mod={MOD} pct={qCount(run) / TESTS.t2.count} />
      </Card>
      {cs ? <NgnCase key={"c" + run.b} cs={cs} exam initial={run.cur} onProgress={(p) => save({ ...run, cur: p })} onSubmit={next} />
        : <QuizRunner key={"s" + run.b} items={blk.items} mode={TESTS.t2.title} segment initial={run.cur} onProgress={(p) => save({ ...run, cur: p })} onSegmentDone={(ans) => next({ ans })} />}
    </View>
  );
}

/** Totals for Test 2: stand-alone items by their category, each case study under its Client Needs area. */
function tally(r) {
  let g = 0, m = 0; const byCat = {};
  r.blocks.forEach((b, k) => {
    const res = r.results[k]; if (!res) return;
    if (b.kind === "items") {
      Object.entries(breakdown(b.items, res.ans)).forEach(([c, [x, y]]) => { byCat[c] = byCat[c] || [0, 0]; byCat[c][0] += x; byCat[c][1] += y; g += x; m += y; });
    } else {
      const cs = NGN_CASES.find((c) => c.id === b.id); byCat[cs.area] = byCat[cs.area] || [0, 0];
      byCat[cs.area][0] += res.got; byCat[cs.area][1] += res.max; g += res.got; m += res.max;
    }
  });
  return { g, m, byCat };
}

function AbilityTrace({ hist }) {
  const t = useTheme(MOD); const [w, setW] = useState(0);
  const W = 520, H = 160, pad = 28;
  const pts = [0, ...hist.map((h) => h.theta)];
  const lim = Math.max(2, ...pts.map((v) => Math.abs(v)));
  const x = (i) => pad + (i / Math.max(1, pts.length - 1)) * (W - pad * 2); const y = (v) => H / 2 - (v / lim) * (H / 2 - 16);
  const r = hist.length > 40 ? 2.5 : 5;
  return (
    <Card mod={MOD} padding={10}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityLabel="Ability estimate after each item">
        {w > 0 ? (
          <Svg width={w} height={(w * H) / W} viewBox={`0 0 ${W} ${H}`}>
            <Line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} stroke={t.tint} strokeDasharray="5 4" strokeWidth={1.5} />
            <SvgText x={W - pad} y={y(0) - 6} textAnchor="end" fontSize="12" fill={t.tint} fontFamily={FONTS.mono}>passing line</SvgText>
            <Polyline fill="none" stroke={t.tint2} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" points={pts.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
            {pts.map((v, i) => (i > 0 ? <Circle key={i} cx={x(i)} cy={y(v)} r={r} fill={hist[i - 1].ok ? t.c.ok : t.c.crit} /> : null))}
            <SvgText x={pad} y={H - 6} fontSize="12" fill={t.c.muted} fontFamily={FONTS.mono}>start</SvgText>
            <SvgText x={W - pad} y={H - 6} textAnchor="end" fontSize="12" fill={t.c.muted} fontFamily={FONTS.mono}>item {hist.length}</SvgText>
          </Svg>
        ) : <View style={{ height: 120 }} />}
      </View>
    </Card>
  );
}

/** Test 3: adaptive predictor using NCLEX-RN length and stopping rules (85–150 items, 95% confidence). */
function Test3({ onDone }) {
  const t = useTheme(MOD); const { state, dispatch } = useApp(); const saved = state.runs && state.runs.t3;
  const [run, setRun] = useState(null); const [sel, setSel] = useState(null); const [open, setOpen] = useState(null);
  const save = (data) => dispatch({ type: "run", key: "t3", data });
  if (!run) {
    return (
      <StartGate title={TESTS.t3.title} saved={saved}
        intro={`Computer-adaptive, like the real NCLEX-RN: questions get harder after correct answers and easier after misses, drawn from a ${TESTS.t3.count}-question pool with the official Client Needs mix. It stops between 85 and 150 questions, as soon as the result is 95% certain. Each retake uses questions you haven't seen first.`}
        progress={saved ? `Question ${saved.hist.length + 1} · ${saved.hist.length} answered` : null}
        onResume={() => setRun(saved)}
        onNew={() => { const r = { hist: [], cur: nextItem([], state.catSeen || []), result: null }; save(r); setRun(r); }} />
    );
  }

  if (run.result) {
    const { verdict, theta, se, reason } = run.result; const hist = run.hist;
    const items = hist.map((h) => h.item); const answers = Object.fromEntries(hist.map((h) => [h.item.id, h.chosen]));
    const v = verdict === "pass" ? ["Above the passing line", "ok"] : ["Below the passing line", "crit"];
    return (
      <View style={{ gap: 14 }}>
        <Card mod={MOD} style={{ gap: 8 }}>
          <Chip mod={MOD} tone={v[1]} icon="Gauge" text={v[0]} />
          <Txt v="body">Stopped after <Txt v="bodyB">{hist.length}</Txt> questions · {reason}</Txt>
          <Txt v="small" muted>Ability estimate <Txt v="mono">{theta.toFixed(2)}</Txt> (± <Txt v="mono">{(1.96 * se).toFixed(2)}</Txt> at 95%) · {hist.filter((h) => h.ok).length} fully correct</Txt>
        </Card>
        <AbilityTrace hist={hist} />
        <CatBreakdown byCat={breakdown(items, answers)} />
        <Note mod={MOD}>This practice test uses the NCLEX's length and stopping rules, but it is scored from this app's own question difficulty ratings. It can show your trend, not predict your official result.</Note>
        <ResultTable items={items} answers={answers} onOpen={setOpen} />
        <Row gap={10} wrap>
          <Btn mod={MOD} kind="secondary" icon="RotateCcw" title="Take it again" onPress={() => setRun(null)} />
          <Btn mod={MOD} icon="Check" title="Done" onPress={() => router.back()} />
        </Row>
        <RationaleSheet item={open} chosen={open && answers[open.id]} onClose={() => setOpen(null)} />
      </View>
    );
  }

  const cur = run.cur;
  const submit = () => {
    const ok = isCorrect(cur, sel); const b = difficultyOf(cur);
    const raw = [...run.hist, { item: cur, chosen: sel, ok, b }];
    const s = stopRule(raw); raw[raw.length - 1].theta = s.theta;
    setSel(null);
    if (s.stop || !nextItem(raw, [])) {
      const reason = raw.length >= CAT_MAX ? "maximum length reached; judged on the final ability estimate" : raw.length >= CAT_MIN ? "95% confidence rule met" : "question pool used up";
      const r = { ...run, hist: raw, cur: null, result: { verdict: s.verdict || (s.theta > 0 ? "pass" : "fail"), theta: s.theta, se: s.se, reason } };
      setRun(r); save(null); buzz();
      dispatch({ type: "catSeen", ids: raw.map((h) => h.item.id) });
      onDone({ mode: TESTS.t3.title, score: r.result.verdict === "pass" ? "Above passing line" : "Below passing line", pct: Math.round(100 / (1 + Math.exp(-s.theta))), date: todayKey(), byCat: breakdown(raw.map((h) => h.item), Object.fromEntries(raw.map((h) => [h.item.id, h.chosen]))) });
    } else {
      const r = { ...run, hist: raw, cur: nextItem(raw, state.catSeen || []) };
      setRun(r); save(r);
    }
  };
  const n = run.hist.length;
  return (
    <View style={{ gap: 14 }}>
      <Row gap={8} wrap>
        <Chip mod={MOD} tone="acc" text={cur.cat} />
        <View style={{ flex: 1 }} />
        <Txt v="mono" muted>Question {n + 1} · min {CAT_MIN} / max {CAT_MAX}</Txt>
      </Row>
      <Bar mod={MOD} pct={Math.min(1, n / CAT_MAX)} />
      <Card mod={MOD}><QuestionView item={cur} value={sel} onChange={setSel} /></Card>
      <Row style={{ justifyContent: "flex-end" }}><Btn mod={MOD} icon="Send" title="Submit answer" disabled={!isAnswered(cur, sel)} onPress={submit} /></Row>
      <Txt v="tiny" muted>No going back — like the real CAT, each answer is final. Progress saves after every answer.</Txt>
    </View>
  );
}

/* ---------- Flashcards ---------- */
const makeDeck = () => {
  const src = BANK.length ? shuffle(BANK.filter((q) => q.bank === "NCLEX")).slice(0, 40) : [...DIAG, ...CAT_POOL];
  return shuffle(src.map((q) => ({ id: q.id, cat: q.cat, front: q.stem, answer: [].concat(q.answer).map((id) => (q.options.find((o) => o.id === id) || {}).text).join(typeOf(q) === "order" ? " → " : "; "), back: q.takeaway })));
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
const TITLES = { bank: "Question bank", t1: TESTS.t1.title, t2: TESTS.t2.title, t3: TESTS.t3.title, ngn: "NGN Case Practice", flash: "Flashcards" };
const ALIAS = { diag: "t1", cat: "t3" };   // older links

export default function Quiz() {
  const p = useLocalSearchParams();
  const asked = ALIAS[p.mode] || p.mode;
  const mode = TITLES[asked] ? asked : "t1";
  const timed = p.timed === "1";
  const { dispatch } = useApp();
  const [runKey, setRunKey] = useState(0);
  const run = useMemo(() => (mode === "bank" ? getRun() : null), [mode]);
  const record = (rec) => {
    // Smart review and study-plan sessions update question stats only; they don't fill the exam history.
    if (mode === "bank" && run && run.label) return;
    dispatch({ type: "exam", rec });
    // A good moment to ask for a rating: a strong result on a benchmark exam.
    if (rec && rec.pct >= 70 && [TESTS.t1.title, TESTS.t2.title, TESTS.t3.title].includes(rec.mode)) setTimeout(() => { maybeAskForRating(); }, 2500);
  };

  let body = null;
  if (mode === "bank") {
    body = run && run.items && run.items.length
      ? <QuizRunner key={runKey} items={run.items} mode={run.label || "Question Bank"} tutor={run.tutor} onDone={record} onStat={(res) => dispatch({ type: "qstat", res })} />
      : <Note mod={MOD} tone="warn" icon="AlertTriangle" title="No question set">Go back to the Exam tab and build a set from the question bank.</Note>;
  } else if (mode === "t1") {
    body = <Test1 timed={timed} onDone={record} />;
  } else if (mode === "t2") {
    body = <ProGate mod={MOD} feature={TESTS.t2.title} desc="150 items with four unfolding NGN case studies (from a set of eight), chart tabs, bowtie, select-all-that-apply and ordered-response questions, and full rationales."><Test2 onDone={record} /></ProGate>;
  } else if (mode === "t3") {
    body = <Test3 onDone={record} />;
  } else if (mode === "ngn") {
    body = <ProGate mod={MOD} feature="NGN case studies" desc="Eight unfolding Next Generation NCLEX cases with chart tabs, bowtie and trend items, all six clinical-judgment steps and full rationales."><NGN onDone={record} /></ProGate>;
  } else {
    body = <Flashcards />;
  }

  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title={mode === "bank" && run && run.label ? run.label : TITLES[mode] + (mode === "t1" && timed ? " · Timed" : mode === "bank" && run ? (run.tutor ? " · Tutor" : " · Exam") : "")} />
      {body}
    </Screen>
  );
}
