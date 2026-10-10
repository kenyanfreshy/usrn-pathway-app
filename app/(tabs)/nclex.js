// Module 3 · NCLEX-RN — question bank builder, benchmarks, heatmap and score history.
import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Hero, Card, Row, Txt, Btn, Seg, Select, Check, Bar, Icon, IconTile, Chip, tap, Grid, HScroll } from "../../src/ui";
import { TutorCard } from "../../src/tutor";
import { EnglishHub } from "../../src/english/Hub";
import { DestPill } from "../../src/dest";
import { useTheme, FONTS, mix } from "../../src/theme";
import { useApp } from "../../src/state";
import { NCLEX_FIT, destId, destOf, DESTINATIONS } from "../../src/data/global";
import { usePro, ProBadge } from "../../src/pro";
import { dueCount, startReview, daysToExam } from "../../src/study";
import { shuffle, fmtDate } from "../../src/util";
import { shuffleItem, TESTS, blueprintSample, CAT_SHORT, fmtN } from "../../src/exam";
import { NGN_CASES } from "../../src/data/ngn";
import { setRun } from "../../src/runStore";
import BANK_ALL from "../../src/data/questions.json";

const BANK = BANK_ALL.filter((q) => q.active !== false);
const MOD = "nclex";

function MiniStat({ k, v }) {
  const t = useTheme(MOD);
  return (
    <View style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 14, backgroundColor: t.c.surface, borderWidth: 1, borderColor: t.c.line, alignItems: "center" }}>
      <Txt v="mono" style={{ fontFamily: FONTS.monoBold, fontWeight: FONTS.monoBold ? undefined : "700" }}>{String(v)}</Txt>
      <Txt v="eyebrow" style={{ fontSize: 9.5 }}>{k}</Txt>
    </View>
  );
}

// One color per topic (dark enough for white count badges to stay readable).
const TOPIC_COLORS = {
  "Cardiovascular": "#DC2626", "Respiratory": "#0369A1", "Mental Health": "#7C3AED", "Pediatrics": "#DB2777",
  "Maternal & Newborn": "#A21CAF", "Ethics & Professional Practice": "#4338CA", "Fundamentals & Safety": "#0F766E",
  "Neurological": "#1D4ED8", "Gastrointestinal": "#B45309", "Pharmacology": "#15803D", "Multisystem & Shock": "#C2410C",
  "Hematology & Oncology": "#9F1239", "Leadership & Delegation": "#4D7C0F", "Endocrine": "#A16207",
  "Fluids & Electrolytes": "#0E7490", "Integumentary": "#57534E", "Musculoskeletal": "#475569",
  "Renal & Genitourinary": "#047857", "Immunology & Infectious Disease": "#6B21A8",
};
const EXTRA = ["#BE123C", "#0891B2", "#65A30D", "#9333EA", "#EA580C"];
const topicColor = (label) => TOPIC_COLORS[label] || EXTRA[[...label].reduce((n, c) => n + c.charCodeAt(0), 0) % EXTRA.length];

function TopicChip({ label, n, on, onPress }) {
  const t = useTheme(MOD); const c = topicColor(label);
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`${label}, ${n} questions`}
      style={({ pressed }) => ({ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 10, paddingRight: 8, paddingVertical: 9, borderRadius: 12, overflow: "hidden",
        backgroundColor: mix(c, t.c.surface, on ? (t.dark ? 0.6 : 0.78) : (t.dark ? 0.8 : 0.9)), borderWidth: on ? 2 : 1, borderColor: on ? c : mix(c, t.c.surface, 0.7),
        transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: c }} />
      {on ? <Icon name="CheckCircle2" size={15} color={c} /> : null}
      <Txt v="smallB" style={{ flex: 1 }} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75} textBreakStrategy="simple">{label}</Txt>
      <View style={{ minWidth: 30, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99, backgroundColor: c, alignItems: "center" }}>
        <Txt v="tiny" color="#fff" style={{ fontFamily: FONTS.monoBold, fontWeight: FONTS.monoBold ? undefined : "700" }}>{n}</Txt>
      </View>
    </Pressable>
  );
}

