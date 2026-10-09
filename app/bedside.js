// Module 5 · Bedside: lessons, "chart this, not that" trainer and license protection hub.
import React, { useState } from "react";
import { View, Pressable, Linking } from "react-native";
import { Screen, Hero, Seg, Card, Row, Txt, Icon, IconTile, Bar, Chip, Note, Option, Btn, Accordion, Bullets, tap, buzz, Grid } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme } from "../src/theme";
import { useApp } from "../src/state";
import { LESSONS, CHART_CASES, LICENSE_DOS, LICENSE_DONTS, INSURERS } from "../src/data/content";

const MOD = "bedside";
const LETTERS = ["a", "b", "c", "d", "e", "f"];

export default function Bedside() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState("lessons");
  const lessons = state.lessons || {};
  const doneCount = LESSONS.filter((l) => lessons[l.id]).length;
  return (
    <Screen mod={MOD}>
      <BackRow title="Bedside" mod={MOD} />
      <Hero mod={MOD} icon="Stethoscope" eyebrow="Module 5 · Clinical transition" title="Ready for the U.S. bedside"
        sub="Short lessons on the parts of U.S. practice that most surprise internationally educated nurses. Read the lesson, then pass the check to mark it complete."
        stats={[["Lessons", LESSONS.length], ["Completed", doneCount + " / " + LESSONS.length], ["Total time", LESSONS.reduce((n, l) => n + l.mins, 0) + " min"]]} />
      <Seg mod={MOD} value={view} onChange={setView} options={[{ id: "lessons", label: "Lessons", icon: "BookOpen" }, { id: "chart", label: "Chart this, not that", icon: "FileEdit" }, { id: "license", label: "License protection", icon: "ShieldCheck" }]} />
      {view === "lessons" ? <Lessons lessons={lessons} doneCount={doneCount} dispatch={dispatch} /> : null}
      {view === "chart" ? <ChartTrainer /> : null}
      {view === "license" ? <LicenseHub /> : null}
    </Screen>
  );
}

function Lessons({ lessons, doneCount, dispatch }) {
  const t = useTheme(MOD);
  const [cur, setCur] = useState(LESSONS[0].id); const [pick, setPick] = useState(null);
  const L = LESSONS.find((l) => l.id === cur) || LESSONS[0];
  const idx = LESSONS.indexOf(L);
  const choose = (id) => { setCur(id); setPick(null); };
  return (
    <>
      <Row gap={12}>
        <View style={{ flex: 1 }}><Bar mod={MOD} pct={doneCount / LESSONS.length} /></View>
        <Txt v="mono">{doneCount}/{LESSONS.length}</Txt>
      </Row>
      <View style={{ gap: 8 }}>
        {LESSONS.map((l, i) => {
          const on = cur === l.id; const done = !!lessons[l.id];
          return (
            <Pressable key={l.id} onPress={() => { tap(); choose(l.id); }} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: on ? 1.5 : 1,
                borderColor: on ? t.tint : t.c.line, backgroundColor: on ? t.soft : t.c.surface, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
              <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: on ? t.tint : t.c.sunk }}>
                <Txt v="mono" color={on ? "#fff" : t.c.muted}>{String(i + 1).padStart(2, "0")}</Txt>
              </View>
              <Txt v="smallB" style={{ flex: 1, fontSize: 14.5, lineHeight: 20 }}>{l.title}</Txt>
              {done ? <Icon name="CheckCircle2" size={19} color={t.c.ok} /> : <Txt v="mono" muted style={{ fontSize: 12 }}>{l.mins}m</Txt>}
            </Pressable>
          );
        })}
      </View>

      <Card mod={MOD} accent style={{ gap: 16 }}>
        <Row gap={12} center={false}>
          <IconTile mod={MOD} icon="BookOpen" size={42} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="eyebrow">Lesson {idx + 1} · {L.mins} min</Txt>
            <Txt v="h2">{L.title}</Txt>
          </View>
        </Row>
        {L.body.map(([h, body]) => (
          <View key={h} style={{ gap: 4 }}>
            <Txt v="eyebrow" color={t.tint}>{h}</Txt>
            <Txt v="body">{body}</Txt>
          </View>
        ))}
        <View style={{ padding: 14, borderRadius: 14, backgroundColor: t.c.sunk, gap: 10 }}>
          <Txt v="eyebrow">Knowledge check</Txt>
          <Txt v="bodyB">{L.check.q}</Txt>
          {L.check.opts.map((o, i) => (
            <Option key={i} mod={MOD} letter={LETTERS[i]} label={o}
              state={pick === null ? null : i === L.check.a ? "right" : pick === i ? "wrong" : null}
              onPress={() => { setPick(i); if (i === L.check.a) { buzz(); dispatch({ type: "lesson", id: L.id }); } }} />
          ))}
          {pick !== null ? (
            <Row gap={6}>
              <Icon name={pick === L.check.a ? "CheckCircle2" : "Info"} size={16} color={pick === L.check.a ? t.c.ok : t.c.crit} />
              <Txt v="small" style={{ flex: 1 }} color={pick === L.check.a ? t.c.ok : t.c.crit}>{pick === L.check.a ? "Correct — lesson marked complete." : "Not quite. Review the lesson and try another answer."}</Txt>
            </Row>
          ) : null}
        </View>
        {idx < LESSONS.length - 1 ? <Btn mod={MOD} kind="secondary" small icon="ArrowRight" title="Next lesson" onPress={() => choose(LESSONS[idx + 1].id)} /> : null}
      </Card>
    </>
  );
}

