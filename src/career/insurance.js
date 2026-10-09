// Insurance hub: health, life, disability, car, home & mortgage, plus the insurance checklist.
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Txt, Row, Card, Note, Bar, Check, Field, Icon, Grad, tap } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp } from "../state";
import { HEALTH_TERMS, PLAN_FIELDS, INSURE_LIST } from "../data/content";
import { money, num, planCost } from "../util";
import { MOD, H, Grid, Tile, RichBullets, NumField, FieldGrid, GradTile, BarRow, useTone } from "./common";
import { AutoSection, HomeSection } from "./property";

const SECTIONS = [["health", "HeartPulse", "Health insurance", "One hospital stay can cost more than a year's pay without it."], ["life", "Umbrella", "Life insurance", "Replaces your income for the people who depend on it — here and at home."], ["disability", "LifeBuoy", "Disability insurance", "Protects your paycheck if an injury or illness keeps you off the floor."], ["auto", "Car", "Car insurance", "Required to drive in nearly every state — and your shield after a crash."], ["home", "Home", "Home & mortgage", "PMI, homeowners and renters cover — who each one actually protects."]];

function PlanEditor({ p, set, tone }) {
  const t = useTheme(MOD); const [fg] = useTone(tone);
  return (
    <View style={{ backgroundColor: t.c.sunk, borderRadius: 18, padding: 14, gap: 10, borderTopWidth: 4, borderTopColor: fg }}>
      <Field mod={MOD} label="Plan name" value={p.name} onChangeText={(v) => set({ ...p, name: v })} />
      <FieldGrid>{PLAN_FIELDS.map(([k, l]) => <NumField key={k} label={l} value={p[k]} onChange={(v) => set({ ...p, [k]: v })} />)}</FieldGrid>
    </View>
  );
}

function HealthCompare() {
  const t = useTheme(MOD);
  const [a, setA] = useState({ name: "PPO", prem: "120", ded: "1000", co: "20", oop: "4000", hsa: "0" });
  const [b, setB] = useState({ name: "HDHP + HSA", prem: "45", ded: "3000", co: "20", oop: "6000", hsa: "750" });
  const scen = [["Healthy year", 600, "Checkups, a few prescriptions"], ["Moderate year", 6000, "An ER visit and imaging"], ["Big year", 60000, "Surgery or a hospital stay"]];
  const toneOf = { a: [t.tint, t.soft], b: [t.tint2, t.soft2] };
  return (
    <Card mod={MOD}>
      <H eyebrow="Open enrollment helper" sub="Enter the two plans from your benefits guide. Totals are your premiums plus your share of care, minus any employer HSA money. Copays aren't modeled.">Which plan costs less for you?</H>
      <Grid basis={260}>
        <PlanEditor p={a} set={setA} tone="teal" />
        <PlanEditor p={b} set={setB} tone="indigo" />
      </Grid>
      <Grid basis={200}>
        {scen.map(([ti, bills, d]) => {
          const ca = planCost(a, bills), cb = planCost(b, bills); const win = ca === cb ? null : ca < cb ? "a" : "b";
          return (
            <View key={ti} style={{ flex: 1, backgroundColor: t.c.surface, borderRadius: 16, padding: 12, gap: 6, borderWidth: 1, borderColor: t.c.line }}>
              <Txt v="h3">{ti}</Txt>
              <Txt v="tiny" muted>{d} · {money(bills)} in bills</Txt>
              {[["a", a, ca], ["b", b, cb]].map(([k, p, c]) => (
                <Row key={k} gap={8} style={{ padding: 8, borderRadius: 12, backgroundColor: win === k ? toneOf[k][1] : "transparent" }}>
                  <Txt v="smallB" style={{ flex: 1 }} numberOfLines={1}>{p.name}</Txt>
                  <Txt v="mono" color={win === k ? toneOf[k][0] : t.c.ink} style={{ fontFamily: FONTS.monoBold }}>{money(c)}{win === k ? " ✓" : ""}</Txt>
                </Row>
              ))}
              {win ? <Txt v="tiny" muted>Saves {money(Math.abs(ca - cb))}</Txt> : null}
            </View>
          );
        })}
      </Grid>
      <Txt v="tiny" muted>2026 limits: an HSA-eligible plan needs a deductible of at least $1,700 (self) / $3,400 (family), with an out-of-pocket max up to $8,500 / $17,000. No ACA-compliant plan can exceed $10,600 / $21,200.</Txt>
    </Card>
  );
}

