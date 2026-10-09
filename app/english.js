// English test prep: OET, IELTS, PTE and CELBAN formats, the scores each destination accepts, and (Pro) OET-style
// writing tasks with model letters, speaking role-play cards and useful phrases. Static content; no AI.
import React, { useState } from "react";
import { View, Pressable, Linking } from "react-native";
import { Screen, Hero, Card, Row, Txt, Btn, Chip, Note, Icon, Seg, Accordion, Bullets, Check, Grid, tap } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { useApp } from "../src/state";
import { ProGate } from "../src/pro";
import { DestPill } from "../src/dest";
import { destId, destOf } from "../src/data/global";
import { SourceList } from "../src/sources";
import { fmtDate } from "../src/util";
import EN from "../src/data/english.json";

const MOD = "bedside";
const TABS = [{ id: "scores", label: "Scores", icon: "Target" }, { id: "tests", label: "Tests", icon: "BookOpen" }, { id: "writing", label: "Writing", icon: "FileEdit" }, { id: "speaking", label: "Speaking", icon: "MessageSquare" }];

function Scores({ dest }) {
  const t = useTheme(MOD); const r = EN.requirements[dest]; const info = destOf(dest);
  return (
    <Card mod={MOD} style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <Txt v="eyebrow">Minimum scores · {info.flag} {info.name}</Txt>
        <Txt v="h3">What your regulator accepts</Txt>
      </View>
      {r.rows.map(([test, min]) => (
        <View key={test} style={{ padding: 12, borderRadius: 14, backgroundColor: t.c.sunk, gap: 3 }}>
          <Txt v="bodyB">{test}</Txt>
          <Txt v="small" style={{ fontFamily: FONTS.mono }}>{min}</Txt>
        </View>
      ))}
      {r.notes ? <Note mod={MOD} icon="Info">{r.notes}</Note> : null}
      <Txt v="tiny" muted>Checked {fmtDate(EN.checked)}. Score rules change; confirm on the regulator's page before you book.</Txt>
    </Card>
  );
}

function Tests() {
  const t = useTheme(MOD);
  return (
    <View style={{ gap: 12 }}>
      {EN.tests.map((x, k) => (
        <Accordion key={x.id} mod={MOD} title={x.name} defaultOpen={k === 0}>
          <Txt v="small">{x.summary}</Txt>
          <View style={{ gap: 6 }}>
            {x.sections.map(([h, d]) => (
              <Row key={h} gap={10} center={false} style={{ padding: 10, borderRadius: 12, backgroundColor: t.c.sunk }}>
                <Txt v="smallB" style={{ width: 92 }}>{h}</Txt>
                <Txt v="small" style={{ flex: 1 }}>{d}</Txt>
              </Row>
            ))}
          </View>
          {x.scoring ? <Txt v="small" muted><Txt v="smallB">Scoring: </Txt>{x.scoring}</Txt> : null}
          <Txt v="smallB">Tips</Txt>
          <Bullets items={x.tips} />
          {x.url ? <Btn mod={MOD} small kind="secondary" icon="Globe" title="Official site" onPress={() => { tap(); Linking.openURL(x.url).catch(() => {}); }} style={{ alignSelf: "flex-start" }} /> : null}
        </Accordion>
      ))}
    </View>
  );
}

