// OET Writing: case-note transformer (pick what the reader needs), letter builder (5 steps with model paragraphs),
// professional register pairs, and full practice tasks with model letters.
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Card, Row, Txt, Btn, Chip, Note, Icon, Seg, Accordion, CopyButton, tap, buzz } from "../ui";
import { useTheme, FONTS } from "../theme";
import { ProGate } from "../pro";
import P from "../data/english-practice.json";
import EN from "../data/english.json";

function Transformer({ mod }) {
  const t = useTheme(mod);
  const [cid, setCid] = useState(P.caseNotes[0].id); const [pick, setPick] = useState({}); const [checked, setChecked] = useState(false);
  const c = P.caseNotes.find((x) => x.id === cid);
  const lines = c.sections.flatMap((s, si) => s.lines.map((l, li) => ({ ...l, key: `${si}-${li}` })));
  const answered = lines.filter((l) => pick[l.key] !== undefined).length;
  const right = lines.filter((l) => pick[l.key] === l.relevant).length;
  const choose = (k, v) => { if (checked) return; tap(); setPick({ ...pick, [k]: v }); };
  return (
    <Card mod={mod} style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <Txt v="eyebrow">Case note transformer · Purpose & content</Txt>
        <Txt v="h3">Keep what the reader needs</Txt>
      </View>
      <Seg mod={mod} even value={cid} onChange={(v) => { setCid(v); setPick({}); setChecked(false); }} options={P.caseNotes.map((x, k) => ({ id: x.id, label: `Case ${k + 1}` }))} />
      <Txt v="bodyB">{c.title}</Txt>
      <Txt v="small" muted><Txt v="smallB">Writing to: </Txt>{c.reader}</Txt>
      <Txt v="small">{c.task}</Txt>
      {c.sections.map((s, si) => (
        <View key={s.heading} style={{ gap: 6 }}>
          <Txt v="eyebrow">{s.heading}</Txt>
          {s.lines.map((l, li) => {
            const k = `${si}-${li}`; const v = pick[k]; const ok = checked && v === l.relevant;
            return (
              <View key={k} style={{ padding: 10, borderRadius: 12, gap: 6, backgroundColor: !checked ? t.c.sunk : v === undefined ? t.c.sunk : ok ? t.c.okSoft : t.c.critSoft }}>
                <Txt v="small" style={{ fontFamily: FONTS.mono }}>{l.text}</Txt>
                <Row gap={6}>
                  {[[true, "Include"], [false, "Leave out"]].map(([val, label]) => {
                    const on = v === val;
                    return (
                      <Pressable key={label} onPress={() => choose(k, val)} accessibilityRole="radio" accessibilityState={{ checked: on }}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: on ? (val ? t.c.ok : t.c.crit) : t.c.line, backgroundColor: on ? (val ? t.c.okSoft : t.c.critSoft) : t.c.surface }}>
                        <Txt v="smallB" color={on ? (val ? t.c.ok : t.c.crit) : t.c.muted}>{label}</Txt>
                      </Pressable>
                    );
                  })}
                  {checked ? <Icon name={ok ? "CheckCircle2" : "XCircle"} size={17} color={ok ? t.c.ok : t.c.crit} /> : null}
                </Row>
                {checked ? <Txt v="tiny" muted><Txt v="tiny" style={{ fontFamily: FONTS.bodyBold }}>{l.relevant ? "Include: " : "Leave out: "}</Txt>{l.why}</Txt> : null}
              </View>
            );
          })}
        </View>
      ))}
      {checked ? (
        <Note mod={mod} tone={right / lines.length >= 0.8 ? "ok" : "warn"} icon="ClipboardCheck">{right} of {lines.length} choices match an assessor's view. Read the reasons on any you missed, then compare with the model letter below.</Note>
      ) : <Txt v="tiny" muted>{answered} of {lines.length} lines sorted.</Txt>}
      <Row wrap gap={8}>
        {!checked ? <Btn mod={mod} icon="ClipboardCheck" title="Check my choices" disabled={answered < lines.length} onPress={() => { buzz(); setChecked(true); }} />
          : <Btn mod={mod} kind="secondary" icon="RotateCcw" title="Try again" onPress={() => { setPick({}); setChecked(false); }} />}
      </Row>
      <Accordion mod={mod} title="Model letter for this case">
        <Txt v="body" style={{ lineHeight: 23 }}>{c.model}</Txt>
        <CopyButton mod={mod} text={c.model} label="Copy letter" />
      </Accordion>
    </Card>
  );
}