function BankBuilder({ bank, state }) {
  const t = useTheme(MOD);
  const st = state.qstats || {};
  const [topics, setTopics] = useState([]); const [count, setCount] = useState(10);
  const [tutor, setTutor] = useState(true); const [filter, setFilter] = useState("all");
  const pool0 = bank;
  const topicCounts = {}; pool0.forEach((q) => { topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1; });
  const pool = pool0.filter((q) => (!topics.length || topics.includes(q.topic)) && (filter === "all" || (filter === "unseen" && !st[q.id]) || (filter === "missed" && st[q.id] && !st[q.id][2])));
  const seen = bank.filter((q) => st[q.id]).length; const mastered = bank.filter((q) => st[q.id] && st[q.id][2]).length;
  const missed = bank.filter((q) => st[q.id] && !st[q.id][2]).length;
  const toggle = (x) => setTopics(topics.includes(x) ? topics.filter((y) => y !== x) : [...topics, x]);
  const go = () => {
    setRun({ items: blueprintSample(pool, count).map(shuffleItem), tutor });
    router.push({ pathname: "/quiz", params: { mode: "bank" } });
  };
  return (
    <Card mod={MOD} accent style={{ backgroundColor: t.soft, gap: 14 }}>
      <Row gap={12} center={false}>
        <IconTile mod={MOD} icon="Library" size={48} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="h2">Question Bank</Txt>
          <Txt v="small" muted>{bank.length} NCLEX-RN questions with full rationales, organized by the NCSBN Client Needs categories.</Txt>
        </View>
      </Row>
      <Row gap={8}>
        {[["Seen", seen], ["Mastered", mastered], ["To review", missed]].map(([k, v]) => <MiniStat key={k} k={k} v={v} />)}
      </Row>
      <Bar mod={MOD} pct={bank.length ? seen / bank.length : 0} />
      <Seg mod={MOD} even value={filter} onChange={setFilter} options={[{ id: "all", label: "All Questions" }, { id: "unseen", label: "Unseen" }, { id: "missed", label: "Missed" }]} />
      <View style={{ gap: 8 }}>
        <Row>
          <Txt v="eyebrow" style={{ flex: 1 }}>Topics {topics.length ? `(${topics.length} selected)` : "(all)"}</Txt>
          {topics.length > 0 ? <Pressable onPress={() => { tap(); setTopics([]); }} hitSlop={8}><Txt v="smallB" color={t.tint2}>Clear</Txt></Pressable> : null}
        </Row>
        <Grid min={150} gap={8}>
          {Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).map(([x, n]) => (
            <TopicChip key={x} label={x} n={n} on={topics.includes(x)} onPress={() => toggle(x)} />
          ))}
        </Grid>
      </View>
      <Grid min={150} gap={12}>
        <View style={{ flexGrow: 1 }}>
          <Select mod={MOD} label="Questions" value={count} onChange={setCount} options={[10, 25, 50, 75, 100].map((n) => ({ value: n, label: String(n) }))} />
        </View>
        <View style={{ flexGrow: 1, gap: 5 }}>
          <Txt v="smallB" muted>Mode</Txt>
          <Seg mod={MOD} even value={tutor ? "tutor" : "exam"} onChange={(v) => setTutor(v === "tutor")} options={[{ id: "tutor", label: "Tutor", icon: "GraduationCap" }, { id: "exam", label: "Exam", icon: "Timer" }]} />
        </View>
      </Grid>
      <Row gap={10}>
        <Txt v="small" muted style={{ flex: 1 }}>{pool.length} available</Txt>
        <Btn mod={MOD} icon="Play" title={`Start ${Math.min(count, pool.length)}`} disabled={!pool.length} onPress={go} />
      </Row>
      <Txt v="tiny" muted>{tutor ? "Tutor mode shows the answer and rationale after each question." : "Exam mode holds all answers until you submit, like the real test."} Answer order is shuffled each time.</Txt>
    </Card>
  );
}

