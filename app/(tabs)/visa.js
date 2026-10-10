// Module 4 · Immigration: EB-3 visa bulletin, priority-date calculator, sponsor directory and offer comparison.
import React, { useEffect, useState } from "react";
import { View, Pressable, Linking } from "react-native";
import { Screen, Hero, Card, Row, Txt, Icon, Seg, Select, DateField, Chip, Note, Accordion, SectionTitle, Bullets, CopyButton, Btn, Grad, tap, Grid } from "../../src/ui";
import { useTheme, FONTS } from "../../src/theme";
import { useApp } from "../../src/state";
import { SPONSORS, AEIRP_LIST, PHASE_COLORS } from "../../src/data/content";
import { useBulletin, useBulletinSource, monthName } from "../../src/bulletin";
import { fmtDate, parseISO, money, clamp } from "../../src/util";
import { DestPill, useDest } from "../../src/dest";
import { CountryMonitor, CountryDirectory, COUNTRY_HERO } from "../../src/visaGlobal";
import { useMigration } from "../../src/migration";

const MOD = "imm";
const BULLETIN_URL = "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html";
const ALLIANCE_CONTACT = "https://www.cgfnsalliance.org/contact-us/";

// Example employer profiles (not real companies) used to compare the two sponsorship models.
const AGENCIES = [
  { id: 1, name: "Academic medical center", model: "Direct hire", contract: "2–3 yr commitment", rate: [44, 52], bonus: 8000, gc: "Hospital files I-140 and pays legal costs", flags: "Usually ICU/med-surg experience required" },
  { id: 2, name: "Regional community health system", model: "Direct hire", contract: "2 yr commitment", rate: [40, 46], bonus: 5000, gc: "Hospital files I-140; spouse/children included", flags: "Often rural or smaller-metro locations" },
  { id: 3, name: "Full-service sponsorship agency", model: "Staffing agency", contract: "3 yr contract", rate: [34, 40], bonus: 3000, gc: "Agency files I-140 and pays fees", flags: "Ask about breach / liquidated-damages amounts" },
  { id: 4, name: "Sponsorship agency with housing", model: "Staffing agency", contract: "2–3 yr contract", rate: [36, 42], bonus: 4500, gc: "Agency sponsors; 1–2 months housing included", flags: "Assignment location may change" },
  { id: 5, name: "Long-term care placement agency", model: "Staffing agency", contract: "3 yr contract", rate: [32, 37], bonus: 2500, gc: "Agency sponsors; family included", flags: "Lower rates; easier first placement" },
];

const MODEL_TABS = [{ id: "All", label: "All" }, { id: "Direct hire", label: "Direct Hire", icon: "Building2" }, { id: "Staffing agency", label: "Staffing Agency", icon: "Users" }];

const open = (url) => { tap(); Linking.openURL(url).catch(() => {}); };

function Link({ url, children, v = "smallB" }) {
  const t = useTheme(MOD);
  return <Txt v={v} color={t.tint} onPress={() => open(url)} accessibilityRole="link">{children}</Txt>;
}

/** Colored alert line that wraps instead of overflowing (long bulletin notes). */
function AlertPill({ tone, text }) {
  const t = useTheme(MOD);
  const map = { ok: [t.c.okSoft, t.c.ok], warn: [t.c.warnSoft, t.c.warn], crit: [t.c.critSoft, t.c.crit] };
  const [bg, fg] = map[tone] || [t.c.sunk, t.c.muted];
  const icon = tone === "crit" ? "TrendingDown" : tone === "ok" ? "TrendingUp" : "AlertTriangle";
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: bg, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6, alignSelf: "flex-start", maxWidth: "100%" }}>
      <View style={{ paddingTop: 1 }}><Icon name={icon} size={12} color={fg} /></View>
      <Txt v="tiny" color={fg} style={{ flexShrink: 1, fontFamily: FONTS.bodyBold, fontWeight: FONTS.bodyBold ? undefined : "700" }}>{text}</Txt>
    </View>
  );
}

function StepBtn({ icon, onPress, disabled, label }) {
  const t = useTheme(MOD);
  return (
    <Pressable onPress={() => { tap(); onPress(); }} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={({ pressed }) => ({ width: 42, height: 42, borderRadius: 13, borderWidth: 1.5, borderColor: t.c.line, backgroundColor: t.c.surface, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] })}>
      <Icon name={icon} size={18} color={t.tint} />
    </Pressable>
  );
}

