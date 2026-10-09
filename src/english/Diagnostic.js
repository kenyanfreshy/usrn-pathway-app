// 20-question English diagnostic: 10 OET-style (listening transcripts and workplace reading) and 10 IELTS-style
// (academic reading incl. True/False/Not Given, and vocabulary). Instant scoring with explanations for every option.
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Card, Row, Txt, Btn, Chip, Note, Option, Bar, Accordion } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp } from "../state";
import { todayKey, fmtDate } from "../util";
import P from "../data/english-practice.json";

const Q = P.diagnostic;
const GROUPS = ["OET Listening", "OET Reading", "IELTS Reading", "Vocabulary"];

function verdict(p) {
  if (p >= 0.85) return ["Strong", "You're reading and listening at the level most nurse minimums ask for. Keep practicing writing and speaking, which decide most results."];
  if (p >= 0.65) return ["Close", "A solid base. Work on the sections below where you dropped points, then try again in two weeks."];
  return ["Building", "Start with the skill you scored lowest in. Short daily practice beats long weekly sessions."];
}

export function Diagnostic({ mod }) {
  const t = useTheme(mod); const { state, dispatch } = useApp();
  const [i, setI] = useState(0); const [ans, setAns] = useState({}); const [done, setDone] = useState(false);
  const last = state.english && state.english.diag;
  const q = Q[i];
  const score = useMemo(() => {
    const by = {}; GROUPS.forEach((g) => { by[g] = [0, 0]; });
    Q.forEach((x) => { by[x.section][1]++; if (ans[x.id] === x.answer) by[x.section][0]++; });
    const right = Q.filter((x) => ans[x.id] === x.answer).length;
    return { right, by };
  }, [ans]);
  const finish = () => {
    setDone(true);
    dispatch({ type: "english", patch: { diag: { right: score.right, total: Q.length, date: todayKey(), by: score.by } } });
  };
  if (done) {
    const [title, text] = verdict(score.right / Q.length);
    return (
      <View style={{ gap: 12 }}>
        <Card mod={mod} style={{ gap: 8 }}>
          <Txt v="eyebrow">English diagnostic</Txt>
          <Row gap={14}>
            <Txt v="big" color={t.tint}>{score.right}/{Q.length}</Txt>
            <View style={{ flex: 1 }}><Txt v="h3">{title}</Txt><Txt v="small" muted>{text}</Txt></View>
          </Row>
          {GROUPS.map((g) => (
            <View key={g} style={{ gap: 3 }}>
              <Row style={{ justifyContent: "space-between" }}><Txt v="small">{g}</Txt><Txt v="mono">{score.by[g][0]}/{score.by[g][1]}</Txt></Row>
              <Bar mod={mod} pct={score.by[g][1] ? score.by[g][0] / score.by[g][1] : 0} height={7} />
            </View>
          ))}
          <Txt v="tiny" muted>A practice indicator only. It can't predict an official OET grade or IELTS band, which also depend on writing and speaking.</Txt>
        </Card>
        {Q.map((x, k) => {
          const ok = ans[x.id] === x.answer;
          return (
            <Accordion key={x.id} mod={mod} title={`${k + 1}. ${x.stem}`} meta={<Chip tone={ok ? "ok" : "crit"} icon={ok ? "Check" : "X"} text={ok ? "Right" : "Review"} />}>
              <Txt v="small"><Txt v="smallB">Answer: </Txt>{(x.options.find(([o]) => o === x.answer) || [])[1]}</Txt>
              <Txt v="small" muted>{x.why}</Txt>
            </Accordion>
          );
        })}
        <Btn mod={mod} icon="RotateCcw" title="Try again" onPress={() => { setAns({}); setI(0); setDone(false); }} />
      </View>
    );
  }
  return (
    <View style={{ gap: 12 }}>
      {last && i === 0 && !Object.keys(ans).length ? <Note mod={mod} icon="History">Last attempt: {last.right}/{last.total} on {fmtDate(last.date)}.</Note> : null}
      <Card mod={mod} style={{ gap: 12 }} key={q.id}>
        <Row style={{ justifyContent: "space-between" }}>
          <Chip mod={mod} tone={q.section.startsWith("OET") ? "acc" : "acc2"} text={q.section} />
          <Txt v="mono" muted>{i + 1}/{Q.length}</Txt>
        </Row>
        <Bar mod={mod} pct={(i + 1) / Q.length} height={5} />
        {q.passage ? (
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.c.sunk }}>
            <Txt v="small" style={{ lineHeight: 20 }}>{q.passage}</Txt>
          </View>
        ) : null}
        <Txt v="bodyB" style={{ fontSize: 16, lineHeight: 23 }}>{q.stem}</Txt>
        {q.options.map(([id, text]) => <Option key={id} mod={mod} letter={id} label={text} state={ans[q.id] === id ? "sel" : null} onPress={() => setAns({ ...ans, [q.id]: id })} />)}
        <Row style={{ justifyContent: "space-between" }}>
          <Btn mod={mod} small kind="secondary" icon="ArrowLeft" title="Back" disabled={i === 0} onPress={() => setI(i - 1)} />
          {i < Q.length - 1 ? <Btn mod={mod} small icon="ArrowRight" title="Next" disabled={!ans[q.id]} onPress={() => setI(i + 1)} />
            : <Btn mod={mod} small icon="Check" title="See my results" disabled={Object.keys(ans).length < Q.length} onPress={finish} />}
        </Row>
      </Card>
      {q.section === "OET Listening" ? <Txt v="tiny" muted>The real Listening test is audio. Here you read a transcript, which practices the same skill of catching the key detail.</Txt> : null}
    </View>
  );
}
