// Charge nurse command center: acuity balancer, SBAR call script and clinical ladder log.
import React, { useMemo, useState } from "react";
import { View, Pressable, Share } from "react-native";
import { Txt, Row, Card, Btn, Chip, Note, Bar, Seg, Field, DateField, Select, CopyButton, Sheet, Icon, tap, buzz } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp } from "../state";
import { ACUITY, SAMPLE_PTS } from "../data/content";
import { uid, num, todayKey, fmtDate } from "../util";
import { MOD, Grid } from "./common";

const score = (p) => 1 + ACUITY.reduce((n, a) => n + (p.flags[a.k] ? a.w : 0), 0);
const scoreTone = (s) => (s >= 6 ? "crit" : s >= 3 ? "warn" : "ok");

function AcuityCalc() {
  const t = useTheme(MOD);
  const [pts, setPts] = useState(SAMPLE_PTS); const [nurses, setNurses] = useState(3);
  const toggle = (id, k) => setPts(pts.map((p) => (p.id === id ? { ...p, flags: { ...p.flags, [k]: !p.flags[k] } } : p)));
  const assign = useMemo(() => {
    const buckets = Array.from({ length: nurses }, (_, i) => ({ n: i + 1, pts: [], load: 0 }));
    [...pts].sort((a, b) => score(b) - score(a)).forEach((p) => { const b = buckets.reduce((m, x) => (x.load < m.load ? x : m)); b.pts.push(p); b.load += score(p); });
    return buckets;
  }, [pts, nurses]);
  const loads = assign.map((b) => b.load); const maxLoad = Math.max(...loads); const spread = maxLoad - Math.min(...loads);
  const step = (d) => { tap(); setNurses(Math.max(1, Math.min(8, nurses + d))); };

  return (
    <View style={{ gap: 14 }}>
      <Note mod={MOD}>Each patient starts at 1 point; indicators add weight (pressors and CRRT +3; neuro checks, insulin drip, 1:1 safety, total care +2; others +1). Patients are assigned heaviest first, each to the nurse with the lightest load so far. Always check against your unit's ratios and staff competencies.</Note>

      <Row gap={10} wrap style={{ justifyContent: "space-between" }}>
        <View style={{ gap: 5 }}>
          <Txt v="smallB" muted>Nurses on shift</Txt>
          <Row gap={0} style={{ borderWidth: 1.5, borderColor: t.c.line, borderRadius: 12, backgroundColor: t.c.surface, overflow: "hidden" }}>
            <Pressable onPress={() => step(-1)} disabled={nurses <= 1} accessibilityRole="button" accessibilityLabel="Fewer nurses" style={{ paddingHorizontal: 14, paddingVertical: 10, opacity: nurses <= 1 ? 0.4 : 1 }}><Icon name="Minus" size={18} color={t.c.ink} /></Pressable>
            <Txt v="h3" style={{ minWidth: 36, textAlign: "center", fontFamily: FONTS.monoBold }}>{nurses}</Txt>
            <Pressable onPress={() => step(1)} disabled={nurses >= 8} accessibilityRole="button" accessibilityLabel="More nurses" style={{ paddingHorizontal: 14, paddingVertical: 10, opacity: nurses >= 8 ? 0.4 : 1 }}><Icon name="Plus" size={18} color={t.c.ink} /></Pressable>
          </Row>
        </View>
        <Btn mod={MOD} kind="secondary" icon="Plus" title="Add Patient" style={{ alignSelf: "flex-end" }}
          onPress={() => setPts([...pts, { id: uid(), room: String(300 + pts.length + 1), flags: {} }])} />
      </Row>

      <View style={{ gap: 10 }}>
        {pts.map((p) => {
          const s = score(p);
          return (
            <View key={p.id} style={{ backgroundColor: t.c.sunk, borderRadius: 16, padding: 12, gap: 10, borderLeftWidth: 4, borderLeftColor: t.c[scoreTone(s)] }}>
              <Row gap={8}>
                <Icon name="BedDouble" size={17} color={t.tint} />
                <Txt v="h3" style={{ flex: 1, fontFamily: FONTS.monoBold }}>Room {p.room}</Txt>
                <Chip text={`${s} pts`} tone={scoreTone(s)} />
                <Pressable onPress={() => { tap(); setPts(pts.filter((x) => x.id !== p.id)); }} hitSlop={8} accessibilityRole="button" accessibilityLabel={"Remove room " + p.room}
                  style={{ padding: 7, borderRadius: 10, backgroundColor: t.c.surface, borderWidth: 1, borderColor: t.c.line }}>
                  <Icon name="Trash2" size={15} color={t.c.crit} />
                </Pressable>
              </Row>
              <Row wrap gap={6}>
                {ACUITY.map((a) => {
                  const on = !!p.flags[a.k];
                  return (
                    <Pressable key={a.k} onPress={() => { tap(); toggle(p.id, a.k); }} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`Room ${p.room}: ${a.label}`}
                      style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: on ? t.tint : t.c.line, backgroundColor: on ? t.soft : t.c.surface }}>
                      {on ? <Icon name="Check" size={12} color={t.tint} /> : null}
                      <Txt v="tiny" color={on ? t.tint : t.c.ink}>{a.label}</Txt>
                      <Txt v="tiny" color={on ? t.tint : t.c.muted} style={{ fontFamily: FONTS.monoBold }}>+{a.w}</Txt>
                    </Pressable>
                  );
                })}
              </Row>
            </View>
          );
        })}
      </View>

      <Row wrap gap={8}>
        <Txt v="bodyB">Suggested Assignments</Txt>
        <Chip text={`Load spread ${spread} pts ${spread <= 2 ? "· balanced" : "· review"}`} tone={spread <= 2 ? "ok" : spread <= 4 ? "warn" : "crit"} />
      </Row>
      <Grid basis={150}>
        {assign.map((b) => (
          <Card key={b.n} mod={MOD} padding={12} style={{ gap: 8 }}>
            <Row>
              <Txt v="bodyB" style={{ flex: 1 }}>RN {b.n}</Txt>
              <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{b.load} pts</Txt>
            </Row>
            <Bar mod={MOD} pct={maxLoad ? b.load / maxLoad : 0} height={7} />
            <Row wrap gap={4}>{b.pts.map((p) => <Chip key={p.id} text={`${p.room} · ${score(p)}`} />)}</Row>
          </Card>
        ))}
      </Grid>
    </View>
  );
}

