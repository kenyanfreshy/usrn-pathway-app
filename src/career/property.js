// Car insurance and home & mortgage insurance (PMI calculator).
import React, { useState } from "react";
import { View } from "react-native";
import { Txt, Row, Card, Chip, Note } from "../ui";
import { useTheme, FONTS } from "../theme";
import { AUTO_COVER } from "../data/content";
import { money, num, pmiSchedule, yrsMo } from "../util";
import { MOD, H, Grid, Tile, RichBullets, NumField, FieldGrid, ResultTile, GradTile, useTone, chipTone } from "./common";

export function AutoSection() {
  const t = useTheme(MOD);
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD}>
        <H>Why It Matters for Nurses</H>
        <RichBullets items={[
          "Every state except New Hampshire requires liability insurance to drive. Driving uninsured can mean fines, a suspended license and paying for a crash yourself.",
          "Most U.S. hospital jobs mean commuting by car, and driving home exhausted after a night shift is a serious accident risk. Strong auto coverage is essential to protect your health, your hard-earned savings and your career.",
          "One serious at-fault crash can lead to a lawsuit far bigger than state-minimum coverage. Without enough liability insurance, your wages and savings are exposed.",
        ]} />
      </Card>
      <Card mod={MOD}>
        <H>Why Your First Quote May Be High</H>
        {[["No U.S. driving history", "Insurers often treat you like a new driver even after years of driving abroad. Ask each insurer whether it considers foreign driving records — some do."], ["Thin credit file", "In most states your credit history affects your rate. The credit-building steps on the Wealth tab help here too."], ["Foreign license", "Get your state driver's license as soon as you can. Many states only accept a foreign license for a limited time after you become a resident."]].map(([ti, d]) => (
          <Tile key={ti} title={ti} desc={d} />
        ))}
      </Card>
      <Card mod={MOD}>
        <H>What a Policy Covers</H>
        <Grid basis={250}>
          {AUTO_COVER.map(([ti, tag, d, tone]) => <CoverTile key={ti} title={ti} tag={tag} desc={d} tone={tone} />)}
        </Grid>
        <Grid basis={220}>
          {[["Lower your premium", "Bundle car and renters insurance, raise your deductible to an amount you could pay tomorrow, and ask about a safe-driver discount and any hospital or nursing-association discount."], ["Compare every year", "Get three quotes at renewal. Loyalty rarely lowers the price."], ["After a crash", "Check everyone for injuries, call police, photograph everything, swap insurance details, and don't admit fault at the scene."]].map(([ti, d]) => (
            <Tile key={ti} title={ti} desc={d} titleTone="teal" outline style={{ flex: 1 }} />
          ))}
        </Grid>
      </Card>
    </View>
  );
}

function CoverTile({ title, tag, desc, tone, top }) {
  const t = useTheme(MOD); const [fg] = useTone(tone);
  return (
    <View style={{ flex: 1, backgroundColor: t.c.sunk, borderRadius: 16, padding: 14, gap: 8, borderTopWidth: top ? 4 : 0, borderTopColor: fg, borderLeftWidth: top ? 0 : 4, borderLeftColor: fg }}>
      {top ? <Chip text={tag} tone={chipTone(tone)} /> : null}
      {top
        ? <Txt v="h3">{title}</Txt>
        : <Row wrap gap={6} style={{ justifyContent: "space-between" }}><Txt v="bodyB" style={{ flexShrink: 1 }}>{title}</Txt><Chip text={tag} tone={chipTone(tone)} /></Row>}
      <Txt v="small" muted>{desc}</Txt>
    </View>
  );
}

