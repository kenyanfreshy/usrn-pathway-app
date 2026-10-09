// Module 5 · Bedside: the U.S. clinical transition curriculum.
// 6 lessons (rationale, protocol, scripts, 3-question knowledge check), an SBAR builder with read-back practice,
// "Chart this, not that" flip cards and trainer, and the license protection hub.
import React, { useState } from "react";
import { View, Pressable, Linking } from "react-native";
import { Screen, Hero, Seg, Card, Row, Txt, Icon, IconTile, Bar, Chip, Note, Option, Btn, Accordion, Bullets, Field, CopyButton, tap, buzz, Grid } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { TutorCard } from "../src/tutor";
import { useTheme, FONTS } from "../src/theme";
import { useApp } from "../src/state";
import { CHART_CASES, LICENSE_DOS, LICENSE_DONTS, INSURERS } from "../src/data/content";
import { LESSONS, PASS_MARK, SBAR_SCENARIOS, CHART_CARDS } from "../src/data/bedside";
import { fmtDate } from "../src/util";
import { DestPill } from "../src/dest";
import { countryData, destId, destOf, lifeOf, WORDS } from "../src/data/global";
import { SourcesBlock } from "../src/career/country";

const MOD = "bedside";
const LETTERS = ["a", "b", "c", "d", "e", "f"];
const isDone = (v) => !!v;

export default function Bedside() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState("lessons");
  const lessons = state.lessons || {};
  const doneCount = LESSONS.filter((l) => isDone(lessons[l.id])).length;
  const dest = destId(state); const info = destOf(dest);
  return (
    <Screen mod={MOD}>
      <BackRow title="Bedside" mod={MOD} />
      <Hero mod={MOD} icon="Stethoscope" eyebrow={`Module 5 · Clinical transition · ${info.flag} ${info.short}`} title={`Ready for the ${WORDS[dest].bedside}`}
        sub={dest === "US" ? "Six lessons on the parts of U.S. hospital practice that most surprise internationally educated nurses. Pass each knowledge check to earn your U.S. Clinical Readiness Certificate."
          : `Six bedside lessons with notes on how each one works in ${info.name}, plus the Country tab for local practice. Most skills (handover, delegation, safe charting) carry over; the laws and systems differ.`}
        stats={[["Lessons", LESSONS.length], ["Completed", doneCount + " / " + LESSONS.length], ["Total time", LESSONS.reduce((n, l) => n + l.mins, 0) + " min"]]} />
      <DestPill mod={MOD} />
      <TutorCard mod={MOD} />
      <Seg mod={MOD} value={view} onChange={setView} options={[{ id: "lessons", label: "Lessons", icon: "BookOpen" }, { id: "sbar", label: "SBAR", icon: "PhoneCall" }, { id: "chart", label: "Charting", icon: "FileEdit" }, { id: "license", label: "License", icon: "ShieldCheck" }, { id: "country", label: "Country", icon: "Globe" }]} />
      {view === "lessons" ? <Lessons dest={dest} lessons={lessons} doneCount={doneCount} dispatch={dispatch} name={[state.profile.name, state.profile.lastName].filter(Boolean).join(" ")} /> : null}
      {view === "sbar" ? <SbarBuilder name={state.profile.name} /> : null}
      {view === "chart" ? <><FlipCards /><ChartTrainer dest={dest} /></> : null}
      {view === "license" ? <LicenseHub dest={dest} /> : null}
      {view === "country" ? <CountryNotes dest={dest} /> : null}
    </Screen>
  );
}

/* ---------------- country practice notes ---------------- */
const NOTE_ICONS = ["Landmark", "Users", "Hospital", "Lock", "PhoneCall", "HeartPulse", "Scale"];
function CountryNotes({ dest }) {
  const t = useTheme(MOD); const d = countryData(dest); const info = destOf(dest);
  return (
    <View style={{ gap: 12 }}>
      {!d ? (
        <Note mod={MOD} icon="Info" title="U.S. practice">The Lessons, SBAR, Charting and License tabs are written for U.S. hospitals. Change your destination with the button at the top to see how practice differs in Canada, Australia or New Zealand.</Note>
      ) : (
        <>
          <View style={{ gap: 4 }}>
            <Txt v="eyebrow">{info.flag} {info.name}</Txt>
            <Txt v="h2">{d.bedside.title}</Txt>
            <Txt v="small" muted>What changes when you move from the U.S.-style lessons in this module to the bedside in {info.name}.</Txt>
          </View>
          {d.bedside.points.map(([h, text], k) => (
            <Card key={h} mod={MOD} style={{ gap: 8 }}>
              <Row gap={10}>
                <IconTile mod={MOD} icon={NOTE_ICONS[k % NOTE_ICONS.length]} size={36} />
                <Txt v="h3" style={{ flex: 1 }}>{h}</Txt>
              </Row>
              <Txt v="small">{text}</Txt>
            </Card>
          ))}
          <Txt v="tiny" muted>Checked {fmtDate(d.checked)} against the regulator's published standards. Your employer's policies come first.</Txt>
          <SourcesBlock dest={dest} mod={MOD} />
        </>
      )}
    </View>
  );
}

