// Module 3 · NCLEX-RN — question bank builder, benchmarks, heatmap and score history.
import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen, Hero, Card, Row, Txt, Btn, Seg, Select, Check, Bar, Icon, IconTile, tap, Grid, HScroll } from "../../src/ui";
import { TutorCard } from "../../src/tutor";
import { useTheme, FONTS } from "../../src/theme";
import { useApp } from "../../src/state";
import { usePro, ProBadge } from "../../src/pro";
import { shuffle } from "../../src/util";
import { shuffleItem, TESTS } from "../../src/exam";
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

function TopicChip({ label, n, on, onPress }) {
  const t = useTheme(MOD);
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
      style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: on ? t.soft2 : t.c.sunk, borderWidth: 1, borderColor: on ? t.tint2 : "transparent" }}>
      <Txt v="smallB" color={on ? t.tint2 : t.c.ink} style={{ flex: 1 }} numberOfLines={2}>{label}</Txt>
      <Txt v="tiny" color={on ? t.tint2 : t.c.muted} style={{ fontFamily: FONTS.mono }}>{n}</Txt>
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
    setRun({ items: shuffle(pool).slice(0, count).map(shuffleItem), tutor });
    router.push({ pathname: "/quiz", params: { mode: "bank" } });
  };
  return (
    <Card mod={MOD} accent style={{ backgroundColor: t.soft, gap: 14 }}>
      <Row gap={12} center={false}>
        <IconTile mod={MOD} icon="Library" size={48} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="h2">Question bank</Txt>
          <Txt v="small" muted>{bank.length} NCLEX-RN questions with full rationales, organized by the NCSBN client-needs categories.</Txt>
        </View>
      </Row>
      <Row gap={8}>
        {[["Seen", seen], ["Mastered", mastered], ["To review", missed]].map(([k, v]) => <MiniStat key={k} k={k} v={v} />)}
      </Row>
      <Bar mod={MOD} pct={bank.length ? seen / bank.length : 0} />
      <Seg mod={MOD} even value={filter} onChange={setFilter} options={[{ id: "all", label: "All questions" }, { id: "unseen", label: "Unseen" }, { id: "missed", label: "Missed" }]} />
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
  { id: "t2", n: "Test 2", title: TESTS.t2.title, desc: `${TESTS.t2.count} items: 4 unfolding NGN case studies plus SATA and ordered-response questions.`, icon: "Network", save: "t2", pro: true },
  { id: "t3", n: "Test 3", title: TESTS.t3.title, desc: `Adaptive like the NCLEX: 85–150 questions from a ${TESTS.t3.count}-question pool, stops at 95% confidence.`, icon: "Gauge", save: "t3" },
  { id: "ngn", n: "Practice", title: "NGN Case Practice", desc: "Pick one case study and work through its six clinical-judgment steps.", icon: "Stethoscope", pro: true },
  { id: "flash", n: "Review", title: "Flashcards", desc: "Swipe through high-yield takeaways. Right = got it, left = again.", icon: "Layers" },
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
            <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }}>{md.id === "flash" ? `${state.flash || 0} reviewed` : saved ? "In progress — resume anytime" : l ? `Last: ${l.score}` : md.id === "ngn" ? "4 cases" : "Not taken yet"}</Txt>
            <Btn mod={MOD} small full icon="Play" title={md.id === "flash" ? "Open deck" : saved ? "Resume" : l ? "Retake" : "Start"} onPress={() => start(md.id)} />
          </Card>
        );
      })}
    </Grid>
  );
}

function Heatmap({ exams }) {
  const t = useTheme(MOD);
  const rows = exams.filter((e) => e.byCat).slice(0, 6).reverse();
  if (!rows.length) return null;
  const cats = [...new Set(rows.flatMap((e) => Object.keys(e.byCat)))].sort();
  const LW = 150, CW = 66;
  return (
    <Card mod={MOD}>
      <Txt v="h3">Category heatmap</Txt>
      <Txt v="tiny" muted>Last {rows.length} scored attempts, oldest → newest</Txt>
      <HScroll mod={MOD} fade={t.c.surface} hint="Swipe to see all attempts">
        <View style={{ gap: 6 }}>
          <Row gap={4}>
            <View style={{ width: LW }}><Txt v="eyebrow">Category</Txt></View>
            {rows.map((e, i) => (
              <View key={i} style={{ width: CW, alignItems: "center" }}>
                <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }}>{String(e.date).slice(5)}</Txt>
                <Txt v="tiny" muted numberOfLines={1}>{e.mode.split(" ")[0]}</Txt>
              </View>
            ))}
          </Row>
          {cats.map((c) => (
            <Row key={c} gap={4}>
              <View style={{ width: LW }}><Txt v="small" numberOfLines={2}>{c}</Txt></View>
              {rows.map((e, i) => {
                const v = e.byCat[c];
                if (!v) return <View key={i} style={{ width: CW, alignItems: "center" }}><Txt v="small" muted>—</Txt></View>;
                const p = Math.round((v[0] / v[1]) * 100);
                return (
                  <View key={i} style={{ width: CW, paddingVertical: 7, borderRadius: 10, alignItems: "center", backgroundColor: `hsla(${Math.round(p * 1.2)}, 72%, 42%, 0.92)` }}>
                    <Txt v="tiny" color="#fff" style={{ fontFamily: FONTS.monoBold, fontWeight: FONTS.monoBold ? undefined : "700" }}>{p}%</Txt>
                  </View>
                );
              })}
            </Row>
          ))}
        </View>
      </HScroll>
    </Card>
  );
}

function History({ exams }) {
  const t = useTheme(MOD);
  if (!exams.length) return <Card mod={MOD}><Txt v="small" muted>Finish a benchmark to start your category heatmap and score history.</Txt></Card>;
  return (
    <Card mod={MOD} style={{ gap: 8 }}>
      <Txt v="h3">Score history</Txt>
      {exams.map((e, i) => (
        <Row key={i} gap={10} style={{ padding: 10, borderRadius: 12, backgroundColor: t.c.sunk }}>
          <Txt v="mono" muted style={{ width: 92 }}>{e.date}</Txt>
          <Txt v="small" style={{ flex: 1 }} numberOfLines={1}>{e.mode}</Txt>
          <Txt v="mono" color={t.tint}>{e.score}</Txt>
        </Row>
      ))}
    </Card>
  );
}

export default function Nclex() {
  const { state } = useApp();
  const bank = useMemo(() => BANK, []);
  return (
    <Screen mod={MOD}>
      <Hero mod={MOD} icon="Brain" eyebrow="Module 3 · NCLEX-RN" title="Benchmark exam engine"
        sub="Three benchmark exams with 600 different questions, Next Gen case studies, a full question bank with rationales, and flashcards."
        stats={[["Question bank", bank.length], ["Attempts", state.exams.length], ["Last result", state.exams[0] ? state.exams[0].score : "—"]]} />
      <TutorCard mod={MOD} />
      <BankBuilder bank={bank} state={state} />
      <Benchmarks state={state} />
      <Heatmap exams={state.exams} />
      <History exams={state.exams} />
    </Screen>
  );
}