function ChartTrainer() {
  const t = useTheme(MOD);
  const [i, setI] = useState(0); const [pick, setPick] = useState(null);
  const c = CHART_CASES[i]; const flip = (i % 2) === 1;
  const cards = flip ? [["good", c.good], ["bad", c.bad]] : [["bad", c.bad], ["good", c.good]];
  const show = pick !== null;
  return (
    <>
      <Row wrap gap={8}>
        {CHART_CASES.map((x, k) => <Chip key={x.id} mod={MOD} icon={x.icon} text={x.title} tone={k === i ? "acc" : "mute"} active={k === i} onPress={() => { setI(k); setPick(null); }} />)}
      </Row>
      <Txt v="small" muted>Which note would hold up in a Board investigation or a deposition? Tap one.</Txt>
      {cards.map(([kind, text], k) => {
        const good = kind === "good";
        return (
          <Pressable key={kind} disabled={show} onPress={() => { tap(); setPick(kind); if (good) buzz(); }} accessibilityRole="button" accessibilityLabel={"Note " + (k + 1)}
            style={({ pressed }) => ({ gap: 8, padding: 14, borderRadius: 16, borderWidth: 1.5,
              borderColor: show ? (good ? t.c.ok : t.c.crit) : t.c.line, backgroundColor: show ? (good ? t.c.okSoft : t.c.critSoft) : t.c.surface,
              transform: [{ scale: pressed ? 0.985 : 1 }] })}>
            <Row gap={8} style={{ justifyContent: "space-between" }}>
              <Txt v="eyebrow">Note {k + 1}</Txt>
              {show ? <Chip mod={MOD} tone={good ? "ok" : "crit"} icon={good ? "ShieldCheck" : "ShieldAlert"} text={good ? "Chart this" : "Not this"} /> : null}
            </Row>
            <Txt v="mono" style={{ lineHeight: 21 }}>{text}</Txt>
          </Pressable>
        );
      })}
      {show ? (
        <View style={{ gap: 10, padding: 16, borderRadius: 18, backgroundColor: t.soft }}>
          <Row gap={8} center={false}>
            <Icon name={pick === "good" ? "PartyPopper" : "Info"} size={18} color={pick === "good" ? t.c.ok : t.c.crit} />
            <Txt v="bodyB" style={{ flex: 1 }} color={pick === "good" ? t.c.ok : t.c.crit}>{pick === "good" ? "Right — that's the defensible note." : "That one would hurt you. Here's why the other holds up:"}</Txt>
          </Row>
          <Bullets items={c.why} />
          {i < CHART_CASES.length - 1 ? <Btn mod={MOD} icon="ArrowRight" title="Next scenario" onPress={() => { setI(i + 1); setPick(null); }} /> : null}
        </View>
      ) : null}
    </>
  );
}

