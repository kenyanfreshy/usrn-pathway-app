// Speaking: OET role-play simulator (3 min prep → 5 min role-play timer, nurse and patient cards, self-scoring on
// the five clinical communication criteria) and IELTS Speaking (Part 1 questions, Part 2 cue cards with a 1 + 2 min
// timer, Part 3 discussion). No recording or AI: practice with a partner or record yourself.
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Card, Row, Txt, Chip, Note, Icon, Seg, Bullets, Check, Accordion, tap } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp } from "../state";
import P from "../data/english-practice.json";
import EN from "../data/english.json";
import { PhaseTimer } from "./Timer";

function OetRoleplay({ mod }) {
  const t = useTheme(mod); const { state, dispatch } = useApp();
  const all = [...P.oetRoleplays, ...EN.speaking.map((s) => ({ id: s.id, title: s.title, setting: s.setting, nurse: s.situation, tasks: s.tasks, patient: s.patient, phrases: [] }))];
  const [id, setId] = useState(all[0].id); const [showP, setShowP] = useState(false);
  const r = all.find((x) => x.id === id);
  const key = (c, i) => `spk-${r.id}-${c}-${i}`;
  const total = P.criteria.reduce((n, c) => n + c.checks.length, 0);
  const got = P.criteria.reduce((n, c) => n + c.checks.filter((_, i) => (state.english || {})[key(c.id, i)]).length, 0);
  const toggle = (k) => dispatch({ type: "english", patch: { [k]: !(state.english || {})[k] } });
  return (
    <View style={{ gap: 12 }}>
      <Seg mod={mod} value={id} onChange={(v) => { setId(v); setShowP(false); }} options={all.map((x, k) => ({ id: x.id, label: `Role-Play ${k + 1}` }))} />
      <Card mod={mod} style={{ gap: 10 }}>
        <Txt v="h3">{r.title}</Txt>
        <Txt v="small" muted><Txt v="smallB">Setting: </Txt>{r.setting}</Txt>
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.soft, gap: 6 }}>
          <Txt v="eyebrow" color={t.tint}>Nurse card</Txt>
          <Txt v="body">{r.nurse}</Txt>
          <Bullets numbered items={r.tasks} />
        </View>
        <PhaseTimer key={r.id} mod={mod} phases={[["Prepare", 180], ["Role-Play", 300]]} />
        <Pressable onPress={() => { tap(); setShowP(!showP); }} accessibilityRole="button" style={{ alignSelf: "flex-start" }}>
          <Txt v="smallB" color={t.tint}>{showP ? "Hide patient card" : "Show patient card (for your practice partner)"}</Txt>
        </Pressable>
        {showP ? <Note mod={mod} tone="acc2" icon="User">{r.patient}</Note> : null}
        {r.phrases && r.phrases.length ? <Accordion mod={mod} title="Useful Phrases"><Bullets items={r.phrases.map((x) => `“${x}”`)} /></Accordion> : null}
      </Card>
      <Card mod={mod} style={{ gap: 10 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt v="h3">Score Yourself</Txt>
          <Chip mod={mod} tone={got / total >= 0.8 ? "ok" : "acc"} text={`${got}/${total}`} />
        </Row>
        <Txt v="small" muted>After the role-play, check off what you did. These are the five clinical communication criteria OET assessors use.</Txt>
        {P.criteria.map((c) => (
          <View key={c.id} style={{ gap: 2 }}>
            <Txt v="smallB" color={t.tint}>{c.id}. {c.name}</Txt>
            {c.checks.map((x, i) => <Check key={i} mod={mod} checked={!!(state.english || {})[key(c.id, i)]} label={x} onToggle={() => toggle(key(c.id, i))} />)}
          </View>
        ))}
        <Accordion mod={mod} title="Language Criteria">
          {P.linguistic.map((l) => <Txt key={l.name} v="small"><Txt v="smallB">{l.name}: </Txt>{l.tip}</Txt>)}
        </Accordion>
      </Card>
    </View>
  );
}

function IeltsSpeaking({ mod }) {
  const t = useTheme(mod); const S = P.ieltsSpeaking; const [c, setC] = useState(0);
  const card = S.part2[c];
  return (
    <View style={{ gap: 12 }}>
      <Card mod={mod} style={{ gap: 8 }}>
        <Txt v="eyebrow">Part 1 · 4–5 minutes · everyday questions</Txt>
        <Bullets items={S.part1} />
      </Card>
      <Card mod={mod} style={{ gap: 10 }}>
        <Txt v="eyebrow">Part 2 · cue card · 1 min to prepare, up to 2 min to talk</Txt>
        <Seg mod={mod} even value={String(c)} onChange={(v) => setC(Number(v))} options={S.part2.map((_, k) => ({ id: String(k), label: `Card ${k + 1}` }))} />
        <View style={{ padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: t.tint, backgroundColor: t.c.surface, gap: 6 }}>
          <Txt v="bodyB">{card.topic}</Txt>
          {card.bullets.map((b) => <Txt key={b} v="body">{b}</Txt>)}
        </View>
        <PhaseTimer key={c} mod={mod} phases={[["Prepare", 60], ["Talk", 120]]} />
      </Card>
      <Card mod={mod} style={{ gap: 8 }}>
        <Txt v="eyebrow">Part 3 · 4–5 minutes · discussion</Txt>
        <Bullets items={S.part3} />
        <Txt v="tiny" muted>Give a view, a reason and an example. It's fine to say what other people think, too.</Txt>
      </Card>
    </View>
  );
}

export function Speaking({ mod }) {
  const [test, setTest] = useState("oet");
  return (
    <View style={{ gap: 12 }}>
      <Seg mod={mod} even value={test} onChange={setTest} options={[{ id: "oet", label: "OET Nursing" }, { id: "ielts", label: "IELTS Academic" }]} />
      <Note mod={mod} icon="Users">Practice with a friend reading the patient card, or record yourself on your phone and listen back.</Note>
      {test === "oet" ? <OetRoleplay mod={mod} /> : <IeltsSpeaking mod={mod} />}
    </View>
  );
}
