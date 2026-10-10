// Visa tab for Canada, Australia and New Zealand: migration monitors and the employer / recruiter directory.
// Data comes from src/migration.js (refreshed online) and src/data/countries/*.json (bundled, with sources).
import React, { useState } from "react";
import { View, Pressable, Linking } from "react-native";
import { Card, Row, Txt, Icon, Seg, Chip, Note, Accordion, SectionTitle, Bullets, Btn, Grad, Grid, tap } from "./ui";
import { useTheme, FONTS } from "./theme";
import { PHASE_COLORS } from "./data/content";
import { countryData, destOf } from "./data/global";
import { useMigration } from "./migration";
import { fmtDate } from "./util";

const MOD = "imm";
const open = (url) => { tap(); Linking.openURL(url).catch(() => {}); };

function LinkRow({ url, label = "Official page" }) {
  const t = useTheme(MOD);
  if (!url) return null;
  return (
    <Pressable onPress={() => open(url)} accessibilityRole="link" style={{ alignSelf: "flex-start" }} hitSlop={6}>
      <Row gap={6}><Icon name="ExternalLink" size={14} color={t.tint} /><Txt v="smallB" color={t.tint}>{label} ↗</Txt></Row>
    </Pressable>
  );
}

function SourceLine({ dest }) {
  const t = useTheme(MOD); const { checked, source } = useMigration(dest);
  return (
    <Row gap={6}>
      <Icon name={source === "online" ? "RefreshCw" : "Clock"} size={13} color={t.c.muted} />
      <Txt v="tiny" muted style={{ flex: 1 }}>
        Last checked {fmtDate(checked)}{source === "online" ? " · updated online" : " · will refresh when you're online"}. Always confirm on the official page before you act.
      </Txt>
    </Row>
  );
}

/** Status text → chip tone. */
const toneOf = (s) => {
  const x = (s || "").toLowerCase();
  if (/closed|paused|not open|not yet/.test(x)) return "warn";
  if (/open|launched|accepting|invitation|draw/.test(x)) return "ok";
  return "mute";
};

/* ---------------- Canada ---------------- */
function Canada() {
  const t = useTheme(MOD); const { migration: m } = useMigration("CA");
  const ee = m.express_entry; const draws = [...ee.draws].sort((a, b) => (a.date < b.date ? 1 : -1));
  const [prov, setProv] = useState("All");
  const provinces = ["All", ...new Set(m.pnp.map((p) => p.province))];
  return (
    <>
      <Card mod={MOD} style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Txt v="eyebrow">Express Entry · healthcare category</Txt>
          <Txt v="h2">Healthcare Draws in {draws[0] ? draws[0].date.slice(0, 4) : "2026"}</Txt>
          <SourceLine dest="CA" />
        </View>
        <Grid min={130} gap={10}>
          {draws.map((d, k) => (
            <View key={d.date} style={{ flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk, borderLeftWidth: 4, borderLeftColor: PHASE_COLORS[k % 6], gap: 4 }}>
              <Txt v="eyebrow">{fmtDate(d.date)}</Txt>
              <Txt v="h2" style={{ fontVariant: ["tabular-nums"] }}>CRS {d.crs}</Txt>
              <Txt v="tiny" muted>{d.invitations.toLocaleString("en-US")} invitations</Txt>
            </View>
          ))}
        </Grid>
        <Txt v="small" muted>{ee.summary}</Txt>
        {ee.noc ? <Chip mod={MOD} tone="acc" icon="Tag" text={"NOC " + ee.noc.split(" ")[0]} /> : null}
        <LinkRow url={ee.url} label="IRCC rounds of invitations" />
      </Card>

      <SectionTitle eyebrow="Provincial nominee programs" title="Healthcare Streams by Province" sub="Provinces can nominate nurses for permanent residence, usually with a job offer. Status changes often." />
      <Seg mod={MOD} value={prov} onChange={setProv} options={provinces.map((p) => ({ id: p, label: p }))} />
      {m.pnp.filter((p) => prov === "All" || p.province === prov).map((p) => (
        <Card key={p.province + p.stream} mod={MOD} style={{ gap: 8 }}>
          <Txt v="eyebrow">{p.province}</Txt>
          <Txt v="h3">{p.stream}</Txt>
          <View style={{ alignSelf: "flex-start", maxWidth: "100%" }}><Chip tone={toneOf(p.status)} icon="Activity" text={p.status} /></View>
          {p.notes ? <Txt v="small" muted>{p.notes}</Txt> : null}
          <LinkRow url={p.url} />
        </Card>
      ))}
      {m.notes && m.notes.length ? (
        <Card mod={MOD} accent style={{ gap: 8 }}>
          <Row gap={8}><Icon name="Lightbulb" size={18} color={t.tint} /><Txt v="h3" style={{ flex: 1 }}>Good to Know</Txt></Row>
          <Bullets items={m.notes} />
        </Card>
      ) : null}
    </>
  );
}