const CALL_TYPES = ["Deteriorating vitals", "Unsafe order", "Change in condition", "Critical lab value"];
function SbarGen() {
  const t = useTheme(MOD);
  const [f, setF] = useState({ me: "Grace, RN", unit: "4 West step-down", pt: "Mr. R., room 412", type: "Deteriorating vitals", concern: "new hypotension and rising heart rate over the last hour",
    vitals: "BP 86/52 (from 118/70), HR 124, RR 26, SpO₂ 91% on 2 L, T 38.4 °C", bg: "68-year-old, POD 1 after right hip ORIF, history of CHF (EF 35%). Received 1 L LR overnight.",
    assess: "I'm concerned he may be developing sepsis or bleeding. Urine output is 15 mL/h for 2 hours.", rec: "Please come to the bedside within 15 minutes. Can I get a CBC, lactate and blood cultures now?" });
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const unsafe = f.type === "Unsafe order";
  const script = `S — Situation
This is ${f.me} on ${f.unit}. I'm calling about ${f.pt}. ${unsafe ? "I have a concern about an order: " : "I am concerned about "}${f.concern}.
${unsafe ? "" : "Current vitals: " + f.vitals + "\n"}
B — Background
${f.bg}

A — Assessment
${f.assess}

R — Recommendation
${f.rec}

Closed-loop confirmation
"To confirm, you want: ________. I'll read that back." (Read back every order: drug, dose, route, time.)
If I don't see improvement or can't reach you in 15 minutes, I will call the rapid response team and notify the charge nurse.`;
  return (
    <View style={{ gap: 12 }}>
      <Row gap={10} center={false}>
        <View style={{ flex: 1 }}><Field mod={MOD} label="Your name / role" value={f.me} onChangeText={set("me")} /></View>
        <View style={{ flex: 1 }}><Field mod={MOD} label="Unit" value={f.unit} onChangeText={set("unit")} /></View>
      </Row>
      <Field mod={MOD} label="Patient" value={f.pt} onChangeText={set("pt")} />
      <Select mod={MOD} label="Call type" value={f.type} options={CALL_TYPES} onChange={set("type")} />
      <Field mod={MOD} label="The problem in one line" value={f.concern} onChangeText={set("concern")} />
      {!unsafe ? <Field mod={MOD} label="Vital signs" value={f.vitals} onChangeText={set("vitals")} /> : null}
      <Field mod={MOD} label="Background" value={f.bg} onChangeText={set("bg")} multiline />
      <Field mod={MOD} label="Assessment" value={f.assess} onChangeText={set("assess")} multiline />
      <Field mod={MOD} label="Recommendation / request" value={f.rec} onChangeText={set("rec")} multiline />

      <Row style={{ marginTop: 4 }}>
        <Txt v="eyebrow" style={{ flex: 1 }}>Your script</Txt>
        <CopyButton mod={MOD} text={script} label="Copy SBAR Script" />
      </Row>
      <View style={{ backgroundColor: t.dark ? "#05070f" : "#0d1324", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: t.dark ? t.c.line : "#0d1324" }}>
        <Txt v="mono" color="#e7ecf7" selectable>{script}</Txt>
      </View>
    </View>
  );
}