const LIFE_FIELDS = [["debt", "Debts (loans, cards) $"], ["income", "Annual income $"], ["years", "Years to replace"], ["mortgage", "Mortgage balance $"], ["edu", "Education fund $"], ["family", "Sent home per year $"], ["famYears", "Years of support"], ["existing", "Existing life cover $"], ["savings", "Savings & investments $"]];
function LifeCalc() {
  const t = useTheme(MOD);
  const [raw, setRaw] = useState({ debt: "18000", income: "85000", years: "10", mortgage: "0", edu: "60000", family: "6000", famYears: "10", existing: "85000", savings: "15000" });
  const v = Object.fromEntries(Object.entries(raw).map(([k, x]) => [k, num(x)]));
  const parts = [["Debts", v.debt], ["Income replacement", v.income * v.years], ["Mortgage", v.mortgage], ["Children's education", v.edu], ["Support for family abroad", v.family * v.famYears]];
  const need = parts.reduce((n, x) => n + x[1], 0);
  const gap = Math.max(0, need - v.existing - v.savings);
  const rec = Math.ceil(gap / 50000) * 50000;
  return (
    <Card mod={MOD}>
      <H eyebrow="How much life insurance?" sub="Uses the DIME method — debt, income, mortgage, education — plus the money you send home.">Coverage needs calculator</H>
      <FieldGrid>{LIFE_FIELDS.map(([k, l]) => <NumField key={k} label={l} value={raw[k]} onChange={(x) => setRaw({ ...raw, [k]: x })} />)}</FieldGrid>
      <View style={{ backgroundColor: t.c.sunk, borderRadius: 18, padding: 14, gap: 10 }}>
        {parts.map(([k, x]) => <BarRow key={k} label={k} value={x} pct={x / Math.max(need, 1)} />)}
        <View style={{ height: 1, backgroundColor: t.c.line }} />
        <Row><Txt v="small" muted style={{ flex: 1 }}>Total need</Txt><Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{money(need)}</Txt></Row>
        <Row><Txt v="small" muted style={{ flex: 1 }}>Minus existing cover & savings</Txt><Txt v="mono">−{money(v.existing + v.savings)}</Txt></Row>
        <GradTile big label="Suggested term coverage" value={rec ? money(rec) : "Covered"}
          sub={rec ? "Rounded up to the nearest $50,000. A term length that lasts until your youngest is independent is common." : "Your current cover and savings meet this estimate."} />
      </View>
    </Card>
  );
}

function Health() {
  const t = useTheme(MOD);
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD}>
        <H>Why it matters for you</H>
        <RichBullets items={[
          "U.S. care is expensive. Without insurance, an ER visit or a short admission can leave thousands of dollars in medical debt — which can follow your credit for years.",
          "Nursing is physical work around illness. Insurance covers the back strain, infections and ordinary illnesses that happen **outside** work. Injuries and exposures **on the job**, like a needlestick, go through workers' compensation — report them the same shift.",
          "Preventive care (checkups, most vaccines, screenings) is free on in-network ACA-compliant plans, so use it.",
          "Hospitals often give staff richer plans or lower costs at their own facilities — check your benefits guide for an employee tier.",
        ]} />
        <Grid basis={140} gap={8}>
          {HEALTH_TERMS.map(([k, d]) => <Tile key={k} title={k} desc={d} titleTone="teal" style={{ flex: 1 }} />)}
        </Grid>
      </Card>
      <Card mod={MOD}>
        <H>Arriving in the U.S.: don't go uninsured</H>
        <Grid basis={230}>
          {[["Mind the gap", "Employer coverage may not start on day one — some plans begin the first of the month after 30 days or more. Ask HR for your start date and buy short-term or travel medical cover for the gap."],
            ["Enroll on time", "New hires usually get about 30 days to choose a plan. Miss it and you may wait until the next open enrollment."],
            ["Life events reopen the door", "Marriage, a baby, or losing other coverage lets you change plans — usually within 30 days at work, 60 days on HealthCare.gov."],
            ["Between jobs", "Green card holders can buy a marketplace plan at HealthCare.gov. COBRA lets you keep your old employer plan for up to 18 months, at full price."],
            ["Add your family", "A spouse and children arriving later can be added within the window after they arrive. Check your plan's rules before they travel."]].map(([ti, d]) => (
            <Tile key={ti} title={ti} desc={d} style={{ flex: 1 }} />
          ))}
        </Grid>
      </Card>
      <HealthCompare />
    </View>
  );
}

