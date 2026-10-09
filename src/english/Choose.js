// "Which test should I take?" — a short questionnaire that weighs the nurse's situation, plus an indicative
// IELTS ⟷ OET score comparison. Advice only; acceptance comes from the verified rules.
import React, { useState } from "react";
import { View } from "react-native";
import { Card, Row, Txt, Btn, Chip, Note, Icon, Seg, Bullets, Grid } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp } from "../state";
import { destOf } from "../data/global";
import { jurisFor, RULES_META } from "./rules";

const QS = [
  { id: "clin", q: "Have you worked at the bedside in the last 2 years?", opts: [["yes", "Yes"], ["no", "No"]] },
  { id: "academic", q: "How comfortable are you with academic essays and describing charts?", opts: [["high", "Comfortable"], ["low", "Not very"]] },
  { id: "past", q: "Have you taken an English test before?", opts: [["none", "No"], ["oet", "OET"], ["ielts", "IELTS"]] },
  { id: "weak", q: "Which skill worries you most?", opts: [["W", "Writing"], ["S", "Speaking"], ["R", "Reading"], ["L", "Listening"]] },
];

function recommend(a, j) {
  const accepts = (name) => (RULES_META.decision.acceptance[j.id] || []).some((x) => x.startsWith(name));
  const oetOk = accepts("OET") && !!j.oet, ieltsOk = accepts("IELTS") && !!j.ielts;
  if (!oetOk && ieltsOk) return { pick: "IELTS Academic", why: [`${j.name} doesn't accept OET, so IELTS Academic (or another accepted test) is the way.`] };
  if (oetOk && !ieltsOk) return { pick: "OET Nursing", why: [`${j.name} doesn't accept IELTS here, so OET is the way.`] };
  let oet = 0, ielts = 0; const why = [];
  if (a.clin === "yes") { oet += 2; why.push("Recent bedside work helps on OET: the writing task is a nursing letter and speaking is nurse–patient role-play."); }
  if (a.clin === "no") { ielts += 1; why.push("Away from practice for a while? IELTS uses general academic topics, so no clinical knowledge is needed."); }
  if (a.academic === "high") { ielts += 2; why.push("You're comfortable with essays and charts, which is exactly what IELTS Writing tests."); }
  if (a.academic === "low") { oet += 2; why.push("OET has no essays or chart descriptions; writing is a practical nursing letter."); }
  if (a.past === "oet") { oet += 1; why.push("You already know the OET format, which saves preparation time."); }
  if (a.past === "ielts") { ielts += 1; why.push("You already know the IELTS format, which saves preparation time."); }
  if (a.weak === "S") { oet += 1; why.push("If speaking worries you, OET role-plays are about familiar situations: talking with a patient."); }
  if (a.weak === "W") why.push("Writing is the hardest part for many nurses on both tests. Practice timed writing either way.");
  return { pick: oet >= ielts ? "OET Nursing" : "IELTS Academic", why };
}

export function Choose({ mod }) {
  const t = useTheme(mod); const { state } = useApp(); const j = jurisFor(state);
  const [a, setA] = useState({});
  const done = QS.every((q) => a[q.id]);
  const rec = done ? recommend(a, j) : null;
  const C = RULES_META.converter;
  return (
    <View style={{ gap: 12 }}>
      <Card mod={mod} style={{ gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Txt v="eyebrow">OET or IELTS?</Txt>
          <Txt v="h3">Which test fits you · {destOf(j.dest).flag} {j.name}</Txt>
        </View>
        {QS.map((q) => (
          <View key={q.id} style={{ gap: 6 }}>
            <Txt v="smallB">{q.q}</Txt>
            <Seg mod={mod} value={a[q.id] || ""} onChange={(v) => setA({ ...a, [q.id]: v })} options={q.opts.map(([id, label]) => ({ id, label }))} />
          </View>
        ))}
        {rec ? (
          <View style={{ padding: 14, borderRadius: 14, backgroundColor: t.soft, gap: 8 }}>
            <Txt v="eyebrow" color={t.tint}>Suggested</Txt>
            <Txt v="h2" color={t.tint}>{rec.pick}</Txt>
            <Bullets items={rec.why} />
          </View>
        ) : <Txt v="tiny" muted>Answer all four to see a suggestion.</Txt>}
      </Card>
      <Grid min={260} gap={12}>
        <Card mod={mod} style={{ gap: 8, flexGrow: 1 }}>
          <Txt v="h3">Why nurses choose OET</Txt>
          <Bullets items={RULES_META.decision.oetGood} />
        </Card>
        <Card mod={mod} style={{ gap: 8, flexGrow: 1 }}>
          <Txt v="h3">Why nurses choose IELTS</Txt>
          <Bullets items={RULES_META.decision.ieltsGood} />
        </Card>
      </Grid>
      <Card mod={mod} style={{ gap: 8 }}>
        <Txt v="h3">Accepted at {j.name}</Txt>
        <Row wrap gap={6}>{(RULES_META.decision.acceptance[j.id] || []).map((x) => <Chip key={x} mod={mod} tone="acc" text={x} />)}</Row>
      </Card>
      {C ? (
        <Card mod={mod} style={{ gap: 10 }}>
          <Txt v="h3">IELTS ⟷ OET, roughly</Txt>
          <Note mod={mod} tone="warn" icon="AlertTriangle">{C.caution}</Note>
          <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: t.c.line }}>
            <Row style={{ backgroundColor: t.soft }}><Txt v="smallB" style={{ flex: 1, padding: 9 }}>IELTS band</Txt><Txt v="smallB" style={{ flex: 1, padding: 9 }}>OET score (grade)</Txt></Row>
            {C.rows.map((r, k) => (
              <Row key={r.ielts} style={{ backgroundColor: k % 2 ? t.c.sunk : t.c.surface }}>
                <Txt v="mono" style={{ flex: 1, padding: 9, fontFamily: FONTS.monoBold }}>{r.ielts}</Txt>
                <Txt v="mono" style={{ flex: 1, padding: 9 }}>{r.oet}</Txt>
              </Row>
            ))}
          </View>
          <Txt v="tiny" muted>Source: {C.source}</Txt>
        </Card>
      ) : null}
    </View>
  );
}
