// Module 2 · Boards of Nursing: compare state boards, then plan an endorsement (Pro).
import React, { useMemo, useState } from "react";
import { View, TextInput, Pressable, Platform, Linking } from "react-native";
import { Screen, Hero, Card, Row, Txt, Icon, Select, Check, Chip, Note, Bullets, Btn, tap, Grid } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { ProGate } from "../src/pro";
import { BOARDS, ENDORSE, BOARDS_META } from "../src/data/content";
import { Accordion } from "../src/ui";
import { useApp } from "../src/state";
import { destId, destOf, lifeOf, WORDS } from "../src/data/global";
import { DestPill, YourRegionCard, useRegion } from "../src/dest";
import { router } from "expo-router";
import { SourcesBlock } from "../src/career/country";
import { fmtDate } from "../src/util";

const MOD = "boards";

function SearchField({ value, onChangeText, placeholder = "State or CES agency" }) {
  const t = useTheme(MOD); const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 5 }}>
      <Txt v="smallB" muted>Search</Txt>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: focus ? t.tint : t.c.line, borderRadius: 12, paddingHorizontal: 12, backgroundColor: t.c.surface }}>
        <Icon name="Search" size={17} color={focus ? t.tint : t.c.muted} />
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={t.c.muted}
          autoCorrect={false} autoCapitalize="none" returnKeyType="search" accessibilityLabel="Search boards"
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, paddingVertical: Platform.OS === "ios" ? 12 : 9, color: t.c.ink, fontSize: 15, fontFamily: FONTS.body }} />
        {value ? (
          <Pressable onPress={() => { tap(); onChangeText(""); }} hitSlop={10} accessibilityLabel="Clear search">
            <Icon name="XCircle" size={17} color={t.c.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function BoardCard({ b }) {
  const t = useTheme(MOD);
  const nlc = b.nlc === "Yes" ? <Chip mod={MOD} tone="acc2" icon="Network" text="Compact" /> : b.nlc === "No" ? <Chip tone="mute" text="NLC: No" /> : <Chip tone="warn" icon="AlertTriangle" text={"NLC: " + b.nlc} />;
  return (
    <Card mod={MOD} style={{ gap: 10 }}>
      <Row gap={12} center={false}>
        <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: t.soft, borderWidth: 1, borderColor: t.tint, alignItems: "center", justifyContent: "center" }}>
          <Txt v="h3" color={t.tint}>{b.st}</Txt>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="h3">{b.name}</Txt>
          <Txt v="tiny" muted>CES accepted: {b.ces}</Txt>
        </View>
      </Row>
      <Txt v="small" muted>{b.note}</Txt>
      {b.english ? <Txt v="tiny" muted><Txt v="tiny" style={{ fontFamily: FONTS.bodyBold }}>English: </Txt>{b.english}</Txt> : null}
      <Row wrap gap={6}>
        {b.ssn === true ? <Chip tone="warn" icon="IdCard" text="SSN to apply" /> : b.ssn === false ? <Chip tone="ok" icon="CheckCircle2" text="Can apply without SSN" /> : <Chip tone="mute" icon="IdCard" text="SSN: check board" />}
        <Chip mod={MOD} tone="acc" icon="DollarSign" text={b.fee != null ? "$" + b.fee + " fee" : "Fee: check board"} />
        {b.weeks ? <Chip mod={MOD} tone="acc" icon="Clock" text={b.weeks + " wks"} /> : null}
        {b.juris ? <Chip mod={MOD} tone="acc2" icon="Gavel" text="Jurisprudence exam" /> : <Chip tone="mute" text="No jurisprudence" />}
        {nlc}
      </Row>
      {b.url ? <Btn mod={MOD} small kind="secondary" icon="Globe" title="Board Website" onPress={() => { tap(); Linking.openURL(b.url).catch(() => {}); }} style={{ alignSelf: "flex-start" }} /> : null}
    </Card>
  );
}

function GlanceTile({ label, value }) {
  const t = useTheme(MOD);
  return (
    <View style={{ flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk, gap: 4 }}>
      <Txt v="eyebrow">{label}</Txt>
      <Txt v="smallB">{value}</Txt>
    </View>
  );
}

function EndorsementWizard() {
  const t = useTheme(MOD);
  const [from, setFrom] = useState("NY"); const [to, setTo] = useState("TX");
  const src = BOARDS.find((b) => b.st === from), dst = BOARDS.find((b) => b.st === to), rule = ENDORSE[to];
  const bothCompact = src.nlc === "Yes" && dst.nlc === "Yes";
  const opts = BOARDS.map((b) => ({ value: b.st, label: b.name }));
  return (
    <Card mod={MOD} accent style={{ gap: 14 }}>
      <Row gap={10}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: t.soft, alignItems: "center", justifyContent: "center" }}><Icon name="ArrowRightLeft" size={18} color={t.tint} /></View>
        <Txt v="h3" style={{ flex: 1 }}>Endorsement Pathway Wizard</Txt>
      </Row>
      <Select mod={MOD} label="I passed the NCLEX-RN or hold a license in" value={from} options={opts} onChange={setFrom} />
      <Select mod={MOD} label="I want to work in" value={to} options={opts} onChange={setTo} />
      {from === to ? (
        <Note mod={MOD}>{"You already hold a license in " + dst.name + ". No endorsement needed."}</Note>
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ gap: 8 }}>
            <Txt v="eyebrow">Steps · {src.st} → {dst.st}</Txt>
            {bothCompact ? (
              <Note mod={MOD} tone="acc2" icon="Info">{"Both are compact states. If " + dst.name + " becomes your primary state of residence, apply there for a new multistate license; you can keep practicing on your current multistate license until it is issued. If you only travel there to work, your current multistate license may already cover it."}</Note>
            ) : null}
            <Bullets numbered items={[
              "Create an account and start the endorsement application with the " + dst.name + " board",
              "Verify your " + src.name + " license through Nursys.com (about $30 per board)",
              ...rule.extra,
              "Submit proof of identity and immigration/work authorization as the board requests",
              "Track your status; most boards email a temporary or permanent license number",
            ]} />
          </View>
          <View style={{ gap: 8 }}>
            <Txt v="eyebrow">At a glance</Txt>
            <Grid min={140} gap={8}>
              {[["Application fee", rule.fee], ["Typical time", rule.time], ["Practice hours", rule.hours], ["Compact", dst.nlc]].map(([k, v]) => <GlanceTile key={k} label={k} value={v} />)}
            </Grid>
          </View>
        </View>
      )}
    </Card>
  );
}