/* ---------------- Australia ---------------- */
function Australia() {
  const t = useTheme(MOD); const { migration: m } = useMigration("AU");
  return (
    <>
      <Card mod={MOD} style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Txt v="eyebrow">SkillSelect · points-tested visas</Txt>
          <Txt v="h2">Points and Invitations</Txt>
          <SourceLine dest="AU" />
        </View>
        <Grad mod={MOD} style={{ borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Txt v="big" color="#fff">{m.points.minimum}</Txt>
          <Txt v="small" color="rgba(255,255,255,0.95)" style={{ flex: 1 }}>minimum points to lodge an Expression of Interest (189, 190, 491)</Txt>
        </Grad>
        <Txt v="small" muted>{m.points.summary}</Txt>
        {m.rounds && m.rounds.length ? (
          <View style={{ gap: 8 }}>
            <Txt v="smallB">Recent 189 rounds that included nurses</Txt>
            {m.rounds.map((r) => (
              <Row key={r.date + r.visa} gap={10} center={false} style={{ padding: 10, borderRadius: 12, backgroundColor: t.c.sunk }}>
                <Txt v="mono" style={{ width: 96 }}>{fmtDate(r.date)}</Txt>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt v="smallB">Subclass {r.visa}</Txt>
                  {r.notes ? <Txt v="tiny" muted>{r.notes}</Txt> : null}
                </View>
              </Row>
            ))}
            <Note tone="warn" icon="AlertTriangle" title="Point cut-offs not published here">Home Affairs' round results weren't readable when this was checked, so cut-off scores are left out rather than guessed. Check the official SkillSelect page.</Note>
          </View>
        ) : null}
        <LinkRow url="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/invitation-rounds" label="SkillSelect invitation rounds" />
      </Card>

      <Card mod={MOD} style={{ gap: 10 }}>
        <Txt v="eyebrow">Nursing occupations (ANZSCO)</Txt>
        <Txt v="small" muted>Pick the code that matches your experience. ANMAC assesses you against it.</Txt>
        <Grid min={150} gap={8}>
          {m.occupations.map((o) => (
            <View key={o.anzsco} style={{ flexGrow: 1, padding: 10, borderRadius: 12, backgroundColor: t.c.sunk, gap: 2 }}>
              <Txt v="mono" color={t.tint} style={{ fontFamily: FONTS.monoBold }}>{o.anzsco}</Txt>
              <Txt v="small">{o.title.replace(/^Registered Nurses? ?/, "").replace(/^\(|\)$/g, "") || o.title}</Txt>
            </View>
          ))}
        </Grid>
      </Card>

      <SectionTitle eyebrow="State and territory nomination" title="190 and 491 Programs" sub="Each state runs its own program. They reset every July and can close early." />
      <Grid min={260} gap={10}>
        {m.states.map((s, k) => (
          <Card key={s.state} mod={MOD} style={{ gap: 6, flexGrow: 1 }}>
            <Row gap={8}>
              <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, backgroundColor: PHASE_COLORS[k % 6] }}><Txt v="smallB" color="#fff">{s.state}</Txt></View>
              <View style={{ flex: 1 }} />
            </Row>
            <Txt v="small" muted>{s.status}</Txt>
            <LinkRow url={s.url} />
          </Card>
        ))}
      </Grid>

      {m.sid ? (
        <Card mod={MOD} style={{ gap: 8 }}>
          <Txt v="eyebrow">Employer sponsorship</Txt>
          <Txt v="h3">Skills in Demand visa (subclass 482)</Txt>
          <Txt v="small" muted>{m.sid.summary}</Txt>
          <LinkRow url={m.sid.url} />
        </Card>
      ) : null}
      {m.notes && m.notes.length ? (
        <Card mod={MOD} accent style={{ gap: 8 }}>
          <Row gap={8}><Icon name="Lightbulb" size={18} color={t.tint} /><Txt v="h3" style={{ flex: 1 }}>Good to Know</Txt></Row>
          <Bullets items={m.notes} />
        </Card>
      ) : null}
    </>
  );
}