function Bulletin({ chart, setChart }) {
  const t = useTheme(MOD); const BULLETIN = useBulletin(); const source = useBulletinSource();
  const updated = BULLETIN.checked ? fmtDate(BULLETIN.checked) : null;
  return (
    <Card mod={MOD} style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Txt v="bodyB">{BULLETIN.label}</Txt>
        <Row gap={6}>
          <Icon name={source === "online" ? "RefreshCw" : "Clock"} size={13} color={t.c.muted} />
          <Txt v="tiny" muted style={{ flex: 1 }}>
            {monthName(BULLETIN.month)} bulletin{updated ? ` · last updated ${updated}` : ""}{source === "online" ? "" : " · will refresh when you're online"}
          </Txt>
        </Row>
        <Txt v="tiny" muted>Dates update in the app each month. Always confirm with the official bulletin at <Link v="tiny" url={BULLETIN_URL}>travel.state.gov ↗</Link> before acting.</Txt>
      </View>
      <Seg mod={MOD} value={chart} onChange={setChart} options={[{ id: "fa", label: "Final Action", icon: "Stamp" }, { id: "dff", label: "Dates for Filing", icon: "FileText" }]} />
      <Grid min={150} gap={10}>
        {BULLETIN.rows.map((r) => (
          <View key={r.key} style={{ flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk, borderLeftWidth: 4, borderLeftColor: t.c[r.tone] || t.tint, gap: 6 }}>
            <Txt v="eyebrow">{r.name}</Txt>
            <Txt v="h3" style={{ fontVariant: ["tabular-nums"] }}>{fmtDate(chart === "fa" ? r.fa : r.dff)}</Txt>
            <AlertPill tone={r.tone} text={r.alert} />
          </View>
        ))}
      </Grid>
    </Card>
  );
}

function Calculator({ chart }) {
  const { state, dispatch } = useApp(); const t = useTheme(MOD);
  const BULLETIN = useBulletin();
  const country = state.profile.country || "ph", pd = state.profile.pd || "";
  const row = BULLETIN.rows.find((r) => r.key === country) || BULLETIN.rows[0];
  const [rate, setRate] = useState(row.rate);
  useEffect(() => setRate(row.rate), [row.key]);
  const cutoff = chart === "fa" ? row.fa : row.dff;
  const pdDate = parseISO(pd), cutDate = parseISO(cutoff);
  const gapMonths = pdDate ? (pdDate - cutDate) / (86400000 * 30.44) : 0;
  const current = !!pdDate && gapMonths <= 0;
  const yrs = gapMonths > 0 ? gapMonths / rate : 0;
  const label = chart === "fa" ? "Final Action" : "Dates for Filing";
  return (
    <Card mod={MOD} style={{ gap: 14 }}>
      <Row gap={10}>
        <Icon name="CalendarClock" size={19} color={t.tint} />
        <Txt v="h3" style={{ flex: 1 }}>Where Does My Priority Date Stand?</Txt>
      </Row>
      <Select mod={MOD} label="Country of chargeability" value={row.key} options={BULLETIN.rows.map((r) => ({ value: r.key, label: r.name }))}
        onChange={(v) => dispatch({ type: "profile", patch: { country: v } })} />
      <DateField mod={MOD} label="My priority date (I-140 filing date)" value={pd} onChange={(v) => dispatch({ type: "profile", patch: { pd: v } })} />
      <View style={{ gap: 6 }}>
        <Txt v="smallB" muted>Assumed bulletin movement</Txt>
        <Row gap={10}>
          <StepBtn icon="Minus" label="Fewer months per year" disabled={rate <= 1} onPress={() => setRate(clamp(rate - 1, 1, 18))} />
          <View style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 13, backgroundColor: t.soft }}>
            <Txt v="h2" color={t.tint}>{rate}</Txt>
            <Txt v="tiny" muted>months per year</Txt>
          </View>
          <StepBtn icon="Plus" label="More months per year" disabled={rate >= 18} onPress={() => setRate(clamp(rate + 1, 1, 18))} />
        </Row>
      </View>
      <View style={{ padding: 16, borderRadius: 16, gap: 6, backgroundColor: current ? t.c.okSoft : t.soft, borderWidth: 1, borderColor: current ? t.c.ok : t.tint }}>
        <Txt v="eyebrow">{label} · cutoff {fmtDate(cutoff)}</Txt>
        {!pdDate ? (
          <>
            <Txt v="h2" color={t.tint}>Add your date</Txt>
            <Txt v="small">Enter your priority date above to compare it with the {row.name} cutoff.</Txt>
          </>
        ) : current ? (
          <>
            <Row gap={8}><Icon name="CheckCircle2" size={22} color={t.c.ok} /><Txt v="h1" color={t.c.ok}>Current</Txt></Row>
            <Txt v="small">Your date is on or before the cutoff. {chart === "fa" ? "A visa number is available." : "You can submit documents; approval waits for Final Action."}</Txt>
          </>
        ) : (
          <>
            <Txt v="h1" color={t.tint}>≈ {yrs < 1 ? Math.max(1, Math.round(yrs * 12)) + " months" : yrs.toFixed(1) + " years"}</Txt>
            <Txt v="small">Your date is <Txt v="smallB">{Math.round(gapMonths)}</Txt> months past the cutoff. At {rate} months of movement per year, that's the estimated wait. Retrogression can make it longer.</Txt>
          </>
        )}
      </View>
    </Card>
  );
}