/* ---------------- Canada, Australia, New Zealand ---------------- */
function RegulatorCard({ r }) {
  const t = useTheme(MOD); const { regions, region, word, pick } = useRegion();
  const canPick = regions.includes(r); const mine = !!region && region.code === r.code;
  return (
    <Card mod={MOD} accent={mine} style={{ gap: 10, borderColor: mine ? t.tint : undefined, borderWidth: mine ? 2 : undefined }}>
      <Row gap={12} center={false}>
        <View style={{ minWidth: 46, height: 46, paddingHorizontal: 6, borderRadius: 15, backgroundColor: t.soft, borderWidth: 1, borderColor: t.tint, alignItems: "center", justifyContent: "center" }}>
          <Txt v="smallB" color={t.tint} numberOfLines={1} adjustsFontSizeToFit>{r.code}</Txt>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="h3">{r.name}</Txt>
          <Txt v="tiny" muted>{[r.abbr, r.region].filter(Boolean).join(" · ")}</Txt>
        </View>
      </Row>
      {r.notes ? <Txt v="small" muted>{r.notes}</Txt> : null}
      {r.tags && r.tags.length ? <Row wrap gap={6}>{r.tags.map((x, k) => <Chip key={x} mod={MOD} tone={k % 2 ? "acc2" : "acc"} text={x} />)}</Row> : null}
      <Row wrap gap={8}>
        {canPick && !mine ? <Btn mod={MOD} small icon="MapPin" title={`Choose this ${word}`} onPress={() => pick(r.code)} /> : null}
        {mine ? <Btn mod={MOD} small icon="ArrowRight" title="Continue to Next Step" onPress={() => { tap(); router.push("/roadmap"); }} /> : null}
        {r.url ? <Btn mod={MOD} small kind="secondary" icon="Globe" title="Official Site" onPress={() => { tap(); Linking.openURL(r.url).catch(() => {}); }} /> : null}
      </Row>
      {mine ? <Chip mod={MOD} tone="ok" icon="CheckCircle2" text={`Your ${word}`} /> : null}
    </Card>
  );
}

function Regulators({ dest }) {
  const t = useTheme(MOD); const life = lifeOf(dest); const info = destOf(dest); const R = life.regulators;
  const [q, setQ] = useState("");
  const rows = R.list.filter((r) => [r.name, r.abbr, r.region, r.code, ...(r.tags || [])].join(" ").toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title={WORDS[dest].boards} />
      <Hero mod={MOD} icon="Landmark" eyebrow={`Module 2 · Licensing · ${info.flag} ${info.short}`} title={R.title} sub={R.intro}
        stats={[["Listed", R.list.length], ["Destination", info.short], ["Checked", fmtDate(life.checked)]]} />
      <DestPill mod={MOD} />
      <YourRegionCard mod={MOD} from="boards" />
      {R.list.length > 5 ? <Card mod={MOD}><SearchField value={q} onChangeText={setQ} placeholder="Province, state or name" /></Card> : null}
      {rows.map((r) => <RegulatorCard key={r.code + r.name} r={r} />)}
      {rows.length === 0 ? <Note mod={MOD} icon="SearchX">No matches. Clear the search to see everything.</Note> : null}
      <Card mod={MOD} accent style={{ gap: 12 }}>
        <Row gap={10}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: t.soft, alignItems: "center", justifyContent: "center" }}><Icon name="ArrowRightLeft" size={18} color={t.tint} /></View>
          <Txt v="h3" style={{ flex: 1 }}>{R.mobility.title}</Txt>
        </Row>
        <Bullets numbered items={R.mobility.steps} />
        {R.mobility.notes ? <Note mod={MOD} tone="acc2" icon="Info">{R.mobility.notes}</Note> : null}
      </Card>
      <SourcesBlock dest={dest} mod={MOD} />
      <Txt v="tiny" muted>Requirements change. Confirm every step on the regulator's own website before you apply.</Txt>
    </Screen>
  );
}