const MODES = [
  { id: "t1", n: "Test 1", title: TESTS.t1.title, desc: `${TESTS.t1.count} questions across all 8 Client Needs categories, with a category breakdown.`, icon: "Activity", save: "t1" },
  { id: "t2", n: "Test 2", title: TESTS.t2.title, desc: `${TESTS.t2.count} items: 4 unfolding NGN case studies (from ${NGN_CASES.length}) plus SATA and ordered-response questions.`, icon: "Network", save: "t2", pro: true },
  { id: "t3", n: "Test 3", title: TESTS.t3.title, desc: `Adaptive, like the NCLEX: 85–150 questions from a ${fmtN(TESTS.t3.count)}-question pool. Stops at 95% confidence.`, icon: "Gauge", save: "t3" },
  { id: "ngn", n: "Practice", title: "NGN Case Practice", desc: "Pick one case study and work through its six clinical-judgment steps.", icon: "Stethoscope", pro: true },
  { id: "flash", n: "Review", title: "Flashcards", desc: "Swipe through high-yield takeaways. Swipe right if you know it, left to see it again.", icon: "Layers" },
];
const OLD_NAME = { t1: "Diagnostic Baseline", t2: "NGN Case Study", t3: "CAT Predictor" };

function Benchmarks({ state }) {
  const { isPro } = usePro(); const [timed, setTimed] = useState(false);
  const last = (md) => state.exams.find((e) => e.mode === md.title || e.mode === OLD_NAME[md.id]);
  const start = (id) => router.push({ pathname: "/quiz", params: id === "t1" ? { mode: id, timed: timed ? "1" : "0" } : { mode: id } });
  return (
    <Grid min={150} gap={12}>
      {MODES.map((md) => {
        const l = md.id === "ngn" || md.id === "flash" ? null : last(md); const saved = md.save && state.runs && state.runs[md.save];
        return (
          <Card key={md.id} mod={MOD} style={{ flexGrow: 1, gap: 8 }}>
            <Row>
              <Txt v="eyebrow" style={{ flex: 1 }}>{md.n}</Txt>
              <IconTile mod={MOD} icon={md.icon} size={36} />
            </Row>
            <Txt v="h3">{md.title}</Txt>
            {md.pro && !isPro ? <ProBadge /> : null}
            <Txt v="small" muted style={{ flexGrow: 1 }}>{md.desc}</Txt>
            {md.id === "t1" ? <Check mod={MOD} checked={timed} onToggle={() => setTimed(!timed)} label="Timed (90 s per question)" /> : null}
            <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }}>{md.id === "flash" ? `${state.flash || 0} reviewed` : saved ? "In progress — resume anytime" : l ? `Last: ${l.score}` : md.id === "ngn" ? `${NGN_CASES.length} cases` : "Not taken yet"}</Txt>
            <Btn mod={MOD} small full icon="Play" title={md.id === "flash" ? "Open Deck" : saved ? "Resume" : l ? "Retake" : "Start"} onPress={() => start(md.id)} />
          </Card>
        );
      })}
    </Grid>
  );
}

/* Short, readable names for each kind of attempt (used as heatmap column headers and history filters). */
const KINDS = [
  { id: "diag", label: "Diagnostic", match: (m) => m === "Diagnostic Benchmark" || m === "Diagnostic Baseline" },
  { id: "ngn", label: "NGN Exam", match: (m) => m === "NGN Clinical Judgment Simulator" },
  { id: "pred", label: "Predictor", match: (m) => m === "Comprehensive Predictor" || m === "CAT Predictor" },
  { id: "case", label: "Case Study", match: (m) => m === "NGN Case Study" },
  { id: "bank", label: "Question Bank", match: () => true },
];
const kindOf = (mode) => KINDS.find((k) => k.match(mode));
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Oct 9" — month names read the same in every country (10-09 means different days in the U.S. and elsewhere). */
const shortDate = (iso) => { const [, m, d] = String(iso).split("-").map(Number); return m ? `${MON[m - 1]} ${d}` : String(iso); };
const heat = (p) => `hsla(${Math.round(p * 1.2)}, 72%, 40%, 0.95)`;