function ContactLine({ icon, value, label, url }) {
  const t = useTheme(MOD);
  return (
    <Row gap={8}>
      <Icon name={icon} size={15} color={t.c.muted} />
      <Pressable onPress={() => open(url)} accessibilityRole="link" accessibilityLabel={(icon === "Phone" ? "Call " : "Email ") + value} style={{ flex: 1, minWidth: 0 }}>
        <Txt v="mono" color={t.tint} style={{ flexShrink: 1 }}>{value}</Txt>
        {label ? <Txt v="tiny" muted>{label}</Txt> : null}
      </Pressable>
      <CopyButton mod={MOD} text={value} />
    </Row>
  );
}

function SponsorCard({ x, k }) {
  const t = useTheme(MOD);
  const initials = x.name.replace(/[^A-Z]/g, "").slice(0, 2) || x.name[0];
  const sub = [x.parent && "Part of " + x.parent, x.loc].filter(Boolean).join(" · ");
  const telOf = (n) => "tel:" + n.split(",")[0].replace(/[^\d+]/g, "");
  return (
    <Card mod={MOD} style={{ gap: 12 }}>
      <Row gap={12} center={false}>
        <Grad colors={[PHASE_COLORS[k % 6], PHASE_COLORS[(k + 2) % 6]]} style={{ width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" }}>
          <Txt v="h3" color="#fff">{initials}</Txt>
        </Grad>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="h3">{x.name}</Txt>
          {sub ? <Txt v="tiny" muted>{sub}</Txt> : null}
        </View>
      </Row>
      <Row wrap gap={6}>
        <Chip mod={MOD} tone={x.model === "Direct hire" ? "acc2" : x.model === "Staffing agency" ? "acc" : "mute"} icon={x.model === "Direct hire" ? "Building2" : x.model === "Staffing agency" ? "Users" : "HelpCircle"} text={x.model === "Not stated" ? "Model: ask" : x.model} />
        <Chip tone="ok" icon="ShieldCheck" text={"Certified since " + x.since} />
        {x.record ? <Chip tone="warn" icon="Scale" text="Public legal record" /> : null}
      </Row>
      <Txt v="small" muted>{x.blurb}</Txt>
      <View style={{ gap: 10, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk }}>
        {x.phones.map(([n, l]) => <ContactLine key={n} icon="Phone" value={n} label={l} url={telOf(n)} />)}
        {x.emails.map((e) => <ContactLine key={e} icon="Mail" value={e} url={"mailto:" + e} />)}
        {!x.phones.length && !x.emails.length ? (
          <Row gap={8}><Icon name="MessageSquare" size={15} color={t.c.muted} /><Txt v="small" muted>Contact form only</Txt></Row>
        ) : null}
      </View>
      {x.record ? (
        <Accordion mod={MOD} title="Public Legal Record" meta={<Icon name="Scale" size={16} color={t.c.warn} />}>
          <Bullets items={x.record.map(([txt, u]) => (
            <Txt key={u} v="small">{txt} <Link v="smallB" url={u}>Source ↗</Link></Txt>
          ))} />
        </Accordion>
      ) : null}
      <Row wrap gap={8}>
        <Btn mod={MOD} small icon="Globe" title="Website" onPress={() => open(x.site)} />
        <Btn mod={MOD} small kind="secondary" icon="Send" title="Contact Page" onPress={() => open(x.contact)} />
      </Row>
    </Card>
  );
}

function SponsorDirectory() {
  const t = useTheme(MOD);
  const [f, setF] = useState("All");
  const list = SPONSORS.filter((x) => f === "All" || x.model === f);
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle eyebrow="Sponsoring agencies" title="Certified Ethical Recruiters"
        sub="Each agency below is a Certified Ethical Recruiter of the CGFNS Alliance for Ethical International Recruitment Practices. Contact details come from each agency's own website." />
      <Seg mod={MOD} value={f} onChange={setF} options={MODEL_TABS} />
      <Pressable onPress={() => open(AEIRP_LIST)} accessibilityRole="link" style={{ alignSelf: "flex-start" }}>
        <Row gap={6}><Icon name="ExternalLink" size={14} color={t.tint} /><Txt v="smallB" color={t.tint}>Check the full certified list ↗</Txt></Row>
      </Pressable>
      {list.map((x) => <SponsorCard key={x.name} x={x} k={SPONSORS.indexOf(x)} />)}

      <Card mod={MOD} accent style={{ gap: 10 }}>
        <Row gap={8}><Icon name="ShieldCheck" size={20} color={t.c.ok} /><Txt v="h3" style={{ flex: 1 }}>What an Ethical Recruiter Must Do</Txt></Row>
        <Txt v="small" muted>From the Alliance's Health Care Code, which certified recruiters agree to follow.</Txt>
        <Bullets items={[
          <Txt key="a" v="small">Charge you <Txt v="smallB">no recruitment fees</Txt>.</Txt>,
          <Txt key="b" v="small">Give you at least <Txt v="smallB">30 days</Txt> to review a contract, and <Txt v="smallB">7 days</Txt> after signing to cancel without penalty.</Txt>,
          <Txt key="c" v="small">Never use breach fees as a punishment.</Txt>,
          <Txt key="d" v="small">Never hold your passport or documents to pressure you.</Txt>,
          <Txt key="e" v="small">Never threaten you with immigration consequences.</Txt>,
          <Txt key="f" v="small">Never stop you from getting legal advice on your contract.</Txt>,
        ]} />
      </Card>
      <Card mod={MOD} style={{ gap: 10, borderColor: t.c.warn }}>
        <Row gap={8}><Icon name="AlertTriangle" size={20} color={t.c.warn} /><Txt v="h3" style={{ flex: 1 }}>Before You Sign</Txt></Row>
        <Bullets items={[
          <Txt key="a" v="small">Confirm the agency on the <Link url={AEIRP_LIST}>certified recruiter list</Link> yourself.</Txt>,
          <Txt key="b" v="small">Being certified doesn't guarantee a clean record. Search the company name with “lawsuit” or “breach fee.”</Txt>,
          <Txt key="c" v="small">Get the breach or early-departure fee, and how it's calculated, in writing.</Txt>,
          <Txt key="d" v="small">Have an independent immigration or employment attorney read the contract — not one the agency picks.</Txt>,
          <Txt key="e" v="small">Report a problem to the <Link url={ALLIANCE_CONTACT}>Alliance</Link>.</Txt>,
        ]} />
      </Card>
      <Txt v="tiny" muted>Details checked on each agency's website in October 2026. Being listed here is not an endorsement. Contact details and certification can change; confirm before you apply.</Txt>
    </View>
  );
}

function OfferTile({ label, value, mono }) {
  const t = useTheme(MOD);
  return (
    <View style={{ flexGrow: 1, padding: 10, borderRadius: 12, backgroundColor: t.c.sunk, gap: 2 }}>
      <Txt v="eyebrow">{label}</Txt>
      <Txt v={mono ? "bodyB" : "smallB"}>{value}</Txt>
    </View>
  );
}

function Offers() {
  const [model, setModel] = useState("All"); const [asort, setAsort] = useState("rate");
  const ag = AGENCIES.filter((a) => model === "All" || a.model === model).sort((a, b) => asort === "rate" ? b.rate[1] - a.rate[1] : b.bonus - a.bonus);
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle eyebrow="Comparing offers" title="Direct Hire vs. Staffing Agency" sub="What to compare between the two sponsorship models. These are example profiles, not real companies." />
      <Seg mod={MOD} value={model} onChange={setModel} options={MODEL_TABS} />
      <Select mod={MOD} label="Sort" value={asort} onChange={setAsort} options={[{ value: "rate", label: "Highest hourly rate" }, { value: "bonus", label: "Largest relocation bonus" }]} />
      {ag.map((a) => (
        <Card key={a.id} mod={MOD} style={{ gap: 10 }}>
          <View style={{ gap: 6 }}>
            <Txt v="h3">{a.name}</Txt>
            <Row wrap gap={6}>
              <Chip mod={MOD} tone={a.model === "Direct hire" ? "acc2" : "acc"} icon={a.model === "Direct hire" ? "Building2" : "Users"} text={a.model} />
              <Chip tone="mute" icon="FlaskConical" text="Example" />
            </Row>
            <Txt v="tiny" muted>{a.flags}</Txt>
          </View>
          <Grid min={130} gap={8}>
            <OfferTile label="Hourly" value={"$" + a.rate[0] + "–" + a.rate[1]} mono />
            <OfferTile label="Relocation" value={money(a.bonus)} mono />
            <OfferTile label="Contract" value={a.contract} />
            <OfferTile label="Green card terms" value={a.gc} />
          </Grid>
        </Card>
      ))}
      <Accordion mod={MOD} title="Questions to Ask Any Sponsor Before You Sign">
        <Bullets items={[
          "Who pays the I-140 filing fees and attorney costs? (Employer-paid is standard.)",
          "What is the breach or early-termination fee, and how is it calculated?",
          "Is the pay rate fixed in the contract or tied to the facility's prevailing wage?",
          "Can they move you to another facility or state, and with how much notice?",
          "Are your spouse and children included as derivatives?",
          "Have an independent immigration attorney review the contract. This app is for education only and does not give legal advice.",
        ]} />
      </Accordion>
    </View>
  );
}