/* ---------------- certificate ---------------- */
function Certificate({ lessons, name, dest }) {
  const t = useTheme(MOD);
  const scored = LESSONS.map((l) => lessons[l.id]).filter((v) => v && typeof v === "object");
  const pct = scored.length ? Math.round(scored.reduce((n, v) => n + v.best / v.max, 0) / scored.length * 100) : null;
  const dates = scored.map((v) => v.date).filter(Boolean).sort();
  return (
    <View style={{ borderRadius: 22, padding: 3, backgroundColor: "#F59E0B" }}>
      <View style={{ borderRadius: 19, padding: 20, gap: 10, alignItems: "center", backgroundColor: t.c.surface }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" }}><Icon name="Award" size={30} color="#B45309" /></View>
        <Txt v="eyebrow" color="#B45309">Certificate of completion</Txt>
        <Txt v="h2" style={{ textAlign: "center" }}>{WORDS[dest].cert}</Txt>
        <Txt v="body" muted style={{ textAlign: "center" }}>Awarded to</Txt>
        <Txt v="h1" style={{ textAlign: "center" }}>{name || "You"}</Txt>
        <Txt v="small" muted style={{ textAlign: "center" }}>
          for completing all six NurseBound bedside lessons: SBAR and escalation, defensive documentation, privacy and social media, delegation, patient rights and code status, and workplace advocacy.
        </Txt>
        <Row gap={8} style={{ flexWrap: "wrap", justifyContent: "center" }}>
          {pct !== null ? <Chip mod={MOD} tone="ok" icon="CheckCircle2" text={`Average score ${pct}%`} /> : null}
          {dates.length ? <Chip mod={MOD} tone="mute" icon="CalendarCheck" text={fmtDate(dates[dates.length - 1])} /> : null}
        </Row>
        <Txt v="tiny" muted style={{ textAlign: "center" }}>A personal learning milestone in this app, not a professional credential or continuing-education certificate.</Txt>
      </View>
    </View>
  );
}

/* ---------------- lessons ---------------- */
function Lessons({ dest, lessons, doneCount, dispatch, name }) {
  const life = lifeOf(dest); const info = destOf(dest);
  const t = useTheme(MOD);
  const [cur, setCur] = useState(LESSONS[0].id);
  const L = LESSONS.find((l) => l.id === cur) || LESSONS[0];
  const idx = LESSONS.indexOf(L);
  const choose = (id) => setCur(id);
  return (
    <>
      {doneCount === LESSONS.length ? <Certificate lessons={lessons} name={name} dest={dest} /> : null}
      <Row gap={12}>
        <View style={{ flex: 1 }}><Bar mod={MOD} pct={doneCount / LESSONS.length} /></View>
        <Txt v="mono">{doneCount}/{LESSONS.length}</Txt>
      </Row>
      {doneCount < LESSONS.length ? <Txt v="tiny" muted>Complete all {LESSONS.length} lessons to unlock your {WORDS[dest].cert} Certificate.</Txt> : null}
      <View style={{ gap: 8 }}>
        {LESSONS.map((l, i) => {
          const on = cur === l.id; const v = lessons[l.id]; const done = isDone(v);
          return (
            <Pressable key={l.id} onPress={() => { tap(); choose(l.id); }} accessibilityRole="button" accessibilityState={{ selected: on }}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: on ? 1.5 : 1,
                borderColor: on ? t.tint : t.c.line, backgroundColor: on ? t.soft : t.c.surface, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
              <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: on ? t.tint : t.c.sunk }}>
                <Icon name={l.icon} size={17} color={on ? "#fff" : t.c.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt v="smallB" style={{ fontSize: 14.5, lineHeight: 20 }}>{i + 1}. {l.title}</Txt>
                {v && typeof v === "object" ? <Txt v="tiny" muted>Best score {v.best}/{v.max}</Txt> : null}
              </View>
              {done ? <Icon name="CheckCircle2" size={19} color={t.c.ok} /> : <Txt v="mono" muted style={{ fontSize: 12 }}>{l.mins}m</Txt>}
            </Pressable>
          );
        })}
      </View>

      <Card mod={MOD} accent style={{ gap: 16 }} key={L.id}>
        <Row gap={12} center={false}>
          <IconTile mod={MOD} icon={L.icon} size={42} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="eyebrow">Lesson {idx + 1} of {LESSONS.length} · {L.mins} min</Txt>
            <Txt v="h2">{L.title}</Txt>
          </View>
        </Row>

        <View style={{ padding: 14, borderRadius: 14, backgroundColor: t.soft, gap: 6 }}>
          <Row gap={6}><Icon name="Lightbulb" size={16} color={t.tint} /><Txt v="eyebrow" color={t.tint}>{dest === "US" ? "Why this matters in the U.S." : "Why this matters · U.S. example"}</Txt></Row>
          <Txt v="body">{L.why}</Txt>
        </View>

        {life && life.lessonNotes && life.lessonNotes[L.id] ? (
          <View style={{ padding: 14, borderRadius: 14, backgroundColor: t.soft2, gap: 6, borderWidth: 1, borderColor: t.tint2 }}>
            <Row gap={6}><Txt v="body">{info.flag}</Txt><Txt v="eyebrow" color={t.tint2}>How this works in {info.name}</Txt></Row>
            <Txt v="body">{life.lessonNotes[L.id]}</Txt>
          </View>
        ) : null}

        {L.sections.map(([h, body]) => (
          <View key={h} style={{ gap: 6 }}>
            <Txt v="h3">{h}</Txt>
            {body.split("\n").map((p, k) => <Txt key={k} v="body">{p}</Txt>)}
          </View>
        ))}

        {L.scripts.map(([label, text]) => (
          <View key={label} style={{ gap: 8, padding: 14, borderRadius: 14, backgroundColor: t.c.sunk, borderLeftWidth: 4, borderLeftColor: t.tint }}>
            <Txt v="eyebrow">Say it like this · {label}</Txt>
            <Txt v="body" style={{ fontStyle: "italic" }}>{text}</Txt>
          </View>
        ))}

        <Grid min={240} gap={10}>
          {[["Do", L.dos, "ok", "CheckCircle2"], ["Don't", L.donts, "crit", "XCircle"]].map(([h, list, tone, ic]) => (
            <View key={h} style={{ flexGrow: 1, gap: 8, padding: 14, borderRadius: 14, backgroundColor: t.c[tone + "Soft"] }}>
              <Txt v="bodyB" color={t.c[tone]}>{h}</Txt>
              {list.map((x) => <Row key={x} gap={8} center={false}><View style={{ paddingTop: 2 }}><Icon name={ic} size={15} color={t.c[tone]} /></View><Txt v="small" style={{ flex: 1 }}>{x}</Txt></Row>)}
            </View>
          ))}
        </Grid>

        <KnowledgeCheck L={L} prev={lessons[L.id]} onPass={(score, max) => dispatch({ type: "lesson", id: L.id, result: { best: score, max, date: new Date().toISOString().slice(0, 10) } })} />

        {idx < LESSONS.length - 1 ? <Btn mod={MOD} kind="secondary" small icon="ArrowRight" title="Next lesson" onPress={() => choose(LESSONS[idx + 1].id)} /> : null}
      </Card>
    </>
  );
}