function LicenseHub() {
  const t = useTheme(MOD);
  const open = (url) => { Linking.openURL(url).catch(() => {}); };
  return (
    <>
      {[["Do", LICENSE_DOS, "ok", "ShieldCheck"], ["Don't", LICENSE_DONTS, "crit", "ShieldX"]].map(([h, list, tone, ic]) => {
        const fg = t.c[tone]; const bg = t.c[tone + "Soft"];
        return (
          <Card key={h} mod={MOD} style={{ gap: 14, borderColor: bg, borderWidth: 1.5 }}>
            <Row gap={10}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={20} color={fg} /></View>
              <Txt v="h2" color={fg}>{h}</Txt>
            </Row>
            {list.map(([title, d]) => (
              <Row key={title} gap={10} center={false}>
                <View style={{ paddingTop: 2 }}><Icon name={tone === "ok" ? "CheckCircle2" : "XCircle"} size={18} color={fg} /></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt v="bodyB" style={{ fontSize: 14.5 }}>{title}</Txt>
                  <Txt v="small" muted>{d}</Txt>
                </View>
              </Row>
            ))}
          </Card>
        );
      })}

      <Card mod={MOD} style={{ gap: 14 }}>
        <Row gap={12} center={false}>
          <IconTile mod={MOD} icon="Shield" size={42} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="eyebrow">Individual malpractice insurance</Txt>
            <Txt v="h2">Compare RN liability policies</Txt>
          </View>
        </Row>
        <Chip mod={MOD} icon="CalendarCheck" text="Figures checked Oct 2026" />
        <Grid min={240} gap={10}>
          {INSURERS.map((x) => (
            <View key={x.name} style={{ flexGrow: 1, padding: 14, borderRadius: 16, backgroundColor: t.c.sunk, borderWidth: 1, borderColor: t.c.line, gap: 8 }}>
              <View style={{ gap: 2 }}>
                <Txt v="h2" color={t.tint}>{x.name}</Txt>
                <Txt v="tiny" muted>{x.who}</Txt>
              </View>
              {[["Limits", x.limits], ["Board / license defense", x.board], ["Deposition", x.depo]].map(([k, v]) => (
                <Row key={k} gap={12} center={false} style={{ justifyContent: "space-between", borderTopWidth: 1, borderTopColor: t.c.line, paddingTop: 6 }}>
                  <Txt v="small" muted style={{ flexShrink: 0, maxWidth: "45%" }}>{k}</Txt>
                  <Txt v="smallB" style={{ flex: 1, textAlign: "right" }}>{v}</Txt>
                </Row>
              ))}
              <Txt v="tiny" muted>{x.note}</Txt>
              <Pressable onPress={() => { tap(); open(x.url); }} accessibilityRole="link" accessibilityLabel={"Get a quote from " + x.name} hitSlop={8}
                style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingVertical: 4 }}>
                <Txt v="smallB" color={t.tint}>Get a quote</Txt>
                <Icon name="ArrowUpRight" size={15} color={t.tint} />
              </Pressable>
            </View>
          ))}
        </Grid>
        <Accordion mod={MOD} title="What to compare before you buy">
          <Bullets items={[
            <Txt v="body"><Txt v="bodyB">Occurrence vs. claims-made.</Txt> Occurrence covers incidents during the policy year forever. Claims-made needs "tail" coverage when you cancel.</Txt>,
            <Txt v="body"><Txt v="bodyB">License defense amount</Txt> and whether it's per claim or per year.</Txt>,
            <Txt v="body"><Txt v="bodyB">Deposition coverage</Txt> for when you're a witness, not the defendant.</Txt>,
            <Txt v="body"><Txt v="bodyB">Consent to settle:</Txt> can the insurer settle in your name without your agreement?</Txt>,
            <Txt v="body"><Txt v="bodyB">Every place you work:</Txt> PRN, agency, travel and volunteer shifts should all be covered.</Txt>,
          ]} />
          <Txt v="tiny" muted>This is a comparison, not an endorsement. Terms change; confirm on your quote.</Txt>
        </Accordion>
      </Card>
    </>
  );
}
