// Overtime & taxes: overtime deduction, withholding, pre-tax accounts, Roth, IEN notes.
import React, { useState } from "react";
import { View } from "react-native";
import { Txt, Row, Card, Chip, Note, Select } from "../ui";
import { useTheme, FONTS } from "../theme";
import { RATES } from "../data/content";
import { money, num } from "../util";
import { MOD, H, Grid, Rich, RichBullets, NumField, FieldGrid, ResultTile, GradTile } from "./common";

const RATE_OPTS = RATES.map((r) => ({ value: r, label: r + "%" }));

export function TaxPlaybook() {
  const t = useTheme(MOD);
  const [otRaw, setOt] = useState({ hrs: "240", rate: "52", magi: "98000" }); const [otMr, setOtMr] = useState(22);
  const [ptRaw, setPt] = useState({ k401: "12000", k457: "0", hsa: "4400", st: "5" }); const [ptMr, setPtMr] = useState(22);
  const ot = { hrs: num(otRaw.hrs), rate: num(otRaw.rate), magi: num(otRaw.magi), mr: otMr };
  const pt = { k401: num(ptRaw.k401), k457: num(ptRaw.k457), hsa: num(ptRaw.hsa), st: num(ptRaw.st), mr: ptMr };
  const premium = ot.hrs * ot.rate * 0.5;
  const cap = Math.max(0, 12500 - Math.max(0, Math.ceil((ot.magi - 150000) / 1000)) * 100);
  const ded = Math.min(premium, cap); const otSave = ded * ot.mr / 100;
  const c401 = Math.min(pt.k401, 24500), c457 = Math.min(pt.k457, 24500), chsa = Math.min(pt.hsa, 8750);
  const shelter = c401 + c457 + chsa; const ptSave = shelter * (pt.mr + pt.st) / 100 + chsa * 0.0765;
  const capped = pt.k401 > 24500 || pt.k457 > 24500 || pt.hsa > 8750;

  const STACK = [["Gross pay", "Base + overtime + differentials", t.c.ink], ["− 401(k) / 403(b)", "Up to $24,500 in 2026", t.tint], ["− 457(b)", "A separate $24,500 limit at government and nonprofit employers", t.tint], ["− HSA", "$4,400 self / $8,750 family, with a high-deductible plan", t.tint], ["= Taxable wages", "W-2 Box 1", t.tint2]];

  return (
    <View style={{ gap: 14 }}>
      <Note mod={MOD} tone="warn" icon="AlertTriangle">General education using 2026 federal rules, not tax advice. Estimates ignore state rules and your full return. Confirm with a tax professional or the IRS Withholding Estimator.</Note>

      <Card mod={MOD}>
        <Chip text="New for 2025–2028" tone="acc" icon="Sparkles" />
        <H>The overtime deduction</H>
        <RichBullets items={[
          "You can deduct the **premium half** of FLSA overtime (the \"half\" in time-and-a-half), up to **$12,500** filing single.",
          "It shrinks by $100 for every $1,000 of income above $150,000 and is gone at $275,000.",
          "You don't have to itemize. It cuts **federal income tax only** — Social Security, Medicare and state tax still apply.",
          "Overtime owed only under state law (like California's daily overtime), a union contract or hospital policy doesn't qualify. Shift differentials alone aren't overtime.",
          "Look for the qualifying amount in **Box 14 \"QUAL OT\"** on your W-2. Your paycheck withholding won't change on its own.",
        ]} />
        <View style={{ backgroundColor: t.c.sunk, borderRadius: 18, padding: 14, gap: 12, marginTop: 4 }}>
          <Txt v="eyebrow">Estimate your deduction</Txt>
          <FieldGrid>
            <NumField label="FLSA OT hours / year" value={otRaw.hrs} onChange={(v) => setOt({ ...otRaw, hrs: v })} />
            <NumField label="Regular rate $/hr" value={otRaw.rate} onChange={(v) => setOt({ ...otRaw, rate: v })} />
            <NumField label="Income (MAGI) $" value={otRaw.magi} onChange={(v) => setOt({ ...otRaw, magi: v })} />
            <Select mod={MOD} label="Your top federal bracket" value={otMr} options={RATE_OPTS} onChange={setOtMr} />
          </FieldGrid>
          <Row gap={8} center={false} style={{ alignItems: "stretch" }}>
            <ResultTile label="Deduction" value={money(ded)} sub={`premium ${money(premium)}${premium > cap ? `, capped at ${money(cap)}` : ""}`} />
            <GradTile label="Federal tax saved" value={`≈ ${money(otSave)}`} />
          </Row>
        </View>
      </Card>

      <Card mod={MOD}>
        <H>Why you might owe in April</H>
        <Rich v="body" text="One big overtime check usually isn't the problem — payroll treats it as if you earned that much all year and often over-withholds. The common surprise is **two W-2 jobs**, such as your staff job plus PRN or agency shifts. Each employer withholds as if it's your only income, so both apply the low brackets and the standard deduction." />
        <Grid basis={220}>
          {[["Step 2(c)", "Two jobs with similar pay? Check the box on the W-4 for both jobs."], ["Step 4(c)", "Add a flat extra amount per paycheck, e.g. $100–$250, in your payroll portal (Workday, Kronos)."], ["IRS estimator", "Run the IRS Tax Withholding Estimator mid-year and after any big change in hours."]].map(([k, v]) => (
            <View key={k} style={{ backgroundColor: t.c.sunk, borderRadius: 14, padding: 12, gap: 8, flex: 1 }}>
              <Chip text={k} tone="acc2" />
              <Txt v="small">{v}</Txt>
            </View>
          ))}
        </Grid>
      </Card>

      <Card mod={MOD}>
        <H>Shelter overtime with pre-tax accounts</H>
        <View style={{ gap: 6 }}>
          {STACK.map(([a, b, c], k) => (
            <View key={a} style={{ backgroundColor: t.c.sunk, borderRadius: 12, padding: 10, gap: 2, marginLeft: k && k < 4 ? 16 : 0, borderLeftWidth: 3, borderLeftColor: c }}>
              <Txt v="smallB" color={c} style={{ fontFamily: FONTS.monoBold }}>{a}</Txt>
              <Txt v="small" muted>{b}</Txt>
            </View>
          ))}
        </View>
        <Txt v="tiny" muted>A 457(b) at a non-government (private nonprofit) employer belongs to the employer's creditors until paid out — read the plan rules. HSA payroll contributions also skip Social Security and Medicare tax.</Txt>
        <View style={{ backgroundColor: t.c.sunk, borderRadius: 18, padding: 14, gap: 12, marginTop: 4 }}>
          <Txt v="eyebrow">Estimate this year's savings</Txt>
          <FieldGrid>
            <NumField label="401(k) / 403(b) $" value={ptRaw.k401} onChange={(v) => setPt({ ...ptRaw, k401: v })} />
            <NumField label="457(b) $" value={ptRaw.k457} onChange={(v) => setPt({ ...ptRaw, k457: v })} />
            <NumField label="HSA (payroll) $" value={ptRaw.hsa} onChange={(v) => setPt({ ...ptRaw, hsa: v })} />
            <Select mod={MOD} label="Top federal bracket" value={ptMr} options={RATE_OPTS} onChange={setPtMr} />
            <NumField label="State tax rate %" value={ptRaw.st} onChange={(v) => setPt({ ...ptRaw, st: v })} />
          </FieldGrid>
          <Row gap={8} center={false} style={{ alignItems: "stretch" }}>
            <ResultTile label="Sheltered" value={money(shelter)} sub={capped ? "Capped at 2026 limits" : null} subColor={t.c.warn} />
            <GradTile label="Tax saved now" value={`≈ ${money(ptSave)}`} />
          </Row>
          <Txt v="tiny" muted>401(k)/457(b) money is taxed when you withdraw it in retirement. Some states don't allow the HSA deduction.</Txt>
        </View>
      </Card>

      <Grid basis={300} gap={12}>
        <Card mod={MOD} style={{ flex: 1 }}>
          <H size="h3">Roth IRA and the backdoor</H>
          <Rich v="small" text="In 2026 you can put up to **$7,500** in an IRA. Direct Roth contributions phase out between **$153,000 and $168,000** of income for single filers — most staff nurses are below that and can contribute directly." />
          <Rich v="small" text="Above it, a **backdoor Roth** works: contribute to a traditional IRA without deducting it, then convert to Roth. If you hold other pre-tax IRA money, the pro-rata rule makes part of the conversion taxable. File Form 8606 either way." />
        </Card>
        <Card mod={MOD} style={{ flex: 1 }}>
          <H size="h3">For internationally educated nurses</H>
          <RichBullets v="small" items={[
            "As a green card holder you're taxed as a U.S. resident on your **worldwide income**, including income from home.",
            "If your foreign bank accounts total more than **$10,000** at any point in the year, file an **FBAR** (FinCEN 114).",
            "Your arrival year can be a \"dual-status\" year. Check your home country's tax treaty with the U.S.",
            "W-2 nurses can't deduct scrubs, commuting or licensing costs on their federal return, so pre-tax accounts do the heavy lifting.",
          ]} />
        </Card>
      </Grid>
    </View>
  );
}