const TYPES = ["Charge shift", "Preceptor hours", "EBP / UPC project", "Committee / shared governance", "Certification", "Education / CE"];
const TYPE_ICON = { "Charge shift": "LayoutGrid", "Preceptor hours": "Users", "EBP / UPC project": "FlaskConical", "Committee / shared governance": "Landmark", "Certification": "BadgeCheck", "Education / CE": "GraduationCap" };
function Ladder() {
  const { state, dispatch } = useApp(); const t = useTheme(MOD);
  const [e, setE] = useState({ type: "Charge shift", date: todayKey(), hours: "12", note: "" });
  const [show, setShow] = useState(false);
  const totals = TYPES.map((ty) => [ty, state.ladder.filter((x) => x.type === ty).reduce((n, x) => n + (+x.hours || 0), 0), state.ladder.filter((x) => x.type === ty).length]);
  const dossier = `CLINICAL LADDER EVIDENCE SUMMARY
Prepared ${new Date().toLocaleDateString()}

TOTALS
${totals.filter(([, , c]) => c).map(([ty, h, c]) => `• ${ty}: ${c} entr${c === 1 ? "y" : "ies"}, ${h} hours`).join("\n")}

LOG
${state.ladder.map((x) => `${x.date} | ${x.type} | ${x.hours} h | ${x.note}`).join("\n")}

IMPACT STATEMENT (edit before submitting)
Over this review period I served as charge nurse, precepted new staff, and contributed to unit quality work. I request advancement to the next clinical ladder level.`;
  const add = () => { dispatch({ type: "addLadder", entry: { ...e, hours: num(e.hours), id: uid() } }); buzz(); setE({ ...e, note: "" }); };
  const share = async () => { try { await Share.share({ message: dossier, title: "Clinical Ladder Dossier" }); } catch (err) {} };

  return (
    <View style={{ gap: 14 }}>
      <View style={{ backgroundColor: t.c.sunk, borderRadius: 16, padding: 12, gap: 10 }}>
        <Select mod={MOD} label="Type" value={e.type} options={TYPES} onChange={(v) => setE({ ...e, type: v })} />
        <Row gap={10} center={false}>
          <View style={{ flex: 1.4 }}><DateField mod={MOD} label="Date" value={e.date} onChange={(v) => setE({ ...e, date: v })} /></View>
          <View style={{ flex: 1 }}><Field mod={MOD} label="Hours" value={e.hours} onChangeText={(v) => setE({ ...e, hours: v.replace(/[^\d.]/g, "") })} keyboardType="decimal-pad" /></View>
        </Row>
        <Field mod={MOD} label="Notes" value={e.note} onChangeText={(v) => setE({ ...e, note: v })} placeholder="e.g. Charge, 6 admissions, managed rapid response" />
        <Btn mod={MOD} icon="Plus" title="Log Entry" full onPress={add} disabled={!/^\d{4}-\d{2}-\d{2}$/.test(e.date)} />
      </View>

      <Grid basis={140} gap={8}>
        {totals.map(([ty, h, c]) => (
          <View key={ty} style={{ backgroundColor: t.c.sunk, borderRadius: 14, padding: 12, gap: 2 }}>
            <Row gap={6}><Icon name={TYPE_ICON[ty]} size={13} color={t.tint} /><Txt v="eyebrow" style={{ flex: 1 }} numberOfLines={2}>{ty}</Txt></Row>
            <Txt v="h3" style={{ fontFamily: FONTS.monoBold }}>{h} h</Txt>
            <Txt v="tiny" muted>{c} {c === 1 ? "entry" : "entries"}</Txt>
          </View>
        ))}
      </Grid>

      <View style={{ gap: 8 }}>
        {state.ladder.length === 0 ? <Txt v="small" muted>No entries yet. Log your first charge shift, precepting hours or project above.</Txt> : null}
        {state.ladder.map((x) => (
          <View key={x.id} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: t.c.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: t.c.line }}>
            <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: t.soft, alignItems: "center", justifyContent: "center" }}><Icon name={TYPE_ICON[x.type] || "ListChecks"} size={16} color={t.tint} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Row gap={6} wrap><Txt v="smallB">{x.type}</Txt><Chip text={`${x.hours} h`} tone="acc" /></Row>
              <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }}>{fmtDate(x.date)}</Txt>
              {x.note ? <Txt v="small">{x.note}</Txt> : null}
            </View>
            <Pressable onPress={() => { tap(); dispatch({ type: "delLadder", id: x.id }); }} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove entry" style={{ padding: 6 }}>
              <Icon name="Trash2" size={15} color={t.c.crit} />
            </Pressable>
          </View>
        ))}
      </View>

      <Btn mod={MOD} icon="FileText" title="Export Clinical Ladder Dossier" onPress={() => setShow(true)} />
      <Sheet mod={MOD} visible={show} onClose={() => setShow(false)} title="Clinical Ladder Dossier">
        <Txt v="small" muted>Copy this into an email or your HR portal. Edit the impact statement first.</Txt>
        <View style={{ backgroundColor: t.c.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: t.c.line }}>
          <Txt v="mono" selectable>{dossier}</Txt>
        </View>
        <Row gap={8} wrap>
          <CopyButton mod={MOD} text={dossier} label="Copy Dossier" />
          <Btn mod={MOD} small kind="secondary" icon="Share2" title="Share" onPress={share} />
        </Row>
      </Sheet>
    </View>
  );
}

export function ChargeCommand() {
  const [tool, setTool] = useState("acuity");
  return (
    <Card mod={MOD} style={{ gap: 14 }}>
      <Seg mod={MOD} value={tool} onChange={setTool} options={[{ id: "acuity", label: "Acuity & Assignments", icon: "Calculator" }, { id: "sbar", label: "SBAR Call Script", icon: "PhoneCall" }, { id: "ladder", label: "Clinical Ladder Log", icon: "ListChecks" }]} />
      {tool === "acuity" ? <AcuityCalc /> : null}
      {tool === "sbar" ? <SbarGen /> : null}
      {tool === "ladder" ? <Ladder /> : null}
    </Card>
  );
}