function Heatmap({ exams }) {
  const t = useTheme(MOD);
  const [w, setW] = useState(0);
  const rows = exams.filter((e) => e.byCat).slice(0, 8).reverse();
  if (!rows.length) return null;
  const cats = [...new Set(rows.flatMap((e) => Object.keys(e.byCat)))].sort();
  // Fit the table to the phone: the category column takes about a third of the width (wider on tablets), and the
  // attempt columns share the rest. Only when they'd be narrower than MIN_CW does the table scroll sideways.
  const GAP = 6, MIN_CW = 58;
  const LW = w ? Math.round(Math.min(220, Math.max(96, w * (w > 600 ? 0.26 : 0.32)))) : 150;
  const room = w - LW - GAP * rows.length;
  const fits = w > 0 && room / rows.length >= MIN_CW;
  const CW = fits ? Math.floor(room / rows.length) : 76;
  const small = CW < 78;
  const table = (
    <View style={{ gap: GAP }}>
      <Row gap={GAP} center={false}>
        <View style={{ width: LW, justifyContent: "flex-end" }}><Txt v="eyebrow">Category</Txt></View>
        {rows.map((e, i) => (
          <View key={i} style={{ width: CW, alignItems: "center", gap: 2, paddingVertical: 6, paddingHorizontal: 3, borderRadius: 10, backgroundColor: t.c.sunk }}>
            <Txt v="tiny" style={{ fontFamily: FONTS.bodyBold, textAlign: "center" }} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>{kindOf(e.mode).label}</Txt>
            <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }} numberOfLines={1} adjustsFontSizeToFit>{shortDate(e.date)}</Txt>
          </View>
        ))}
      </Row>
      {cats.map((c) => (
        <Row key={c} gap={GAP}>
          <View style={{ width: LW }} accessible accessibilityLabel={c}><Txt v={small ? "tiny" : "small"} numberOfLines={2}>{LW < 170 ? (CAT_SHORT[c] || c) : c}</Txt></View>
          {rows.map((e, i) => {
            const v = e.byCat[c];
            if (!v || !v[1]) return <View key={i} style={{ width: CW, minHeight: 36, alignItems: "center", justifyContent: "center" }}><Txt v="small" muted>—</Txt></View>;
            const p = Math.round((v[0] / v[1]) * 100);
            return (
              <View key={i} accessible accessibilityLabel={`${c}, ${kindOf(e.mode).label} ${shortDate(e.date)}: ${p} percent`}
                style={{ width: CW, minHeight: 36, paddingVertical: 5, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: heat(p) }}>
                <Txt v={small ? "tiny" : "smallB"} color="#fff" style={{ fontFamily: FONTS.monoBold, fontWeight: FONTS.monoBold ? undefined : "700" }}>{p}%</Txt>
                <Txt v="tiny" color="rgba(255,255,255,0.88)" style={{ fontFamily: FONTS.mono, fontSize: 10 }}>{v[0]}/{v[1]}</Txt>
              </View>
            );
          })}
        </Row>
      ))}
    </View>
  );
  return (
    <Card mod={MOD} style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Txt v="h3">Category Heatmap</Txt>
        <Txt v="tiny" muted>Your last {rows.length} scored attempts, oldest → newest. Each cell is your score in that Client Needs area.</Txt>
      </View>
      <View onLayout={(e) => { const nw = Math.floor(e.nativeEvent.layout.width); if (Math.abs(nw - w) > 1) setW(nw); }}>
        {fits ? table : <HScroll mod={MOD} fade={t.c.surface} hint="Swipe to see all attempts">{table}</HScroll>}
      </View>
      <Row gap={10} wrap>
        {[[40, "Below 50%"], [65, "50–74%"], [90, "75% and up"]].map(([p, l]) => (
          <Row key={l} gap={6}><View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: heat(p) }} /><Txt v="tiny" muted>{l}</Txt></Row>
        ))}
      </Row>
    </Card>
  );
}