const PMI_FIELDS = [["price", "Home price $"], ["down", "Down payment %"], ["rate", "Interest rate %"], ["years", "Loan term (years)"], ["pmi", "PMI rate % per year"]];
function PmiCalc() {
  const t = useTheme(MOD);
  const [raw, setRaw] = useState({ price: "380000", down: "5", rate: "6.5", years: "30", pmi: "0.7" });
  const v = Object.fromEntries(Object.entries(raw).map(([k, x]) => [k, num(x)]));
  const s = pmiSchedule(v.price, v.down, v.rate, v.years);
  const needs = v.down < 20; const pmiMo = needs ? s.loan * v.pmi / 100 / 12 : 0;
  const totalPmi = needs && s.m78 ? pmiMo * s.m78 : 0;
  return (
    <Card mod={MOD}>
      <H eyebrow="Conventional loan" sub="See what PMI adds each month and when it comes off. PMI rates typically run about 0.3%–1.5% of the loan a year, depending on credit score and down payment.">PMI Calculator</H>
      <FieldGrid>{PMI_FIELDS.map(([k, l]) => <NumField key={k} label={l} value={raw[k]} onChange={(x) => setRaw({ ...raw, [k]: x })} />)}</FieldGrid>
      <View style={{ backgroundColor: t.c.sunk, borderRadius: 18, padding: 14, gap: 10 }}>
        <Row gap={8} center={false} style={{ alignItems: "stretch" }}>
          <ResultTile label="Loan amount" value={money(s.loan)} />
          <ResultTile label="Principal + interest" value={`${money(s.pay)}/mo`} />
        </Row>
        {needs ? (
          <View style={{ gap: 8 }}>
            <GradTile big label="PMI adds" value={money(pmiMo)} suffix="/mo" sub={`≈ ${money(totalPmi)} in total before it ends on its own`} />
            <Row gap={10} style={{ paddingVertical: 6 }}>
              <Txt v="small" muted style={{ flex: 1 }}>You can ask to remove it (at 80% of the original value)</Txt>
              <Txt v="mono" style={{ fontFamily: FONTS.monoBold, fontWeight: FONTS.monoBold ? undefined : "700" }}>{yrsMo(s.m80)}</Txt>
            </Row>
            <View style={{ height: 1, backgroundColor: t.c.line }} />
            <Row gap={10} style={{ paddingVertical: 6 }}>
              <Txt v="small" muted style={{ flex: 1 }}>It must end automatically (at 78%)</Txt>
              <Txt v="mono" style={{ fontFamily: FONTS.monoBold, fontWeight: FONTS.monoBold ? undefined : "700" }}>{yrsMo(s.m78)}</Txt>
            </Row>
            <Txt v="tiny" muted>Extra payments toward principal reach these dates sooner. Taxes and homeowners insurance are not included.</Txt>
          </View>
        ) : <Note mod={MOD} tone="acc" icon="PartyPopper">With 20% down, a conventional loan has no PMI.</Note>}
      </View>
    </Card>
  );
}

export function HomeSection() {
  return (
    <View style={{ gap: 14 }}>
      <Card mod={MOD}>
        <H sub="These names get mixed up all the time. Only one of them protects you directly.">Three Different "Mortgage Insurances"</H>
        <Grid basis={250}>
          {[["Mortgage insurance (PMI / MIP)", "Protects the lender", "crit", "Required on a conventional loan with less than 20% down (PMI) and on FHA loans (MIP). You pay for it, but it only covers the lender if you stop paying. Plan to remove it as soon as you can."],
            ["Homeowners insurance", "Protects you", "ok", "Required by your lender. Covers the house, your belongings and your liability if someone is hurt on your property. Floods and earthquakes need separate policies."],
            ["Mortgage protection insurance", "Protects your family", "warn", "Life insurance that pays off the mortgage if you die. The payout shrinks as the loan does. A regular term life policy usually gives more coverage for the money, and your family can spend it on anything."]].map(([ti, tag, tone, d]) => (
            <CoverTile key={ti} top title={ti} tag={tag} tone={tone} desc={d} />
          ))}
        </Grid>
      </Card>
      <PmiCalc />
      <Grid basis={300} gap={12}>
        <Card mod={MOD} style={{ flex: 1 }}>
          <H size="h3">FHA Loans Work Differently</H>
          <RichBullets v="small" items={[
            "FHA allows as little as 3.5% down, which helps nurses still building savings.",
            "You pay an upfront MIP plus an annual MIP. With less than 10% down, the annual MIP lasts for the life of the loan; with 10% or more, it ends after 11 years.",
            "To drop lifetime MIP, many owners later refinance into a conventional loan once they reach 20% equity.",
          ]} />
        </Card>
        <Card mod={MOD} style={{ flex: 1 }}>
          <H size="h3">Renting First? Get Renters Insurance</H>
          <Txt v="small">Most nurses rent when they first arrive. Your landlord's policy covers the building, not your things. Renters insurance covers your belongings against theft and fire, pays for a hotel if your unit becomes unlivable, and covers your liability. It's usually inexpensive, and bundling it with car insurance can lower both.</Txt>
        </Card>
        <Card mod={MOD} style={{ flex: 1 }}>
          <H size="h3">Before You Buy a Home</H>
          <RichBullets v="small" items={[
            "Green card holders can get conventional and FHA mortgages. Lenders will check your work history, credit and permanent resident card.",
            "Get homeowners insurance quotes before you make an offer — in some areas, cost or availability can change the math.",
            "Taxes and insurance are usually collected monthly with your mortgage payment through an escrow account. Budget for them, not just the loan.",
            "Ask whether your hospital or state offers homebuyer programs for healthcare workers.",
          ]} />
        </Card>
      </Grid>
    </View>
  );
}
