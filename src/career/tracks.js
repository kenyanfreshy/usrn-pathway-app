// Career tracks (CCRN, CRNA, educator, UR) and Magnet & EBP.
import React from "react";
import { View } from "react-native";
import { Txt, Row, Card, Chip, Accordion, Check, Bar } from "../ui";
import { useTheme } from "../theme";
import { useApp } from "../state";
import { CAREERS } from "../data/content";
import { MOD, Grid, IconHead, RichBullets } from "./common";

const TRACK_ICON = { ccrn: "HeartPulse", crna: "Syringe", edu: "GraduationCap", ur: "ClipboardList" };

export function CareerTracks() {
  const { state, dispatch } = useApp(); const t = useTheme(MOD);
  return (
    <View style={{ gap: 12 }}>
      {CAREERS.map((c) => {
        const n = c.items.filter((_, i) => state.careers[c.id + i]).length;
        return (
          <Accordion key={c.id} mod={MOD} title={c.title} defaultOpen={c.id === "ccrn"}
            meta={<Chip text={`${n}/${c.items.length}`} tone={n === c.items.length ? "ok" : "mute"} icon={TRACK_ICON[c.id]} />}>
            <Bar mod={MOD} pct={n / c.items.length} height={6} />
            {c.items.map((it, i) => (
              <Check key={i} mod={MOD} checked={!!state.careers[c.id + i]} onToggle={() => dispatch({ type: "career", id: c.id + i })} label={it} />
            ))}
          </Accordion>
        );
      })}
      <Txt v="tiny" muted>Requirements reflect AACN, COA and NLN published criteria as generally known; confirm current details with each organization.</Txt>
    </View>
  );
}

const METRICS = [["CLABSI", "Central line–associated bloodstream infection", "Daily CHG bathing, dressing integrity, scrub the hub, daily line-necessity review"], ["CAUTI", "Catheter-associated urinary tract infection", "Nurse-driven removal protocol, secure catheter, bag below bladder"], ["HAPI", "Hospital-acquired pressure injury", "q2h turns, skin checks on admission, moisture management, heel offloading"]];

export function MagnetEbp() {
  const t = useTheme(MOD);
  return (
    <Grid basis={280} gap={12}>
      <Card mod={MOD}>
        <IconHead icon="Landmark">Shared governance</IconHead>
        <Txt v="small">Magnet hospitals, and many others, give bedside nurses a formal voice through unit practice councils. Joining one is the fastest way to be seen by leadership, and it usually counts toward a clinical ladder or professional development program.</Txt>
        <RichBullets v="small" items={["Bring one measurable problem from your shift", "Volunteer to collect audit data", "Present results at the council meeting"]} />
      </Card>
      <Card mod={MOD}>
        <IconHead icon="Activity">Quality metrics you can move</IconHead>
        {METRICS.map(([k, n, d]) => (
          <View key={k} style={{ backgroundColor: t.c.sunk, borderRadius: 14, padding: 12, gap: 6 }}>
            <Row gap={8} wrap><Chip text={k} tone="acc2" /><Txt v="smallB" style={{ flexShrink: 1 }}>{n}</Txt></Row>
            <Txt v="small" muted>{d}</Txt>
          </View>
        ))}
      </Card>
      <Card mod={MOD}>
        <IconHead icon="FlaskConical">Turn an idea into an EBP project</IconHead>
        <RichBullets v="small" numbered items={["Write a PICO question (Patient, Intervention, Comparison, Outcome)", "Search CINAHL / PubMed with your hospital librarian", "Pilot on your unit for 4–8 weeks with a baseline", "Report outcomes at council and log the hours in your ladder"]} />
      </Card>
    </Grid>
  );
}
