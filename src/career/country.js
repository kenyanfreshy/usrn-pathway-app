// Career & wealth sections for Canada, Australia and New Zealand (the U.S. keeps its own sections).
// Content comes from src/data/countries/*-life.json (researched, with sources).
import React from "react";
import { View, Pressable, Linking } from "react-native";
import { Txt, Row, Card, Chip, Accordion, Check, Bar, Note, Bullets, Icon, tap } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp, careersOf, creditList, creditKey, insureListOf, insureKey } from "../state";
import { lifeOf, destId, destOf } from "../data/global";
import { fmtDate } from "../util";
import { MOD, Grid, IconHead } from "./common";

const TRACK_ICONS = ["HeartPulse", "Stethoscope", "GraduationCap", "Users"];
const MONEY_ICONS = ["IdCard", "Receipt", "PiggyBank", "Wallet", "Landmark", "ShieldCheck", "Calculator"];
const HEALTH_ICONS = ["HeartPulse", "CalendarClock", "Shield", "Umbrella", "Hospital", "Briefcase", "Home", "Car"];

function InfoCards({ items, icons }) {
  return (
    <Grid basis={260} gap={12}>
      {items.map(([h, d], k) => (
        <Card key={h} mod={MOD} style={{ flexGrow: 1 }}>
          <IconHead icon={icons[k % icons.length]}>{h}</IconHead>
          <Txt v="small">{d}</Txt>
        </Card>
      ))}
    </Grid>
  );
}

function Checked({ dest }) {
  const l = lifeOf(dest);
  return <Txt v="tiny" muted>Checked {fmtDate(l.checked)} against official sources for {destOf(dest).name}. Rules and rates change; confirm before you act.</Txt>;
}

/** Career tracks for the destination (checklists). */
export function CountryTracks() {
  const { state, dispatch } = useApp();
  const list = careersOf(state);
  return (
    <View style={{ gap: 12 }}>
      {list.map((c, k) => {
        const n = c.items.filter((_, i) => state.careers[c.id + i]).length;
        return (
          <Accordion key={c.id} mod={MOD} title={c.title} defaultOpen={k === 0}
            meta={<Chip text={`${n}/${c.items.length}`} tone={n === c.items.length ? "ok" : "mute"} icon={TRACK_ICONS[k % TRACK_ICONS.length]} />}>
            <Bar mod={MOD} pct={n / c.items.length} height={6} />
            {c.items.map((it, i) => (
              <Check key={i} mod={MOD} checked={!!state.careers[c.id + i]} onToggle={() => dispatch({ type: "career", id: c.id + i })} label={it} />
            ))}
          </Accordion>
        );
      })}
      <Checked dest={destId(state)} />
    </View>
  );
}

/** Credit checklist and how pay works. */
export function CountryWealth() {
  const { state, dispatch } = useApp(); const t = useTheme(MOD);
  const dest = destId(state); const l = lifeOf(dest); const CREDIT = creditList(state);
  const done = CREDIT.filter((_, i) => state.credit[creditKey(state, i)]).length;
  return (
    <View style={{ gap: 14 }}>
      <Note mod={MOD} tone="warn" icon="AlertTriangle">General education, not personalized financial advice. Talk to a licensed advisor or tax professional for your situation.</Note>
      <Card mod={MOD}>
        <IconHead icon="CreditCard">Build credit in {destOf(dest).name}</IconHead>
        <Txt v="small" muted>Your credit history from home usually doesn't follow you, so start early.</Txt>
        <Row gap={10}>
          <View style={{ flex: 1 }}><Bar mod={MOD} pct={done / CREDIT.length} /></View>
          <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{done}/{CREDIT.length}</Txt>
        </Row>
        {CREDIT.map((c, i) => (
          <Row key={i} gap={8} center={false}>
            <Txt v="mono" muted style={{ width: 16, marginTop: 6 }}>{i + 1}</Txt>
            <View style={{ flex: 1 }}><Check mod={MOD} checked={!!state.credit[creditKey(state, i)]} onToggle={() => dispatch({ type: "credit", id: creditKey(state, i) })} label={c} /></View>
          </Row>
        ))}
      </Card>
      <View style={{ gap: 4 }}>
        <Txt v="eyebrow">How nurses are paid</Txt>
        <Txt v="h2">Pay in {destOf(dest).name}</Txt>
      </View>
      <InfoCards items={l.pay} icons={["Scale", "Moon", "TrendingUp", "Receipt"]} />
      <Checked dest={dest} />
    </View>
  );
}