function Builder({ mod }) {
  const t = useTheme(mod); const [i, setI] = useState(0); const s = P.letterSteps[i];
  return (
    <Card mod={mod} style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <Txt v="eyebrow">Letter builder · Step {i + 1} of {P.letterSteps.length}</Txt>
        <Txt v="h3">{s.title}</Txt>
      </View>
      <Row gap={4}>{P.letterSteps.map((x, k) => <View key={x.id} style={{ flex: 1, height: 6, borderRadius: 99, backgroundColor: k <= i ? t.tint : t.c.sunk }} />)}</Row>
      <Txt v="small">{s.tip}</Txt>
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.soft, gap: 6 }}>
        <Txt v="eyebrow" color={t.tint}>Example from case 1</Txt>
        <Txt v="body" style={{ lineHeight: 23 }}>{s.example}</Txt>
      </View>
      <Row style={{ justifyContent: "space-between" }}>
        <Btn mod={mod} small kind="secondary" icon="ArrowLeft" title="Back" disabled={i === 0} onPress={() => setI(i - 1)} />
        <CopyButton mod={mod} text={s.example} />
        <Btn mod={mod} small icon="ArrowRight" title="Next" disabled={i === P.letterSteps.length - 1} onPress={() => setI(i + 1)} />
      </Row>
    </Card>
  );
}

function Register({ mod }) {
  const t = useTheme(mod);
  return (
    <Card mod={mod} style={{ gap: 10 }}>
      <View style={{ gap: 2 }}>
        <Txt v="eyebrow">Professional register</Txt>
        <Txt v="h3">Say it like a clinician</Txt>
      </View>
      {P.register.map(([a, b, why]) => (
        <View key={a} style={{ gap: 4, padding: 10, borderRadius: 12, backgroundColor: t.c.sunk }}>
          <Row gap={6} center={false}><Icon name="XCircle" size={15} color={t.c.crit} /><Txt v="small" style={{ flex: 1 }} color={t.c.muted}>{a}</Txt></Row>
          <Row gap={6} center={false}><Icon name="CheckCircle2" size={15} color={t.c.ok} /><Txt v="smallB" style={{ flex: 1 }}>{b}</Txt></Row>
          <Txt v="tiny" muted>{why}</Txt>
        </View>
      ))}
      <Txt v="tiny" muted>Left: common learner phrasing. Right: professional clinical register.</Txt>
    </Card>
  );
}

function Tasks({ mod }) {
  const t = useTheme(mod);
  return (
    <View style={{ gap: 10 }}>
      <Txt v="eyebrow">More timed practice tasks</Txt>
      {EN.writing.map((w) => (
        <Accordion key={w.id} mod={mod} title={w.title}>
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.c.sunk }}><Txt v="small" style={{ fontFamily: FONTS.mono, lineHeight: 19 }}>{w.notes}</Txt></View>
          <Txt v="body">{w.task}</Txt>
          <Txt v="smallB">Model letter</Txt>
          <Txt v="body" style={{ lineHeight: 23 }}>{w.model}</Txt>
        </Accordion>
      ))}
    </View>
  );
}

export function OetWriting({ mod }) {
  const [part, setPart] = useState("transform");
  return (
    <View style={{ gap: 12 }}>
      <Note mod={mod} icon="Timer">OET Writing: 5 minutes to read the case notes (no writing), then 40 minutes to write a letter of about 180–200 words in the body.</Note>
      <Seg mod={mod} value={part} onChange={setPart} options={[{ id: "transform", label: "Case notes", icon: "ClipboardCheck" }, { id: "build", label: "Letter builder", icon: "FileEdit" }, { id: "register", label: "Register", icon: "Languages" }, { id: "tasks", label: "Tasks", icon: "FileText" }]} />
      {part === "transform" ? <Transformer mod={mod} /> : null}
      {part === "build" ? <ProGate mod={mod} feature="OET letter builder" desc="Build a referral or discharge letter step by step, with model paragraphs to copy and compare."><Builder mod={mod} /></ProGate> : null}
      {part === "register" ? <ProGate mod={mod} feature="Professional register" desc="Common learner phrasing next to the professional clinical register assessors expect."><Register mod={mod} /></ProGate> : null}
      {part === "tasks" ? <ProGate mod={mod} feature="Timed letter tasks" desc="Full OET-style case notes with model letters."><Tasks mod={mod} /></ProGate> : null}
    </View>
  );
}