function Writing() {
  const t = useTheme(MOD); const [cur, setCur] = useState(EN.writing[0].id); const [show, setShow] = useState(false);
  const w = EN.writing.find((x) => x.id === cur) || EN.writing[0];
  const { state, dispatch } = useApp();
  return (
    <View style={{ gap: 12 }}>
      <Note mod={MOD} icon="Timer">Real OET timing: 5 minutes to read the case notes (no writing), then 40 minutes to write. Set a timer, write your letter on paper or in Notes, then compare it with the model.</Note>
      <Seg mod={MOD} even value={cur} onChange={(v) => { setCur(v); setShow(false); }} options={EN.writing.map((x, k) => ({ id: x.id, label: `Task ${k + 1}` }))} />
      <Card mod={MOD} style={{ gap: 10 }}>
        <Txt v="h3">{w.title}</Txt>
        <Txt v="eyebrow">Case notes</Txt>
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.c.sunk }}>
          <Txt v="small" style={{ fontFamily: FONTS.mono, lineHeight: 19 }}>{w.notes}</Txt>
        </View>
        <Txt v="eyebrow">Writing task</Txt>
        <Txt v="body">{w.task}</Txt>
      </Card>
      <Card mod={MOD} style={{ gap: 8 }}>
        <Txt v="h3">Check your letter</Txt>
        {w.checklist.map((x, i) => {
          const id = `en-${w.id}-${i}`;
          return <Check key={id} mod={MOD} checked={!!state.careers[id]} label={x} onToggle={() => dispatch({ type: "career", id })} />;
        })}
      </Card>
      <Card mod={MOD} accent style={{ gap: 10 }}>
        <Row gap={8}><Icon name="FileText" size={18} color={t.tint} /><Txt v="h3" style={{ flex: 1 }}>Model letter</Txt></Row>
        {show ? <Txt v="body" style={{ lineHeight: 23 }}>{w.model}</Txt> : <Txt v="small" muted>Write yours first, then open the model to compare structure, what was selected from the notes and the tone.</Txt>}
        <Btn mod={MOD} small kind={show ? "secondary" : "primary"} icon={show ? "X" : "FileText"} title={show ? "Hide model letter" : "Show model letter"} onPress={() => setShow(!show)} />
      </Card>
    </View>
  );
}

function Speaking() {
  const t = useTheme(MOD); const [open, setOpen] = useState(null);
  return (
    <View style={{ gap: 12 }}>
      <Note mod={MOD} icon="Timer">Real OET timing: 3 minutes to prepare each role-play, then about 5 minutes to talk. Practice with a friend playing the patient, or record yourself.</Note>
      {EN.speaking.map((s, k) => (
        <Card key={s.id} mod={MOD} style={{ gap: 8 }}>
          <Row gap={8}><Chip mod={MOD} tone={k % 2 ? "acc2" : "acc"} text={`Role-play ${k + 1}`} /><Txt v="h3" style={{ flex: 1 }}>{s.title}</Txt></Row>
          <Txt v="small" muted><Txt v="smallB">Setting: </Txt>{s.setting}</Txt>
          <Txt v="small">{s.situation}</Txt>
          <Txt v="smallB">Your tasks</Txt>
          <Bullets numbered items={s.tasks} />
          <Pressable onPress={() => { tap(); setOpen(open === s.id ? null : s.id); }} accessibilityRole="button" style={{ alignSelf: "flex-start" }}>
            <Txt v="smallB" color={t.tint}>{open === s.id ? "Hide patient card" : "Show what the patient may say"}</Txt>
          </Pressable>
          {open === s.id ? <Note mod={MOD} tone="acc2" icon="User">{s.patient}</Note> : null}
        </Card>
      ))}
      <Card mod={MOD} style={{ gap: 10 }}>
        <Txt v="h3">Useful phrases</Txt>
        {EN.phrases.map(([h, list]) => (
          <View key={h} style={{ gap: 4 }}>
            <Txt v="smallB" color={t.tint}>{h}</Txt>
            <Bullets items={list.map((x) => `“${x}”`)} />
          </View>
        ))}
      </Card>
    </View>
  );
}

export default function English() {
  const { state } = useApp(); const dest = destId(state);
  const [tab, setTab] = useState("scores");
  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title="English test prep" />
      <Hero mod={MOD} icon="Languages" eyebrow="English proficiency" title="Pass your English test"
        sub="The scores your destination accepts, how each test works, and OET-style nursing writing and speaking practice."
        stats={[["Tests", EN.tests.length], ["Writing tasks", EN.writing.length], ["Role-plays", EN.speaking.length]]} />
      <DestPill mod={MOD} />
      <Seg mod={MOD} value={tab} onChange={setTab} options={TABS} />
      {tab === "scores" ? <Scores dest={dest} /> : null}
      {tab === "tests" ? <Tests /> : null}
      {tab === "writing" ? <ProGate mod={MOD} feature="OET-style writing practice" desc="Nursing case notes, timed letter tasks, a checklist and model letters to compare with."><Writing /></ProGate> : null}
      {tab === "speaking" ? <ProGate mod={MOD} feature="Speaking role-plays" desc="OET-style nurse role-play cards with patient prompts and useful phrases."><Speaking /></ProGate> : null}
      <SourceList mod={MOD} sources={EN.sources} uncertain={EN.uncertain} />
      <Txt v="tiny" muted>Practice material written for USRN Pathway. Not affiliated with or endorsed by OET, IELTS, Pearson or CELBAN.</Txt>
    </Screen>
  );
}
