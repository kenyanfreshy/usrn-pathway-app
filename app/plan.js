// Pro · Personal study plan: paces daily practice to the exam date, leads with the weakest Client Needs areas,
// and brings missed questions back through smart review. Everything is computed on the phone.
import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen, Hero, Card, Row, Txt, Btn, Chip, Note, Bar, Icon, IconTile, Seg, Check, DateField, Grid, tap } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { useApp } from "../src/state";
import { ProGate } from "../src/pro";
import { scheduleStudyReminder, cancelStudyReminder } from "../src/notify";
import { catAccuracy, weakest, dueCount, startReview, startPractice, lastDays, stageOf, daysToExam } from "../src/study";
import { NCLEX_FIT, destId } from "../src/data/global";
import { dkey } from "../src/util";

const MOD = "nclex";
const GOALS = [10, 20, 30, 50];

function Bars({ days, goal }) {
  const t = useTheme(MOD); const max = Math.max(goal, ...days.map((d) => d.n), 1);
  return (
    <Row gap={6} style={{ alignItems: "flex-end", height: 92 }} accessible accessibilityLabel={`Questions per day: ${days.map((d) => d.n).join(", ")}`}>
      {days.map((d) => (
        <View key={d.key} style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }}>{d.n || ""}</Txt>
          <View style={{ width: "70%", height: Math.max(4, (d.n / max) * 60), borderRadius: 6, backgroundColor: d.n >= goal ? t.c.ok : d.n ? t.tint : t.c.sunk }} />
          <Txt v="tiny" muted>{d.label}</Txt>
        </View>
      ))}
    </Row>
  );
}

function Task({ icon, title, sub, done, action }) {
  const t = useTheme(MOD);
  return (
    <Row gap={12} center={false} style={{ padding: 12, borderRadius: 14, backgroundColor: done ? t.c.okSoft : t.c.sunk }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: done ? t.c.ok : t.tint, alignItems: "center", justifyContent: "center" }}>
        <Icon name={done ? "Check" : icon} size={18} color="#fff" />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Txt v="bodyB">{title}</Txt>
        {sub ? <Txt v="small" muted>{sub}</Txt> : null}
        {action || null}
      </View>
    </Row>
  );
}