export default function Boards() {
  const { state } = useApp(); const dest = destId(state);
  if (dest !== "US") return <Regulators dest={dest} />;
  return <UsBoards />;
}

function UsBoards() {
  const t = useTheme(MOD);
  const [q, setQ] = useState(""); const [noSSN, setNoSSN] = useState(false); const [noJur, setNoJur] = useState(false); const [compact, setCompact] = useState(false);
  const [sort, setSort] = useState("fee");
  const rows = useMemo(() => {
    let r = BOARDS.filter((b) => (b.name + b.st + b.ces).toLowerCase().includes(q.trim().toLowerCase()));
    if (noSSN) r = r.filter((b) => b.ssn === false);
    if (noJur) r = r.filter((b) => !b.juris);
    if (compact) r = r.filter((b) => b.nlc === "Yes");
    const wk = (b) => { const n = parseInt(String(b.weeks).replace(/[^0-9]/g, " ").trim(), 10); return isNaN(n) ? 999 : n; };
    const fee = (b) => (b.fee == null ? 99999 : b.fee);
    return [...r].sort((a, b) => sort === "fee" ? fee(a) - fee(b) : sort === "weeks" ? wk(a) - wk(b) : a.name.localeCompare(b.name));
  }, [q, noSSN, noJur, compact, sort]);
  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title="State Boards" />
      <Hero mod={MOD} icon="Landmark" eyebrow="Module 2 · Boards of Nursing" title="Pick the Right State Board"
        sub="Compare boards that accept internationally educated applicants, then plan your move to another state."
        stats={[["Boards listed", BOARDS.length], ["No SSN to apply", BOARDS.filter((b) => b.ssn === false).length], ["Compact states", BOARDS.filter((b) => b.nlc === "Yes").length]]} />
      <DestPill mod={MOD} />
      <Note mod={MOD} icon="CheckCircle2">Checked against each board's own website on {fmtDate(BOARDS_META.checked)}. Fees and rules change often, so confirm on the board's site before you pay or apply.</Note>
      <Card mod={MOD} style={{ gap: 12 }}>
        <SearchField value={q} onChangeText={setQ} />
        <Select mod={MOD} label="Sort by" value={sort} onChange={setSort}
          options={[{ value: "fee", label: "Lowest fee" }, { value: "weeks", label: "Fastest processing" }, { value: "name", label: "State name" }]} />
        <View>
          <Check mod={MOD} checked={noSSN} onToggle={() => setNoSSN(!noSSN)} label="No SSN needed to apply" />
          <Check mod={MOD} checked={noJur} onToggle={() => setNoJur(!noJur)} label="No jurisprudence exam" />
          <Check mod={MOD} checked={compact} onToggle={() => setCompact(!compact)} label="Compact (NLC) state" />
        </View>
      </Card>
      <Row gap={8}>
        <Txt v="eyebrow" style={{ flex: 1 }}>{rows.length} of {BOARDS.length} boards</Txt>
      </Row>
      {rows.map((b) => <BoardCard key={b.st} b={b} />)}
      {rows.length === 0 ? (
        <Card mod={MOD} style={{ alignItems: "center", paddingVertical: 24 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: t.soft, alignItems: "center", justifyContent: "center" }}><Icon name="SearchX" size={22} color={t.tint} /></View>
          <Txt v="bodyB">No matches</Txt>
          <Txt v="small" muted style={{ textAlign: "center" }}>No boards match these filters. Clear a filter to see more.</Txt>
        </Card>
      ) : null}
      <Txt v="tiny" muted>Fees shown are board application fees only. Pearson VUE NCLEX registration is separate: $200, rising to $350 for registrations from Feb 1, 2027.</Txt>
      <Accordion mod={MOD} title="What We Couldn't Confirm" meta={<Icon name="HelpCircle" size={16} color={t.c.muted} />}>
        <Bullets items={BOARDS_META.uncertain} />
      </Accordion>
      <Accordion mod={MOD} title={`Sources (${BOARDS_META.sources.length})`} meta={<Icon name="BookOpen" size={16} color={t.c.muted} />}>
        <View style={{ gap: 8 }}>
          {BOARDS_META.sources.map(([label, url]) => (
            <Pressable key={url + label} onPress={() => { tap(); Linking.openURL(url).catch(() => {}); }} accessibilityRole="link">
              <Row gap={6} center={false}><View style={{ paddingTop: 2 }}><Icon name="ExternalLink" size={13} color={t.tint} /></View><Txt v="small" color={t.tint} style={{ flex: 1 }}>{label}</Txt></Row>
            </Pressable>
          ))}
        </View>
      </Accordion>
      <ProGate feature="Endorsement Pathway Wizard" desc="Step-by-step Nursys transfer between states" mod="boards">
        <EndorsementWizard />
      </ProGate>
    </Screen>
  );
}