/* ---------------- New Zealand ---------------- */
function NewZealand() {
  const t = useTheme(MOD); const { migration: m } = useMigration("NZ");
  const g = m.green_list;
  return (
    <>
      <Card mod={MOD} style={{ gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Txt v="eyebrow">Green List</Txt>
          <Txt v="h2">Straight to Residence</Txt>
          <SourceLine dest="NZ" />
        </View>
        <Grad mod={MOD} style={{ borderRadius: 16, padding: 14, gap: 4 }}>
          <Txt v="eyebrow" color="rgba(255,255,255,0.85)">Registered nurses</Txt>
          <Txt v="h3" color="#fff">{g.tier}</Txt>
        </Grad>
        <Txt v="small" muted>{g.occupation}</Txt>
        <Txt v="smallB">What you need</Txt>
        <Bullets items={g.requirements} />
        {g.processing ? <Chip tone="mute" icon="Clock" text={g.processing} /> : null}
        <LinkRow url={g.url} label="Straight to Residence Visa" />
      </Card>
      <Card mod={MOD} style={{ gap: 8 }}>
        <Txt v="eyebrow">Come first on a work visa</Txt>
        <Txt v="h3">Accredited Employer Work Visa (AEWV)</Txt>
        <Txt v="small" muted>{m.aewv.summary}</Txt>
        <LinkRow url={m.aewv.url} />
      </Card>
      <Card mod={MOD} style={{ gap: 8 }}>
        <Txt v="eyebrow">Points-based residence</Txt>
        <Txt v="h3">Skilled Migrant Category</Txt>
        <Txt v="small" muted>{m.smc.summary}</Txt>
        <LinkRow url={m.smc.url} />
      </Card>
      {m.notes && m.notes.length ? (
        <Card mod={MOD} accent style={{ gap: 8 }}>
          <Row gap={8}><Icon name="Lightbulb" size={18} color={t.tint} /><Txt v="h3" style={{ flex: 1 }}>Good to Know</Txt></Row>
          <Bullets items={m.notes} />
        </Card>
      ) : null}
    </>
  );
}

export const COUNTRY_HERO = {
  CA: { title: "Canada Migration Monitor", sub: "Express Entry healthcare draws and provincial nominee streams for registered nurses (NOC 31301)." },
  AU: { title: "Australia Migration Monitor", sub: "SkillSelect points, nursing occupations, state nomination and the Skills in Demand visa." },
  NZ: { title: "New Zealand Migration Monitor", sub: "Green List Straight to Residence, the Accredited Employer Work Visa and the Skilled Migrant Category." },
};

export function CountryMonitor({ dest }) {
  if (dest === "CA") return <Canada />;
  if (dest === "AU") return <Australia />;
  if (dest === "NZ") return <NewZealand />;
  return null;
}

/* ---------------- employer and recruiter directory ---------------- */
const TYPE_ICON = { "Public health employer": "Hospital", "Private hospital group": "Building2", "Government program": "Landmark" };
const TYPE_LABEL = { "Public health employer": "Public", "Private hospital group": "Private", "Government program": "Government" };

export function CountryDirectory({ dest }) {
  const t = useTheme(MOD); const d = countryData(dest); const info = destOf(dest);
  const [f, setF] = useState("All");
  if (!d) return null;
  const types = ["All", ...new Set(d.directory.map((x) => x.type))];
  const list = d.directory.filter((x) => f === "All" || x.type === f);
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle eyebrow={`Employers and programs · ${info.flag} ${info.short}`} title="Where Nurses Get Hired"
        sub="Public health employers, private hospital groups and government programs that recruit or support internationally educated nurses. Links go to each organization's own site." />
      <Seg mod={MOD} value={f} onChange={setF} options={types.map((x) => ({ id: x, label: x === "All" ? "All" : TYPE_LABEL[x] || x, icon: TYPE_ICON[x] }))} />
      {list.map((x) => {
        const k = d.directory.indexOf(x);
        const initials = x.name.replace(/[^A-Z]/g, "").slice(0, 2) || x.name[0];
        return (
          <Card key={x.name} mod={MOD} style={{ gap: 10 }}>
            <Row gap={12} center={false}>
              <Grad colors={[PHASE_COLORS[k % 6], PHASE_COLORS[(k + 2) % 6]]} style={{ width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" }}>
                <Txt v="h3" color="#fff">{initials}</Txt>
              </Grad>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="h3">{x.name}</Txt>
                <Txt v="tiny" muted>{x.region}</Txt>
              </View>
            </Row>
            <Chip mod={MOD} tone={x.type === "Government program" ? "acc2" : x.type === "Private hospital group" ? "acc" : "ok"} icon={TYPE_ICON[x.type] || "Building2"} text={x.type} />
            <Txt v="small">{x.model}</Txt>
            {x.notes ? <Txt v="small" muted>{x.notes}</Txt> : null}
            <Row wrap gap={8}>
              {x.careers ? <Btn mod={MOD} small icon="Briefcase" title="Careers" onPress={() => open(x.careers)} /> : null}
              {x.site ? <Btn mod={MOD} small kind="secondary" icon="Globe" title="Website" onPress={() => open(x.site)} /> : null}
            </Row>
          </Card>
        );
      })}
      <Card mod={MOD} style={{ gap: 10, borderColor: t.c.warn }}>
        <Row gap={8}><Icon name="AlertTriangle" size={20} color={t.c.warn} /><Txt v="h3" style={{ flex: 1 }}>Recruitment Safety</Txt></Row>
        <Bullets items={[
          "Public employers and government programs don't charge you to apply or to be hired.",
          "Never pay a recruiter for a job offer, and never hand over your passport.",
          "Check that a migration agent is registered before paying for visa help (Australia: OMARA; Canada: CICC; New Zealand: IAA).",
          "Get the contract and any repayment or bond terms in writing before you resign at home.",
        ]} />
      </Card>
      {d.uncertain && d.uncertain.length ? (
        <Accordion mod={MOD} title="What We Couldn't Confirm" meta={<Icon name="HelpCircle" size={16} color={t.c.muted} />}>
          <Bullets items={d.uncertain} />
        </Accordion>
      ) : null}
      {d.sources && d.sources.length ? (
        <Accordion mod={MOD} title={`Sources (${d.sources.length})`} meta={<Icon name="BookOpen" size={16} color={t.c.muted} />}>
          <View style={{ gap: 8 }}>
            {d.sources.map(([label, url]) => <LinkRow key={url} url={url} label={label} />)}
          </View>
        </Accordion>
      ) : null}
      <Txt v="tiny" muted>Checked {fmtDate(d.checked)}. Listing here is not an endorsement. Hiring and sponsorship are decided by each employer.</Txt>
    </View>
  );
}