export default function Visa() {
  const [chart, setChart] = useState("fa");
  const { dest, info } = useDest(); const BULLETIN = useBulletin(); const mig = useMigration(dest);
  const ph = BULLETIN.rows.find((r) => r.key === "ph"), row = BULLETIN.rows.find((r) => r.key === "row");
  if (dest !== "US") {
    const d = mig.migration;
    const stats = dest === "CA" ? [["Latest draw", mig.headline.value], ["Draws this year", String(d.express_entry.draws.filter((x) => x.date.slice(0, 4) === (mig.checked || "").slice(0, 4)).length)], ["PNP streams", String(d.pnp.length)]]
      : dest === "AU" ? [["Points minimum", String(d.points.minimum)], ["RN occupations", String(d.occupations.length)], ["States", String(d.states.length)]]
      : [["Green List", "Tier 1"], ["AEWV", "Up to 5 yrs"], ["Checked", fmtDate(mig.checked)]];
    return (
      <Screen mod={MOD}>
        <Hero mod={MOD} icon="Plane" eyebrow={`Module 4 · Immigration · ${info.flag} ${info.short}`} title={COUNTRY_HERO[dest].title} sub={COUNTRY_HERO[dest].sub} stats={stats} />
        <DestPill mod={MOD} />
        <CountryMonitor dest={dest} />
        <CountryDirectory dest={dest} />
      </Screen>
    );
  }
  return (
    <Screen mod={MOD}>
      <Hero mod={MOD} icon="Plane" eyebrow="Module 4 · Immigration · 🇺🇸 U.S." title="EB-3 Visa Bulletin Monitor"
        sub={`Priority dates from the State Department's ${monthName(BULLETIN.month)} bulletin. Final Action dates decide when a visa can be issued; Dates for Filing decide when you may submit documents.`}
        stats={[["Bulletin", monthName(BULLETIN.month).replace(/^(\w{3})\w* /, "$1 ")], ["Philippines FA", ph ? fmtDate(ph.fa) : "—"], ["Rest of world FA", row ? fmtDate(row.fa) : "—"]]} />
      <DestPill mod={MOD} />
      <Bulletin chart={chart} setChart={setChart} />
      <Calculator chart={chart} />
      <SponsorDirectory />
      <Offers />
    </Screen>
  );
}