function KnowledgeCheck({ L, prev, onPass }) {
  const t = useTheme(MOD);
  const [picks, setPicks] = useState({}); const [run, setRun] = useState(0);
  const qs = L.check;
  const answered = qs.filter((_, i) => picks[i] !== undefined).length;
  const score = qs.filter((q, i) => picks[i] === q.a).length;
  const finished = answered === qs.length;
  const passed = finished && score >= PASS_MARK;
  const pick = (i, o) => {
    if (picks[i] !== undefined) return;
    const next = { ...picks, [i]: o }; setPicks(next);
    if (o === qs[i].a) buzz();
    const sc = qs.filter((q, k) => next[k] === q.a).length;
    if (Object.keys(next).length === qs.length && sc >= PASS_MARK) onPass(sc, qs.length);
  };
  return (
    <View style={{ padding: 14, borderRadius: 16, backgroundColor: t.c.sunk, gap: 14 }} key={run}>
      <Row>
        <Txt v="eyebrow" style={{ flex: 1 }}>Knowledge check · {qs.length} questions</Txt>
        <Txt v="mono" muted>{score}/{qs.length}</Txt>
      </Row>
      {qs.map((q, i) => {
        const p = picks[i]; const done = p !== undefined; const right = p === q.a;
        return (
          <View key={i} style={{ gap: 8 }}>
            <Txt v="bodyB">{i + 1}. {q.q}</Txt>
            {q.opts.map(([text, why], o) => (
              <Option key={o} mod={MOD} letter={LETTERS[o]} label={text} disabled={done}
                state={!done ? null : o === q.a ? "right" : p === o ? "wrong" : null}
                why={done && (o === q.a || o === p) ? why : null}
                onPress={() => pick(i, o)} />
            ))}
            {done ? (
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center", padding: 10, borderRadius: 12, backgroundColor: right ? t.c.okSoft : t.c.critSoft }}>
                <Icon name={right ? "CheckCircle2" : "XCircle"} size={18} color={right ? t.c.ok : t.c.crit} />
                <Txt v="smallB" color={right ? t.c.ok : t.c.crit} style={{ flex: 1 }}>{right ? "Correct." : "Not quite. The correct answer is highlighted in green."}</Txt>
              </View>
            ) : null}
          </View>
        );
      })}
      {finished ? (
        <Note mod={MOD} tone={passed ? "ok" : "warn"} icon={passed ? "PartyPopper" : "RotateCcw"} title={passed ? `Lesson complete: ${score}/${qs.length}` : `${score}/${qs.length}: not passed yet`}>
          {passed ? "Saved to your progress." : `You need ${PASS_MARK} of ${qs.length} to complete this lesson. Review the lesson and try again.`}
        </Note>
      ) : null}
      {finished ? <Btn mod={MOD} kind="secondary" small icon="RotateCcw" title="Retake the check" onPress={() => { setPicks({}); setRun(run + 1); }} /> : null}
      {prev && typeof prev === "object" && !finished ? <Txt v="tiny" muted>Completed before · best {prev.best}/{prev.max}</Txt> : null}
    </View>
  );
}