/** Tax number, withholding, retirement savings and nurse-specific benefits. */
export function CountryMoney() {
  const { state } = useApp(); const dest = destId(state); const l = lifeOf(dest);
  return (
    <View style={{ gap: 14 }}>
      <Note mod={MOD} tone="warn" icon="AlertTriangle">General education, not tax advice. Your tax office and a registered tax agent have the final word.</Note>
      <View style={{ gap: 4 }}>
        <Txt v="eyebrow">Tax and retirement</Txt>
        <Txt v="h2">Money basics for {destOf(dest).name}</Txt>
      </View>
      <InfoCards items={l.money} icons={MONEY_ICONS} />
      <Checked dest={dest} />
    </View>
  );
}

/** Health system, insurance and the new-arrival checklist. */
export function CountryInsurance() {
  const { state, dispatch } = useApp(); const dest = destId(state); const l = lifeOf(dest);
  const list = insureListOf(state); const n = list.filter((_, i) => state.careers[insureKey(state, i)]).length;
  return (
    <View style={{ gap: 14 }}>
      <Note mod={MOD} tone="warn" icon="AlertTriangle">General education, not insurance advice. Your employer's benefits guide and a licensed broker have the final word.</Note>
      <View style={{ gap: 4 }}>
        <Txt v="eyebrow">Health cover and insurance</Txt>
        <Txt v="h2">Staying covered in {destOf(dest).name}</Txt>
      </View>
      <InfoCards items={l.health} icons={HEALTH_ICONS} />
      <Card mod={MOD}>
        <Txt v="h3">New-arrival checklist</Txt>
        <Row gap={10}>
          <View style={{ flex: 1 }}><Bar mod={MOD} pct={n / list.length} /></View>
          <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{n}/{list.length}</Txt>
        </Row>
        {list.map((x, i) => <Check key={i} mod={MOD} checked={!!state.careers[insureKey(state, i)]} onToggle={() => dispatch({ type: "career", id: insureKey(state, i) })} label={x} />)}
      </Card>
      <Checked dest={dest} />
    </View>
  );
}

/** Sources and open questions for a destination, shown at the bottom of country screens. */
export function SourcesBlock({ dest, mod = MOD }) {
  const t = useTheme(mod); const l = lifeOf(dest);
  if (!l) return null;
  return (
    <>
      {l.uncertain && l.uncertain.length ? (
        <Accordion mod={mod} title="What we couldn't confirm" meta={<Icon name="HelpCircle" size={16} color={t.c.muted} />}>
          <Bullets items={l.uncertain} />
        </Accordion>
      ) : null}
      {l.sources && l.sources.length ? (
        <Accordion mod={mod} title={`Sources (${l.sources.length})`} meta={<Icon name="BookOpen" size={16} color={t.c.muted} />}>
          <View style={{ gap: 8 }}>
            {l.sources.map(([label, url]) => (
              <Pressable key={url + label} onPress={() => { tap(); Linking.openURL(url).catch(() => {}); }} accessibilityRole="link">
                <Row gap={6} center={false}><View style={{ paddingTop: 2 }}><Icon name="ExternalLink" size={13} color={t.tint} /></View><Txt v="small" color={t.tint} style={{ flex: 1 }}>{label}</Txt></Row>
              </Pressable>
            ))}
          </View>
        </Accordion>
      ) : null}
    </>
  );
}