function Life() {
  const t = useTheme(MOD);
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD}>
        <H>Why nurses need it</H>
        <RichBullets items={[
          "Many internationally educated nurses support parents, siblings or children at home. Life insurance keeps that support going if you die.",
          "A spouse in the U.S. may depend on your income for rent, a car loan or a mortgage — especially while their own work authorization or career is still getting started.",
          "It's cheapest when you're young and healthy. Rates rise with age and with any new diagnosis.",
        ]} />
      </Card>
      <Card mod={MOD}>
        <H>Term vs. permanent</H>
        <Row gap={8} center={false} style={{ alignItems: "stretch" }}>
          <View style={{ flex: 1, backgroundColor: t.soft, borderRadius: 14, padding: 12, gap: 4 }}>
            <Txt v="bodyB" color={t.tint}>Term</Txt>
            <Txt v="small">Covers a set period (10–30 years). Much cheaper for the same payout. Fits most nurses' needs.</Txt>
          </View>
          <View style={{ flex: 1, backgroundColor: t.c.sunk, borderRadius: 14, padding: 12, gap: 4 }}>
            <Txt v="bodyB">Whole / universal</Txt>
            <Txt v="small">Lifelong, with a cash value. Several times the cost. Read every fee before you buy, and be wary of high-pressure sales.</Txt>
          </View>
        </Row>
      </Card>
      <Card mod={MOD}>
        <H>Your work policy isn't enough on its own</H>
        <Grid basis={230}>
          {[["It usually ends with the job", "Group life typically stops when you leave the employer — a real risk if you change hospitals or finish an agency contract."],
            ["It's often small", "A common benefit is 1–2× your salary. Most families need more."],
            ["It can add a little tax", "Employer-paid coverage above $50,000 counts as taxable \"imputed income\" on your W-2. It's small, but it isn't free."],
            ["Beneficiaries abroad", "Name your family as beneficiaries and keep their contact details current. Some insurers have extra steps or limits for people new to the U.S. or for payouts overseas — ask before you apply."]].map(([ti, d]) => (
            <Tile key={ti} title={ti} desc={d} style={{ flex: 1 }} />
          ))}
        </Grid>
      </Card>
      <LifeCalc />
    </View>
  );
}

function Disability() {
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD}>
        <H>Your paycheck is your biggest asset</H>
        <Txt v="body">Lifting, turning and long shifts make back and joint injuries common in nursing. If you can't work for months, health insurance pays the doctor — but nothing pays your rent unless you have disability coverage. For an immigrant nurse whose visa journey depended on one employer, a long gap in income is especially hard.</Txt>
        <Txt v="body">Injuries that happen at work fall under workers' compensation. Disability insurance covers everything else: an off-duty accident, surgery, pregnancy complications, cancer.</Txt>
      </Card>
      <Card mod={MOD}>
        {[["Short-term disability", "Replaces part of your pay (often 60–70%) for a few weeks to several months."], ["Long-term disability", "Starts after a waiting period (often 90 days) and typically pays around 60% of salary, sometimes until retirement age."], ["Check the definition", "\"Own occupation\" coverage pays if you can't work as a nurse. \"Any occupation\" only pays if you can't do any job — a big difference."], ["Who pays the premium matters", "If your employer pays, benefits are taxable. If you pay with after-tax money, benefits are usually tax-free."]].map(([ti, d]) => (
          <Tile key={ti} title={ti} desc={d} titleTone="teal" />
        ))}
      </Card>
    </View>
  );
}

function InsuranceChecklist() {
  const { state, dispatch } = useApp();
  const n = INSURE_LIST.filter((_, i) => state.careers["ins" + i]).length;
  return (
    <View style={{ gap: 6 }}>
      <Row gap={10}>
        <View style={{ flex: 1 }}><Bar mod={MOD} pct={n / INSURE_LIST.length} /></View>
        <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{n}/{INSURE_LIST.length}</Txt>
      </Row>
      {INSURE_LIST.map((x, i) => <Check key={i} mod={MOD} checked={!!state.careers["ins" + i]} onToggle={() => dispatch({ type: "career", id: "ins" + i })} label={x} />)}
    </View>
  );
}

function SectionCard({ id, icon, title, desc, on, onPress }) {
  const t = useTheme(MOD);
  return (
    <Pressable onPress={() => { tap(); onPress(id); }} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={title}
      style={({ pressed }) => [{ flex: 1, backgroundColor: on ? t.soft : t.c.surface, borderRadius: 18, padding: 14, gap: 8, borderWidth: on ? 2 : 1, borderColor: on ? t.tint : t.c.line,
        shadowColor: t.dark ? "#000" : t.acc[0], shadowOpacity: on ? 0.18 : 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: on ? 4 : 1 }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Row style={{ justifyContent: "space-between" }}>
        <Grad mod={MOD} style={{ width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={20} color="#fff" /></Grad>
        {on ? <Icon name="CheckCircle2" size={18} color={t.tint} /> : null}
      </Row>
      <Txt v="h3">{title}</Txt>
      <Txt v="small" muted>{desc}</Txt>
    </Pressable>
  );
}

export function InsuranceHub() {
  const [sec, setSec] = useState("health");
  return (
    <View style={{ gap: 14 }}>
      <Note mod={MOD} tone="warn" icon="AlertTriangle">General education, not insurance or financial advice. Your employer's benefits guide and a licensed agent have the final word.</Note>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {SECTIONS.map(([id, ic, ti, d]) => (
          <View key={id} style={{ flexGrow: 1, flexBasis: "45%" }}>
            <SectionCard id={id} icon={ic} title={ti} desc={d} on={sec === id} onPress={setSec} />
          </View>
        ))}
      </View>
      {sec === "health" ? <Health /> : null}
      {sec === "life" ? <Life /> : null}
      {sec === "disability" ? <Disability /> : null}
      {sec === "auto" ? <AutoSection /> : null}
      {sec === "home" ? <HomeSection /> : null}
      <Card mod={MOD}>
        <Txt v="h3">Insurance checklist</Txt>
        <InsuranceChecklist />
      </Card>
    </View>
  );
}