/* ---------------- SBAR builder ---------------- */
const SBAR_LABEL = { S: "Situation", B: "Background", A: "Assessment", R: "Recommendation" };
// Show the three versions in a fixed but mixed order, so the best one isn't always first.
const ORDERS = [[1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0]];

function SbarBuilder({ name }) {
  const t = useTheme(MOD);
  const [sid, setSid] = useState(SBAR_SCENARIOS[0].id);
  const sc = SBAR_SCENARIOS.find((x) => x.id === sid);
  const [me, setMe] = useState(name || ""); const [unit, setUnit] = useState(""); const [doc, setDoc] = useState("");
  const [sel, setSel] = useState({}); const [rb, setRb] = useState(null);
  const switchTo = (id) => { setSid(id); setSel({}); setRb(null); };
  const keys = ["S", "B", "A", "R"];
  const complete = keys.every((k) => sel[k] !== undefined);
  const best = keys.filter((k) => sel[k] !== undefined && sc.parts[k][sel[k]][1]).length;
  const script = complete
    ? `${doc.trim() ? `Dr. ${doc.trim()}, this` : "This"} is ${me.trim() || "[your name]"}, RN${unit.trim() ? ` on ${unit.trim()}` : ""}. ` + keys.map((k) => sc.parts[k][sel[k]][0]).join(" ")
    : "";
  return (
    <>
      <Txt v="small" muted>Build a phone report for a high-stakes situation, compare it with the strongest version, then practice reading back the order you receive.</Txt>
      <Row gap={8} style={{ flexWrap: "wrap" }}>
        {SBAR_SCENARIOS.map((x) => <Chip key={x.id} mod={MOD} icon={x.icon} text={x.title} tone={x.id === sid ? "acc" : "mute"} active={x.id === sid} onPress={() => switchTo(x.id)} />)}
      </Row>

      <Card mod={MOD} style={{ gap: 8, backgroundColor: t.c.sunk }}>
        <Txt v="eyebrow">At the bedside</Txt>
        <Txt v="body">{sc.chart}</Txt>
      </Card>

      <Card mod={MOD} style={{ gap: 12 }}>
        <Txt v="h3">Who's calling</Txt>
        <Grid min={150} gap={10}>
          <Field mod={MOD} label="Your name" value={me} onChangeText={setMe} placeholder="e.g. Grace" autoCapitalize="words" />
          <Field mod={MOD} label="Your unit" value={unit} onChangeText={setUnit} placeholder="e.g. 4 West" autoCapitalize="words" />
          <Field mod={MOD} label="Provider (last name)" value={doc} onChangeText={setDoc} placeholder="e.g. Patel" autoCapitalize="words" />
        </Grid>
      </Card>

      {keys.map((k, n) => (
        <Card key={sc.id + k} mod={MOD} style={{ gap: 10 }}>
          <Row gap={10}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.tint, alignItems: "center", justifyContent: "center" }}><Txt v="h3" color="#fff">{k}</Txt></View>
            <Txt v="h3" style={{ flex: 1 }}>{SBAR_LABEL[k]}</Txt>
          </Row>
          {ORDERS[n].map((o) => {
            const [text, good] = sc.parts[k][o]; const chosen = sel[k] === o; const show = sel[k] !== undefined;
            return (
              <Option key={o} mod={MOD} label={text}
                state={!show ? null : good ? "right" : chosen ? "wrong" : null}
                why={show && chosen && !good ? "A stronger version is highlighted in green: specific, objective and actionable." : show && chosen && good ? "Strong choice." : null}
                onPress={() => setSel({ ...sel, [k]: o })} />
            );
          })}
        </Card>
      ))}

      {complete ? (
        <Card mod={MOD} accent style={{ gap: 12 }}>
          <Row>
            <Txt v="h3" style={{ flex: 1 }}>Your SBAR script</Txt>
            <Chip mod={MOD} tone={best === 4 ? "ok" : "warn"} text={`${best}/4 strongest`} />
          </Row>
          <Txt v="body" style={{ fontStyle: "italic" }}>"{script}"</Txt>
          <CopyButton mod={MOD} text={script} label="Copy script" />
        </Card>
      ) : null}

      {complete ? (
        <Card mod={MOD} style={{ gap: 10 }}>
          <Txt v="eyebrow">Read-back & verify</Txt>
          <Txt v="body">The provider replies:</Txt>
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.c.sunk }}><Txt v="bodyB" style={{ fontStyle: "italic" }}>"{sc.order}"</Txt></View>
          <Txt v="bodyB">How do you read it back?</Txt>
          {sc.readBack.map(([text, good, why], o) => (
            <Option key={o} mod={MOD} letter={LETTERS[o]} label={text} disabled={rb !== null}
              state={rb === null ? null : good ? "right" : rb === o ? "wrong" : null}
              why={rb !== null && (good || rb === o) ? why : null}
              onPress={() => { setRb(o); if (good) buzz(); }} />
          ))}
          {rb !== null ? <Btn mod={MOD} kind="secondary" small icon="RotateCcw" title="Try this scenario again" onPress={() => { setSel({}); setRb(null); }} /> : null}
        </Card>
      ) : <Txt v="tiny" muted>Choose one version for each of S, B, A and R to build your script.</Txt>}
    </>
  );
}

