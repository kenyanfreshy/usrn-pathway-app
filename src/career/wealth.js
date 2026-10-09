// Wealth & credit: credit roadmap, salary stacking calculator, retirement / HSA / emergency fund.
import React, { useState } from "react";
import { View } from "react-native";
import { Txt, Row, Card, Note, Bar, Check } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp } from "../state";
import { CREDIT } from "../data/content";
import { money, num } from "../util";
import { MOD, Grid, IconHead, NumField, FieldGrid, GradTile, BarRow } from "./common";

const PAY_FIELDS = [["base", "Base rate $/hr"], ["hrs", "Hours / week"], ["night", "Night diff $/hr"], ["nightPct", "% hours on nights"], ["wknd", "Weekend diff $/hr"], ["wkndPct", "% hours on weekends"], ["charge", "Charge diff $/hr"], ["chargeShifts", "Charge shifts / week"], ["prn", "PRN 12h shifts / month"], ["prnRate", "PRN rate $/hr"]];

function PayCalc() {
  const [raw, setRaw] = useState({ base: "48", hrs: "36", night: "4", nightPct: "100", wknd: "3", wkndPct: "33", charge: "2.5", chargeShifts: "1", prn: "2", prnRate: "62" });
  const p = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, num(v)]));
  const weeks = 52;
  const baseAnn = p.base * p.hrs * weeks;
  const nightAnn = p.night * p.hrs * (p.nightPct / 100) * weeks;
  const wkndAnn = p.wknd * p.hrs * (p.wkndPct / 100) * weeks;
  const chargeAnn = p.charge * 12 * p.chargeShifts * weeks;
  const prnAnn = p.prn * 12 * p.prnRate * 12;
  const total = baseAnn + nightAnn + wkndAnn + chargeAnn + prnAnn;
  const parts = [["Base", baseAnn], ["Night diff", nightAnn], ["Weekend diff", wkndAnn], ["Charge diff", chargeAnn], ["PRN shifts", prnAnn]];
  return (
    <View style={{ gap: 14 }}>
      <FieldGrid>{PAY_FIELDS.map(([k, l]) => <NumField key={k} label={l} value={raw[k]} onChange={(v) => setRaw({ ...raw, [k]: v })} />)}</FieldGrid>
      <GradTile big label="Estimated gross annual" value={money(total)} sub="Before tax and overtime. Example figures, not a job offer." />
      {parts.map(([l, v]) => <BarRow key={l} label={l} value={v} pct={total ? v / total : 0} />)}
      <Note mod={MOD} tone="acc" icon="MapPin">Geographic arbitrage: the same rate goes further in a lower-cost metro, and some high-cost states pay enough to offset rent. Compare take-home after rent, not just the hourly rate.</Note>
    </View>
  );
}

export function Wealth() {
  const { state, dispatch } = useApp(); const t = useTheme(MOD);
  const done = CREDIT.filter((_, i) => state.credit[i]).length;
  return (
    <View style={{ gap: 14 }}>
      <Note mod={MOD} tone="warn" icon="AlertTriangle">General education, not personalized financial advice. Talk to a licensed advisor or tax professional for your situation.</Note>

      <Card mod={MOD}>
        <IconHead icon="CreditCard">Credit-building roadmap · secured card → 720+</IconHead>
        <Row gap={10}>
          <View style={{ flex: 1 }}><Bar mod={MOD} pct={done / CREDIT.length} /></View>
          <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{done}/{CREDIT.length}</Txt>
        </Row>
        {CREDIT.map((c, i) => (
          <Row key={i} gap={8} center={false}>
            <Txt v="mono" muted style={{ width: 16, marginTop: 6 }}>{i + 1}</Txt>
            <View style={{ flex: 1 }}><Check mod={MOD} checked={!!state.credit[i]} onToggle={() => dispatch({ type: "credit", id: i })} label={c} /></View>
          </Row>
        ))}
      </Card>

      <Card mod={MOD}>
        <IconHead icon="Layers">Salary stacking calculator</IconHead>
        <PayCalc />
      </Card>

      <Grid basis={240} gap={12}>
        {[["PiggyBank", "401(k) / 403(b)", "Contribute at least enough to get the full employer match — it is part of your pay. The 2026 employee deferral limit is $24,500."],
          ["HeartPulse", "HSA", "Only with a high-deductible health plan. 2026 limits: $4,400 self-only, $8,750 family. Tax-free in, growth, and out for medical costs."],
          ["ShieldCheck", "Emergency fund", "Aim for 3–6 months of expenses before investing beyond the match — especially while your status depends on one employer."]].map(([ic, h, d]) => (
          <Card key={h} mod={MOD} style={{ flex: 1 }}>
            <IconHead icon={ic}>{h}</IconHead>
            <Txt v="small">{d}</Txt>
          </Card>
        ))}
      </Grid>
    </View>
  );
}
