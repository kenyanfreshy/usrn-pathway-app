// Before you travel · Driving: why to learn at home, prep checklist and licensing notes.
import React from "react";
import { View } from "react-native";
import { Screen, Hero, Card, Row, Txt, Icon, IconTile, Bar, Check, Note, Chip, Bullets, Grid } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme } from "../src/theme";
import { useApp } from "../src/state";
import { DRIVE_WHY, DRIVE_PREP } from "../src/data/content";

const MOD = "drive";

export default function Driving() {
  const t = useTheme(MOD);
  const { state, dispatch } = useApp();
  const d = state.drive || {}; const done = DRIVE_PREP.filter((_, i) => d[i]).length;
  return (
    <Screen mod={MOD}>
      <BackRow title="Driving" mod={MOD} />
      <Hero mod={MOD} icon="Car" eyebrow="Before you travel" title="Learn to drive at home first"
        sub="In most of the U.S. and Canada, getting to work means driving yourself. Learning before you travel saves money, stress and favors once you land."
        stats={[["Checklist", done + " / " + DRIVE_PREP.length], ["Best time", "While you wait for your visa"]]} />

      <Grid min={260} gap={12}>
        {DRIVE_WHY.map(([ic, title, body]) => (
          <Card key={title} mod={MOD} style={{ flexGrow: 1 }}>
            <IconTile mod={MOD} icon={ic} size={40} />
            <Txt v="h3">{title}</Txt>
            <Txt v="small" muted>{body}</Txt>
          </Card>
        ))}
      </Grid>

      <Card mod={MOD} accent style={{ gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Txt v="eyebrow">Your prep checklist</Txt>
          <Txt v="h2">Get road-ready before your flight</Txt>
        </View>
        <Row gap={12}>
          <View style={{ flex: 1 }}><Bar mod={MOD} pct={done / DRIVE_PREP.length} /></View>
          <Txt v="mono">{done}/{DRIVE_PREP.length}</Txt>
        </Row>
        {done === DRIVE_PREP.length ? <Chip mod={MOD} tone="ok" icon="CheckCircle2" text="Road-ready" /> : null}
        {DRIVE_PREP.map((label, i) => <Check key={i} mod={MOD} checked={!!d[i]} strike label={label} onToggle={() => dispatch({ type: "drive", id: i })} />)}
      </Card>

      {[["In the U.S.", [
        "Each state sets its own rules. Many accept a foreign license plus an IDP only for a short time after you become a resident.",
        "Getting a state license usually means a written knowledge test and a road test. Some states require you to bring an insured car to the road test.",
        "Your foreign driving record can help: some insurers consider it, which can lower your first premium.",
      ]], ["In Canada", [
        "Provinces handle licensing. Some exchange licenses from certain countries directly.",
        "Others use graduated licensing, where an official letter proving your driving experience can let you skip waiting stages.",
        "Winter driving on snow and ice is its own skill. Plan a lesson before your first winter.",
      ]]].map(([h, items]) => (
        <Card key={h} mod={MOD} style={{ backgroundColor: t.soft, borderColor: t.soft2 }}>
          <Row gap={8}>
            <Icon name="Flag" size={18} color={t.tint} />
            <Txt v="h3">{h}</Txt>
          </Row>
          <Bullets items={items} />
        </Card>
      ))}

      <Note mod={MOD} tone="acc" icon="Lightbulb">Rules that surprise new arrivals: turning right on a red light (where allowed), four-way stops, and stopping for a school bus with its red lights flashing — even on the other side of the road in most places.</Note>
      <Txt v="tiny" muted>Licensing rules vary by state and province and change over time. Check your destination's motor vehicle agency before you travel.</Txt>
    </Screen>
  );
}