/* ---------------- flip cards ---------------- */
function FlipCards() {
  const t = useTheme(MOD);
  const [i, setI] = useState(0); const [back, setBack] = useState(false);
  const c = CHART_CARDS[i];
  const go = (d) => { setI((i + d + CHART_CARDS.length) % CHART_CARDS.length); setBack(false); };
  return (
    <Card mod={MOD} style={{ gap: 12 }}>
      <Row>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="eyebrow">Flip cards</Txt>
          <Txt v="h3">Chart this, not that</Txt>
        </View>
        <Txt v="mono" muted>{i + 1}/{CHART_CARDS.length}</Txt>
      </Row>
      <Pressable onPress={() => { tap(); setBack(!back); }} accessibilityRole="button" accessibilityLabel={back ? "Showing the objective note. Tap to see the risky note." : "Showing the risky note. Tap to flip."}
        style={({ pressed }) => ({ minHeight: 190, padding: 18, borderRadius: 18, gap: 10, justifyContent: "center", borderWidth: 2,
          borderColor: back ? t.c.ok : t.c.crit, backgroundColor: back ? t.c.okSoft : t.c.critSoft, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
        <Row gap={8}>
          <Icon name={back ? "ShieldCheck" : "ShieldAlert"} size={18} color={back ? t.c.ok : t.c.crit} />
          <Txt v="eyebrow" color={back ? t.c.ok : t.c.crit} style={{ flex: 1 }}>{back ? "Chart this" : "Not that"} · {c.topic}</Txt>
        </Row>
        <Txt v="mono" style={{ lineHeight: 21, fontSize: 14 }}>{back ? c.objective : c.risky}</Txt>
        <Txt v="tiny" muted>{back ? "Tap to see the risky version" : "Tap to flip to the defensible note"}</Txt>
      </Pressable>
      <Row gap={10}>
        <View style={{ flex: 1 }}><Btn mod={MOD} kind="secondary" icon="ArrowLeft" title="Previous" onPress={() => go(-1)} full /></View>
        <View style={{ flex: 1 }}><Btn mod={MOD} icon="ArrowRight" title="Next" onPress={() => go(1)} full /></View>
      </Row>
    </Card>
  );
}

/* ---------------- "which note holds up?" trainer ---------------- */
function ChartTrainer({ dest }) {
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
      <Txt v="h3">Which note holds up?</Txt>
      <Txt v="small" muted>{dest === "US" ? "Which note would hold up in a Board investigation or a deposition? Tap one." : "Which note would hold up in a regulator investigation or in court? Tap one."}</Txt>
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

/** U.S. wording → the destination's regulator wording. */
const localize = (text, dest) => dest === "US" ? text : text
  .replace(/before the Board of Nursing/g, "before the " + WORDS[dest].regulator)
  .replace(/Boards treat/g, "Regulators treat")
  .replace(/Protections for incident reports vary by state\./g, "Protections for incident reports vary by jurisdiction.");

function LicenseHub({ dest }) {
  const t = useTheme(MOD);
  const open = (url) => { Linking.openURL(url).catch(() => {}); };
  const life = lifeOf(dest);
  const DOS = LICENSE_DOS.map(([a, b], i) => (i === 0 && life ? ["Know your liability protection", `Find out what covers you at work and outside it, and whether it includes help if a complaint goes to the ${WORDS[dest].regulator}. The card below explains how it works in ${destOf(dest).name}.`] : [a, localize(b, dest)])), DONTS = LICENSE_DONTS.map(([a, b]) => [a, localize(b, dest)]);
  return (
    <>
      {[["Do", DOS, "ok", "ShieldCheck"], ["Don't", DONTS, "crit", "ShieldX"]].map(([h, list, tone, ic]) => {
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

      {life ? (
        <Card mod={MOD} style={{ gap: 14 }}>
          <Row gap={12} center={false}>
            <IconTile mod={MOD} icon="Shield" size={42} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="eyebrow">Professional liability protection · {destOf(dest).flag}</Txt>
              <Txt v="h2">Who protects you in {destOf(dest).name}</Txt>
            </View>
          </Row>
          <Txt v="body">{life.license.intro}</Txt>
          <Grid min={240} gap={10}>
            {life.license.providers.map((x) => (
              <View key={x.name} style={{ flexGrow: 1, padding: 14, borderRadius: 16, backgroundColor: t.c.sunk, borderWidth: 1, borderColor: t.c.line, gap: 8 }}>
                <View style={{ gap: 2 }}>
                  <Txt v="h2" color={t.tint}>{x.name}</Txt>
                  {x.full && x.full !== x.name ? <Txt v="smallB">{x.full}</Txt> : null}
                  <Txt v="tiny" muted>{x.who}</Txt>
                </View>
                <Txt v="small">{x.notes}</Txt>
                {x.url ? (
                  <Pressable onPress={() => { tap(); open(x.url); }} accessibilityRole="link" accessibilityLabel={"Open " + x.name} hitSlop={8}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingVertical: 4 }}>
                    <Txt v="smallB" color={t.tint}>Official page</Txt>
                    <Icon name="ArrowUpRight" size={15} color={t.tint} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </Grid>
          <Txt v="tiny" muted>Checked {fmtDate(life.checked)}. This is information, not an endorsement. Confirm what your employer covers.</Txt>
        </Card>
      ) : null}
      {!life ? <Card mod={MOD} style={{ gap: 14 }}>
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
      </Card> : null}
    </>
  );
}
