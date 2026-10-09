// Interview prep: hospital job interviews (STAR answers, sample answers, questions to ask) and the visa or arrival
// interview for the nurse's destination. Static content; honesty first; not legal advice.
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Screen, Hero, Card, Row, Txt, Chip, Note, Icon, Seg, Accordion, Bullets, Grid, tap } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { useApp } from "../src/state";
import { ProGate, usePro } from "../src/pro";
import { DestPill } from "../src/dest";
import { destId, destOf } from "../src/data/global";
import { SourceList } from "../src/sources";
import { fmtDate } from "../src/util";
import IV from "../src/data/interview.json";

const MOD = "career";
const FREE_QUESTIONS = 3;

function Star() {
  const t = useTheme(MOD);
  return (
    <Card mod={MOD} style={{ gap: 10 }}>
      <Txt v="h3">Answer with STAR</Txt>
      <Txt v="small" muted>{IV.job.intro}</Txt>
      <Grid min={140} gap={8}>
        {IV.job.star.map(([h, d], k) => (
          <View key={h} style={{ flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk, gap: 4 }}>
            <Row gap={8}>
              <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: t.tint, alignItems: "center", justifyContent: "center" }}><Txt v="smallB" color="#fff">{h[0]}</Txt></View>
              <Txt v="bodyB">{h}</Txt>
            </Row>
            <Txt v="small">{d}</Txt>
          </View>
        ))}
      </Grid>
    </Card>
  );
}

function Question({ q, k, locked }) {
  const t = useTheme(MOD);
  return (
    <Accordion mod={MOD} title={`${k + 1}. ${q.q}`} meta={locked ? <Icon name="Lock" size={15} color={t.c.muted} /> : null}>
      <Txt v="small" muted><Txt v="smallB">What they're looking for: </Txt>{q.why}</Txt>
      <Bullets items={q.tips} />
      {locked ? (
        <Note mod={MOD} icon="Lock">The sample answer is part of Pro.</Note>
      ) : (
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.soft, gap: 4 }}>
          <Txt v="eyebrow">Sample answer</Txt>
          <Txt v="body" style={{ fontStyle: "italic" }}>{q.sample}</Txt>
          <Txt v="tiny" muted>Use your own real example. Interviewers can tell a memorized answer.</Txt>
        </View>
      )}
    </Accordion>
  );
}

function Job({ dest }) {
  const { isPro } = usePro(); const c = IV.countries[dest];
  return (
    <View style={{ gap: 12 }}>
      <Star />
      {c && c.jobNotes && c.jobNotes.length ? (
        <Card mod={MOD} style={{ gap: 8 }}>
          <Txt v="h3">Interviews in {destOf(dest).name}</Txt>
          <Bullets items={c.jobNotes} />
        </Card>
      ) : null}
      <Txt v="eyebrow">Common questions</Txt>
      {IV.job.questions.map((q, k) => <Question key={q.q} q={q} k={k} locked={!isPro && k >= FREE_QUESTIONS} />)}
      <Card mod={MOD} accent style={{ gap: 8 }}>
        <Txt v="h3">Questions to ask them</Txt>
        <Bullets items={IV.job.ask} />
      </Card>
    </View>
  );
}

function Visa({ dest }) {
  const t = useTheme(MOD); const v = IV.countries[dest].visa;
  return (
    <View style={{ gap: 12 }}>
      <Note mod={MOD} tone="warn" icon="ShieldCheck">Always tell the truth and keep every answer consistent with your application. Misrepresentation can lead to refusal and a ban.</Note>
      <Card mod={MOD} style={{ gap: 10 }}>
        <Txt v="h3">{v.title}</Txt>
        <Bullets numbered items={v.steps} />
      </Card>
      <Card mod={MOD} style={{ gap: 10 }}>
        <Row gap={8}><Icon name="ClipboardCheck" size={18} color={t.tint} /><Txt v="h3" style={{ flex: 1 }}>Bring with you</Txt></Row>
        <Bullets items={v.bring} />
      </Card>
      <Txt v="eyebrow">Questions you may be asked</Txt>
      {v.questions.map((q, k) => (
        <Card key={q.q} mod={MOD} style={{ gap: 6 }}>
          <Txt v="bodyB">{k + 1}. {q.q}</Txt>
          <Txt v="small" muted>{q.tip}</Txt>
        </Card>
      ))}
      {v.notes && v.notes.length ? <Card mod={MOD} style={{ gap: 8 }}><Txt v="h3">Good to know</Txt><Bullets items={v.notes} /></Card> : null}
    </View>
  );
}

export default function Interview() {
  const { state } = useApp(); const dest = destId(state); const info = destOf(dest);
  const [tab, setTab] = useState("job");
  const v = IV.countries[dest].visa;
  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title="Interview prep" />
      <Hero mod={MOD} icon="MessageSquare" eyebrow={`Interview prep · ${info.flag} ${info.short}`} title="Walk in ready"
        sub="Hospital job interviews with STAR answers, and what to expect at your visa or arrival interview."
        stats={[["Job questions", IV.job.questions.length], ["Visa questions", v.questions.length], ["Checked", fmtDate(IV.checked)]]} />
      <DestPill mod={MOD} />
      <Seg mod={MOD} even value={tab} onChange={setTab} options={[{ id: "job", label: "Job interview", icon: "Briefcase" }, { id: "visa", label: dest === "US" ? "Visa interview" : "Visa & arrival", icon: "Plane" }]} />
      {tab === "job" ? <Job dest={dest} /> : null}
      {tab === "visa" ? <ProGate mod={MOD} feature="Visa and arrival interview prep" desc="Steps, what to bring and the questions officers commonly ask, for your destination."><Visa dest={dest} /></ProGate> : null}
      <SourceList mod={MOD} sources={IV.sources} uncertain={IV.uncertain} />
      <Txt v="tiny" muted>General information, not legal or immigration advice. For your case, talk to a licensed immigration attorney or registered adviser.</Txt>
    </Screen>
  );
}
