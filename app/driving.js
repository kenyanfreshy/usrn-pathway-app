// Before you travel · Driving: why to learn at home, prep checklist and licensing notes.
import React from "react";
import { View } from "react-native";
import { Screen, Hero, Card, Row, Txt, Icon, IconTile, Bar, Check, Note, Chip, Bullets, Grid } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme } from "../src/theme";
import { useApp } from "../src/state";
import { DRIVE_WHY, DRIVE_PREP } from "../src/data/content";
import { destId, destOf, lifeOf } from "../src/data/global";
import { DestPill } from "../src/dest";
import { SourcesBlock } from "../src/career/country";

const MOD = "drive";

export default function Driving() {
  const t = useTheme(MOD);
  const { state, dispatch } = useApp();
  const d = state.drive || {};
  const dest = destId(state); const US = dest === "US"; const info = destOf(dest); const life = lifeOf(dest);
  const left = life && life.driving.side === "left";
  // Same checklist everywhere, with the road-side item flipped for left-driving countries.
  const PREP = DRIVE_PREP.map((x) => (left && /practice right-side driving/.test(x)
    ? "If your country drives on the right, practice left-side driving (and roundabouts) with an instructor before you go"
    : x.replace("destination state's or province's", US ? "destination state's" : dest === "CA" ? "destination province's" : "destination state's or region's")));
  const WHY = DRIVE_WHY.map(([ic, title, body]) => [ic, title, body.replace("U.S. and Canadian public transit is limited", `public transit in ${info.name} is limited`)]);
  const done = PREP.filter((_, i) => d[i]).length;
  return (
    <Screen mod={MOD}>
      <BackRow title="Driving" mod={MOD} />
      <Hero mod={MOD} icon="Car" eyebrow="Before you travel" title="Learn to Drive at Home First"
        sub={US ? "In most of the U.S. and Canada, getting to work means driving yourself. Learning before you travel saves money, stress and favors once you land." : `${life.driving.intro} Learning before you travel saves money, stress and favors once you land.`}
        stats={[["Checklist", done + " / " + PREP.length], US ? ["Best time", "While you wait for your visa"] : ["Drives on the", left ? "Left" : "Right"]]} />
      <DestPill mod={MOD} />

      <Grid min={260} gap={12}>
        {WHY.map(([ic, title, body]) => (
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
          <Txt v="h2">Get Road-Ready Before Your Flight</Txt>
        </View>
        <Row gap={12}>
          <View style={{ flex: 1 }}><Bar mod={MOD} pct={done / PREP.length} /></View>
          <Txt v="mono">{done}/{PREP.length}</Txt>
        </Row>
        {done === PREP.length ? <Chip mod={MOD} tone="ok" icon="CheckCircle2" text="Road-ready" /> : null}
        {PREP.map((label, i) => <Check key={i} mod={MOD} checked={!!d[i]} strike label={label} onToggle={() => dispatch({ type: "drive", id: i })} />)}
      </Card>

      {(US ? [["In the U.S.", [
        "Each state sets its own rules. Many accept a foreign license plus an IDP only for a short time after you become a resident.",
        "Getting a state license usually means a written knowledge test and a road test. Some states require you to bring an insured car to the road test.",
        "Your foreign driving record can help: some insurers consider it, which can lower your first premium.",
      ]], ["In Canada", [
        "Provinces handle licensing. Some exchange licenses from certain countries directly.",
        "Others use graduated licensing, where an official letter proving your driving experience can let you skip waiting stages.",
        "Winter driving on snow and ice is its own skill. Plan a lesson before your first winter.",
      ]]] : [[`In ${info.name}`, life.driving.points]]).map(([h, items]) => (
        <Card key={h} mod={MOD} style={{ backgroundColor: t.soft, borderColor: t.soft2 }}>
          <Row gap={8}>
            <Icon name="Flag" size={18} color={t.tint} />
            <Txt v="h3">{h}</Txt>
          </Row>
          <Bullets items={items} />
        </Card>
      ))}

      <Note mod={MOD} tone="acc" icon="Lightbulb">{US ? "Rules that surprise new arrivals: turning right on a red light (where allowed), four-way stops, and stopping for a school bus with its red lights flashing — even on the other side of the road in most places." : "Rules that surprise new arrivals: " + life.driving.rules}</Note>
      <Txt v="tiny" muted>Licensing rules vary by state and province and change over time. Check your destination's motor vehicle agency before you travel.</Txt>
      {!US ? <SourcesBlock dest={dest} mod={MOD} /> : null}
    </Screen>
  );
}
