// Settings → References & Study Resources: APA 7th citations for the sources behind the question bank, English prep
// and the country pathways, plus the review books and official sites nursing educators recommend.
// Opened from Settings and from the "Sources & references" link under every question's rationale.
import React, { useState } from "react";
import { View, Pressable, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Screen, Hero, Card, Row, Txt, Icon, Seg, Note, tap } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { useTheme } from "../src/theme";
import { REF_TABS, REFS, REF_NOTICE, REF_QUESTIONS_NOTE, citeText } from "../src/data/references";

const MOD = "more";

function Pill({ icon, label, onPress, active, a11y }) {
  const t = useTheme(MOD);
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={a11y || label} hitSlop={6}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
        borderWidth: 1, borderColor: active ? t.c.ok : t.tint, backgroundColor: active ? t.c.ok : pressed ? t.soft : "transparent" })}>
      <Icon name={icon} size={15} color={active ? "#fff" : t.tint} />
      <Txt v="smallB" color={active ? "#fff" : t.tint}>{label}</Txt>
    </Pressable>
  );
}

function RefCard({ r }) {
  const t = useTheme(MOD); const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await Clipboard.setStringAsync(citeText(r)); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) {}
  };
  return (
    <Card mod={MOD} style={{ gap: 10 }}>
      {/* APA reference with a hanging-indent look: first line flush, the rest indented by the left rule. */}
      <View style={{ borderLeftWidth: 3, borderLeftColor: t.tint, paddingLeft: 12 }} accessible accessibilityLabel={`Citation: ${citeText(r)}`}>
        <Txt v="body">
          {r.cite.map(([text, style], i) => <Txt key={i} v="body" style={style === "i" ? { fontStyle: "italic" } : null}>{text}</Txt>)}
        </Txt>
      </View>
      {r.note ? <Txt v="small" muted>{r.note}</Txt> : null}
      <Row gap={8} wrap>
        <Pill icon={copied ? "Check" : "Copy"} label={copied ? "Copied!" : "Copy APA Citation"} active={copied} onPress={copy} />
        {r.url ? <Pill icon="ExternalLink" label="Visit Official Resource" a11y={`Open ${r.url}`} onPress={() => Linking.openURL(r.url).catch(() => {})} /> : null}
      </Row>
    </Card>
  );
}

export default function References() {
  const p = useLocalSearchParams();
  const [tab, setTab] = useState(REF_TABS.some((x) => x.id === p.tab) ? p.tab : "standards");
  const list = REFS[tab] || [];
  let lastGroup = null;
  return (
    <Screen mod={MOD}>
      <BackRow mod={MOD} title="References & Study Resources" />
      <Hero mod={MOD} icon="BookOpenCheck" eyebrow="Sources · APA 7th edition" title="References & Study Resources"
        sub="Where NurseBound's content comes from, and the books and official sites worth your study time." />
      <Note mod={MOD} tone="warn" icon="Scale" title="Educational use & legal notice">{REF_NOTICE}</Note>
      {tab === "standards" ? <Note mod={MOD} icon="ShieldCheck" title="About our questions">{REF_QUESTIONS_NOTE}</Note> : null}
      <Seg mod={MOD} value={tab} onChange={setTab} options={REF_TABS} />
      {list.map((r, i) => {
        const head = r.group && r.group !== lastGroup ? r.group : null; lastGroup = r.group || lastGroup;
        return (
          <View key={i} style={{ gap: 8 }}>
            {head ? <Txt v="eyebrow" style={{ marginTop: 4 }}>{head}</Txt> : null}
            <RefCard r={r} />
          </View>
        );
      })}
      <Txt v="tiny" muted>Citations follow APA 7th edition. Titles are in italics; copied citations are plain text, so add italics when you paste them into a document.</Txt>
    </Screen>
  );
}
