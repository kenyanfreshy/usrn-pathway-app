// Module 2 · Boards of Nursing: compare state boards, then plan an endorsement (Pro).
import React, { useMemo, useState } from "react";
import { View, TextInput, Pressable, Platform } from "react-native";
import { Screen, Hero, Card, Row, Txt, Icon, Select, Check, Chip, Note, Bullets, tap, Grid } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme, FONTS } from "../src/theme";
import { ProGate } from "../src/pro";
import { BOARDS, ENDORSE } from "../src/data/content";

const MOD = "boards";

function SearchField({ value, onChangeText }) {
  const t = useTheme(MOD); const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 5 }}>
      <Txt v="smallB" muted>Search</Txt>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: focus ? t.tint : t.c.line, borderRadius: 12, paddingHorizontal: 12, backgroundColor: t.c.surface }}>
        <Icon name="Search" size={17} color={focus ? t.tint : t.c.muted} />
        <TextInput value={value} onChangeText={onChangeText} placeholder="State or CES agency" placeholderTextColor={t.c.muted}
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
  const nlc = b.nlc === "Yes" ? <Chip mod={MOD} tone="acc2" icon="Network" text="Compact" /> : b.nlc === "No" ? <Chip tone="mute" text="NLC: No" /> : <Chip tone="warn" icon="AlertTriangle" text="NLC: Verify" />;
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
      <Row wrap gap={6}>
        {b.ssn ? <Chip tone="warn" icon="IdCard" text="SSN at start" /> : <Chip tone="ok" icon="CheckCircle2" text="No SSN needed" />}
        <Chip mod={MOD} tone="acc" icon="DollarSign" text={"$" + b.fee + " fee"} />
        <Chip mod={MOD} tone="acc" icon="Clock" text={b.weeks + " wks"} />
        {b.juris ? <Chip mod={MOD} tone="acc2" icon="Gavel" text="Jurisprudence exam" /> : <Chip tone="mute" text="No jurisprudence" />}
        {nlc}
      </Row>
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
  const [from, setFrom] = useState("NY"); const [to, setTo] = useState("CA");
  const src = BOARDS.find((b) => b.st === from), dst = BOARDS.find((b) => b.st === to), rule = ENDORSE[to];
  const bothCompact = src.nlc === "Yes" && dst.nlc === "Yes";
  const opts = BOARDS.map((b) => ({ value: b.st, label: b.name }));
  return (
    <Card mod={MOD} accent style={{ gap: 14 }}>
      <Row gap={10}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: t.soft, alignItems: "center", justifyContent: "center" }}><Icon name="ArrowRightLeft" size={18} color={t.tint} /></View>
        <Txt v="h3" style={{ flex: 1 }}>Endorsement pathway wizard</Txt>
      </Row>
      <Select mod={MOD} label="I passed NCLEX / hold a license in" value={from} options={opts} onChange={setFrom} />
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

export default function Boards() {
  const t = useTheme(MOD);
  const [q, setQ] = useState(""); const [noSSN, setNoSSN] = useState(false); const [noJur, setNoJur] = useState(false); const [compact, setCompact] = useState(false);
  const [sort, setSort] = useState("fee");
  const rows = useMemo(() => {
    let r = BOARDS.filter((b) => (b.name + b.st + b.ces).toLowerCase().includes(q.trim().toLowerCase()));
    if (noSSN) r = r.filter((b) => !b.ssn);
    if (noJur) r = r.filter((b) => !b.juris);
    if (compact) r = r.filter((b) => b.nlc === "Yes");
    const wk = (b) => parseInt(b.weeks, 10);
    return [...r].sort((a, b) => sort === "fee" ? a.fee - b.fee : sort === "weeks" ? wk(a) - wk(b) : a.name.localeCompare(b.name));
  }, [q, noSSN, noJur, compact, sort]);
  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title="State boards" />
      <Hero mod={MOD} icon="Landmark" eyebrow="Module 2 · Boards of Nursing" title="Pick the right state board"
        sub="Compare boards that accept internationally educated applicants, then plan your move to another state."
        stats={[["Boards listed", BOARDS.length], ["No SSN to apply", BOARDS.filter((b) => !b.ssn).length], ["Compact states", BOARDS.filter((b) => b.nlc === "Yes").length]]} />
      <Note tone="warn" icon="AlertTriangle">Figures here are sample prototype data, not verified board requirements. Fees and rules change often — confirm every item on the board's own website before you apply.</Note>
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
      <Txt v="tiny" muted>Fees shown are board application fees only. Pearson VUE NCLEX registration ($200) is separate.</Txt>
      <ProGate feature="Endorsement pathway wizard" desc="Step-by-step Nursys transfer between states" mod="boards">
        <EndorsementWizard />
      </ProGate>
    </Screen>
  );
}