/** One attempt in the score history. Tap to expand its Client Needs breakdown. */
function HistoryRow({ e }) {
  const t = useTheme(MOD); const [open, setOpen] = useState(false);
  const cats = e.byCat ? Object.entries(e.byCat).filter(([, v]) => v && v[1]).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]) : [];
  const k = kindOf(e.mode);
  return (
    <Pressable onPress={() => { if (cats.length) { tap(); setOpen(!open); } }} accessibilityRole={cats.length ? "button" : "text"} accessibilityState={cats.length ? { expanded: open } : undefined}
      style={{ padding: 12, borderRadius: 14, backgroundColor: t.c.sunk, gap: 8, borderWidth: open ? 1.5 : 1, borderColor: open ? t.tint : "transparent" }}>
      <Row gap={10} center={false}>
        <View style={{ flex: 1, gap: 3 }}>
          <Txt v="smallB">{e.mode}</Txt>
          <Row gap={6} wrap>
            <Chip mod={MOD} tone="acc" text={k.label} />
            <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }}>{fmtDate(e.date)}</Txt>
          </Row>
        </View>
        <View style={{ alignItems: "flex-end", gap: 2, maxWidth: "45%" }}>
          <Txt v="h3" color={t.tint}>{e.pct != null ? `${e.pct}%` : ""}</Txt>
          <Txt v="tiny" muted style={{ textAlign: "right" }}>{e.score}</Txt>
        </View>
        {cats.length ? <View style={{ paddingTop: 4 }}><Icon name={open ? "ChevronUp" : "ChevronDown"} size={17} color={t.c.muted} /></View> : null}
      </Row>
      {open ? (
        <View style={{ gap: 7, paddingTop: 4 }}>
          {cats.map(([c, v]) => {
            const p = Math.round((v[0] / v[1]) * 100);
            return (
              <View key={c} style={{ gap: 3 }}>
                <Row gap={8}><Txt v="small" style={{ flex: 1 }}>{c}</Txt><Txt v="mono" style={{ fontSize: 12 }}>{p}% · {v[0]}/{v[1]}</Txt></Row>
                <View style={{ height: 7, borderRadius: 99, backgroundColor: t.c.surface, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: `${p}%`, borderRadius: 99, backgroundColor: heat(p) }} />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </Pressable>
  );
}

function History({ exams }) {
  const t = useTheme(MOD); const [f, setF] = useState("all"); const [more, setMore] = useState(false);
  if (!exams.length) return <Card mod={MOD}><Txt v="small" muted>Finish a benchmark to start your category heatmap and score history.</Txt></Card>;
  const present = KINDS.filter((k) => exams.some((e) => kindOf(e.mode).id === k.id));
  const list = exams.filter((e) => f === "all" || kindOf(e.mode).id === f);
  const shown = more ? list : list.slice(0, 8);
  return (
    <Card mod={MOD} style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Txt v="h3">Score History</Txt>
        <Txt v="tiny" muted>Tap an attempt to see how you did in each Client Needs area.</Txt>
      </View>
      {present.length > 1 ? <Seg mod={MOD} value={f} onChange={(v) => { setF(v); setMore(false); }} options={[{ id: "all", label: `All (${exams.length})` }, ...present.map((k) => ({ id: k.id, label: `${k.label} (${exams.filter((e) => kindOf(e.mode).id === k.id).length})` }))]} /> : null}
      {shown.map((e, i) => <HistoryRow key={(e.date || "") + e.mode + i} e={e} />)}
      {list.length > 8 ? <Btn mod={MOD} small kind="secondary" icon={more ? "ChevronUp" : "ChevronDown"} title={more ? "Show Fewer" : `Show All ${list.length}`} onPress={() => setMore(!more)} /> : null}
    </Card>
  );
}

/** Which destinations use the NCLEX-RN, and what this practice means for the nurse's chosen country. */
function NclexFit({ dest }) {
  const t = useTheme(MOD); const fit = NCLEX_FIT[dest]; const info = destOf(dest);
  return (
    <Card mod={MOD} style={{ gap: 10, borderColor: fit.uses ? t.c.line : t.c.warn }}>
      <Row gap={10} center={false}>
        <Icon name={fit.uses ? "CheckCircle2" : "Info"} size={20} color={fit.uses ? t.c.ok : t.c.warn} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt v="bodyB">{fit.uses ? `The NCLEX-RN applies to ${info.name}` : `${info.name} uses its own exam`}</Txt>
          <Txt v="small" muted>{fit.text}</Txt>
        </View>
      </Row>
      <Row wrap gap={6}>
        {DESTINATIONS.map((d) => <Chip key={d.id} tone={NCLEX_FIT[d.id].uses ? "ok" : "mute"} icon={NCLEX_FIT[d.id].uses ? "Check" : "X"} text={`${d.flag} ${d.short}`} />)}
      </Row>
    </Card>
  );
}

/** Study plan and smart review entry (Pro). */
function StudyCard({ state }) {
  const t = useTheme(MOD); const { isPro } = usePro();
  const due = dueCount(state); const days = daysToExam(state);
  return (
    <Card mod={MOD} accent style={{ gap: 12 }}>
      <Row gap={12} center={false}>
        <IconTile mod={MOD} icon="Route" size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <Row gap={6}><Txt v="h3">Study Plan & Smart Review</Txt>{!isPro ? <ProBadge /> : null}</Row>
          <Txt v="small" muted>{days !== null && days >= 0 ? `${days} days to your exam. ` : ""}{due ? `${due} missed question${due === 1 ? "" : "s"} due for review today.` : "Missed questions come back here 1, 3 and 7 days later."}</Txt>
        </View>
      </Row>
      <Row wrap gap={8}>
        <Btn mod={MOD} small icon="Route" title="Open My Plan" onPress={() => { tap(); router.push("/plan"); }} />
        {due ? <Btn mod={MOD} small kind="secondary" icon="RotateCcw" title={`Review ${Math.min(due, 25)}`} onPress={() => (isPro ? startReview(state) : router.push("/paywall"))} /> : null}
      </Row>
    </Card>
  );
}

export default function Exam() {
  const { state } = useApp();
  const bank = useMemo(() => BANK, []);
  const p = useLocalSearchParams();
  const [section, setSection] = useState(p.section === "english" ? "english" : "nclex");
  React.useEffect(() => { if (p.section === "english" || p.section === "nclex") setSection(p.section); }, [p.section]);
  return (
    <Screen mod={MOD}>
      <Seg mod={MOD} even value={section} onChange={setSection} options={[{ id: "nclex", label: "NCLEX", icon: "Brain" }, { id: "english", label: "OET & IELTS", icon: "Languages" }]} />
      {section === "english" ? (
        <>
          <DestPill mod={MOD} />
          <EnglishHub mod={MOD} />
        </>
      ) : (
        <>
          <Hero mod={MOD} icon="Brain" eyebrow="Exam · NCLEX-RN" title="Benchmark Exam Engine"
            sub={`A ${String(bank.length).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-question bank with rationales for every answer, three benchmark exams, Next Generation NCLEX (NGN) case studies and flashcards.`}
            stats={[["Question bank", bank.length], ["Attempts", state.exams.length], ["Last result", state.exams[0] ? state.exams[0].score : "—"]]} />
          <NclexFit dest={destId(state)} />
          <StudyCard state={state} />
          <TutorCard mod={MOD} />
          <BankBuilder bank={bank} state={state} />
          <Benchmarks state={state} />
          <Heatmap exams={state.exams} />
          <History exams={state.exams} />
        </>
      )}
    </Screen>
  );
}