function Plan() {
  const { state, dispatch } = useApp(); const t = useTheme(MOD);
  const plan = state.plan || { goal: 30 }; const goal = plan.goal || 30;
  const days = daysToExam(state); const stage = stageOf(days);
  const today = (state.daily || {})[dkey(new Date())] || 0;
  const due = dueCount(state); const weak = weakest(state, 2);
  const acc = catAccuracy(state);
  const fresh = Math.max(0, goal - Math.min(due, goal));
  const exams = state.exams || [];
  const took = (title) => exams.some((e) => e.mode === title);
  const dest = destId(state);
  // This week's milestone, by stage
  const milestone = !took("Diagnostic Benchmark") && !took("Diagnostic Baseline") ? { title: "Take the Diagnostic Benchmark", sub: "85 questions across all eight areas. It sets your starting point.", to: "/quiz?mode=t1" }
    : stage.id === "final" && !exams.slice(0, 5).some((e) => e.mode === "Comprehensive Predictor" || e.mode === "CAT Predictor") ? { title: "Take the Comprehensive Predictor", sub: "The adaptive exam (85–150 questions). Take it 1–2 weeks before your test.", to: "/quiz?mode=t3" }
    : stage.id === "build" ? { title: "One NGN Clinical Judgment session this week", sub: "Practice the six clinical-judgment steps with a case study.", to: "/quiz?mode=ngn" }
    : { title: "Review 25 flashcards", sub: "Quick recall of high-yield facts on a busy day.", to: "/quiz?mode=flash" };
  const setGoal = (g) => dispatch({ type: "plan", patch: { goal: g } });
  const toggleRemind = async () => {
    if (plan.remind) { await cancelStudyReminder(); dispatch({ type: "plan", patch: { remind: false } }); }
    else { const ok = await scheduleStudyReminder(plan.hour || 19); dispatch({ type: "plan", patch: { remind: ok } }); }
  };
  return (
    <>
      <Hero mod={MOD} icon="Route" eyebrow="Pro · Study plan" title={stage.title} sub={stage.sub}
        stats={[["Exam in", days === null ? "—" : days < 0 ? "Passed" : `${days} days`], ["Today", `${today} / ${goal}`], ["Review due", due]]} />
      {!NCLEX_FIT[dest].uses ? <Note mod={MOD} icon="Info">{NCLEX_FIT[dest].text}</Note> : null}

      <Card mod={MOD} style={{ gap: 12 }}>
        <Txt v="eyebrow">Your settings</Txt>
        <DateField mod={MOD} label="Exam date" value={state.profile.testDate} onChange={(v) => dispatch({ type: "profile", patch: { testDate: v } })} />
        <View style={{ gap: 6 }}>
          <Txt v="smallB" muted>Questions per day</Txt>
          <Seg mod={MOD} even value={String(goal)} onChange={(v) => setGoal(Number(v))} options={GOALS.map((g) => ({ id: String(g), label: String(g) }))} />
        </View>
        <Check mod={MOD} checked={!!plan.remind} onToggle={toggleRemind} label={`Remind me every day at ${(plan.hour || 19) > 12 ? (plan.hour || 19) - 12 + " p.m." : (plan.hour || 19) + " a.m."}`} sub="A local notification on this phone." />
      </Card>

      <Card mod={MOD} accent style={{ gap: 12 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt v="h3">Today</Txt>
          <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{today}/{goal}</Txt>
        </Row>
        <Bar mod={MOD} pct={Math.min(1, today / goal)} />
        <Task icon="RotateCcw" title={due ? `Smart review · ${Math.min(due, 25)} question${due === 1 ? "" : "s"}` : "Smart review · nothing due"}
          sub={due ? "Questions you missed, brought back at the right time. Get one right 3 times and it's mastered." : "Missed questions come back here 1, 3 and 7 days later."}
          done={!due} action={due ? <Btn mod={MOD} small icon="Play" title="Start review" onPress={() => startReview(state)} /> : null} />
        <Task icon="Target" title={`Practice · ${fresh || goal} questions`} sub={`Focus: ${weak.map((w) => w.cat).join(" and ")}. Unseen questions first.`}
          done={today >= goal} action={<Btn mod={MOD} small icon="Play" title="Start practice" onPress={() => startPractice(state, weak.map((w) => w.cat), fresh || goal)} />} />
        <Task icon="Flag" title={milestone.title} sub={milestone.sub} action={<Btn mod={MOD} small kind="secondary" icon="ArrowRight" title="Open" onPress={() => { tap(); router.push(milestone.to); }} />} />
      </Card>

      <Card mod={MOD} style={{ gap: 10 }}>
        <Txt v="h3">Last 7 days</Txt>
        <Bars days={lastDays(state, 7)} goal={goal} />
        <Txt v="tiny" muted>Green days met your goal.</Txt>
      </Card>

      <Card mod={MOD} style={{ gap: 10 }}>
        <Txt v="h3">Accuracy by Client Needs area</Txt>
        {acc.map((a) => (
          <View key={a.cat} style={{ gap: 4 }}>
            <Row style={{ justifyContent: "space-between" }} gap={8}>
              <Txt v="small" style={{ flex: 1 }} numberOfLines={1}>{a.cat}</Txt>
              <Txt v="mono" style={{ fontSize: 12 }}>{a.pct === null ? `${a.seen} answered` : Math.round(a.pct * 100) + "%"}</Txt>
            </Row>
            <View style={{ height: 8, borderRadius: 99, backgroundColor: t.c.sunk, overflow: "hidden" }}>
              {a.pct !== null ? <View style={{ height: "100%", width: `${Math.round(a.pct * 100)}%`, borderRadius: 99, backgroundColor: a.pct >= 0.75 ? t.c.ok : a.pct >= 0.6 ? t.tint : t.c.warn }} /> : null}
            </View>
          </View>
        ))}
        <Txt v="tiny" muted>From the question bank, smart review and the Diagnostic Benchmark. Areas need 5 answers before they get a score.</Txt>
      </Card>
    </>
  );
}

export default function PlanScreen() {
  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title="Study plan" />
      <ProGate mod={MOD} feature="Personal study plan" desc="A daily plan paced to your exam date, built around your weakest areas, with smart review of every question you missed.">
        <Plan />
      </ProGate>
    </Screen>
  );
}
