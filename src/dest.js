// Destination (U.S. · Canada · Australia · New Zealand). The choice lives in the profile and drives the whole app;
// the U.S. is the default on a fresh install. Screens show a small pill that says where the nurse is headed and lets
// them change it; Settings and the first-run welcome card set it too.
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Seg, Txt, Row, Icon, Sheet, Card, Chip, Btn, Select, IconTile, tap } from "./ui";
import { Linking } from "react-native";
import { router } from "expo-router";
import { useTheme } from "./theme";
import { useApp } from "./state";
import { DESTINATIONS, destOf, destId, regionsOf, regionOf, REGION_WORD, phasesFor } from "./data/global";

const group = (n) => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
/** "$1,200" for the U.S., "CAD 1,200" elsewhere. */
export const moneyIn = (dest, n) => (dest === "US" ? "$" + group(n) : destOf(dest).cur + " " + group(n));

/** Hook: { dest, info, setDest } for the destination the nurse picked. */
export function useDest() {
  const { state, dispatch } = useApp();
  const dest = destId(state);
  return { dest, info: destOf(dest), setDest: (v) => dispatch({ type: "profile", patch: { dest: v } }) };
}

export function DestSwitcher({ mod, note }) {
  const { dest, info, setDest } = useDest();
  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Txt v="eyebrow">Destination</Txt>
        <Txt v="smallB" muted>{info.flag} {info.name}</Txt>
      </Row>
      <Seg mod={mod} even value={dest} onChange={setDest} options={DESTINATIONS.map((d) => ({ id: d.id, label: `${d.flag} ${d.id}` }))} />
      {note ? <Txt v="tiny" muted>{note}</Txt> : null}
    </View>
  );
}

/** Destination picker list used in the sheet and the welcome card. */
export function DestChoices({ mod, onPicked }) {
  const { dest, setDest } = useDest(); const t = useTheme(mod);
  return (
    <View style={{ gap: 8 }}>
      {DESTINATIONS.map((d) => {
        const on = d.id === dest;
        return (
          <Pressable key={d.id} onPress={() => { tap(); setDest(d.id); onPicked && onPicked(d.id); }} accessibilityRole="radio" accessibilityState={{ checked: on }}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: on ? 2 : 1,
              borderColor: on ? t.tint : t.c.line, backgroundColor: on ? t.soft : t.c.surface, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
            <Txt v="h2">{d.flag}</Txt>
            <View style={{ flex: 1 }}>
              <Txt v="bodyB">{d.name}</Txt>
              <Txt v="tiny" muted>{d.regulator}</Txt>
            </View>
            {on ? <Icon name="CheckCircle2" size={20} color={t.tint} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Small "Headed to 🇨🇦 Canada · Change" pill. Tapping opens a sheet to switch destination. */
export function DestPill({ mod }) {
  const { info } = useDest(); const t = useTheme(mod); const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => { tap(); setOpen(true); }} accessibilityRole="button" accessibilityLabel={`Destination ${info.name}. Change`}
        style={({ pressed }) => ({ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 7, paddingLeft: 10, paddingRight: 12,
          borderRadius: 99, borderWidth: 1, borderColor: t.c.line, backgroundColor: pressed ? t.c.sunk : t.c.surface })}>
        <Txt v="body">{info.flag}</Txt>
        <Txt v="smallB">Headed to {info.name}</Txt>
        <Txt v="smallB" color={t.tint}>· Change</Txt>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Where Are You Headed?" mod={mod}>
        <Txt v="small" muted>The whole app follows this choice: roadmap, visa, boards, bedside, career and driving. Your progress for each country is kept.</Txt>
        <DestChoices mod={mod} onPicked={() => setOpen(false)} />
      </Sheet>
    </>
  );
}

/* ---------- province choice (Canada) ---------- */
/** Hook: { regions, region, word, pick(code) } for the current destination. pick() also ticks "Pick one province first". */
export function useRegion() {
  const { state, dispatch } = useApp(); const dest = destId(state);
  const regions = regionsOf(dest); const region = regionOf(state); const word = REGION_WORD[dest] || "region";
  const first = phasesFor(dest)[0];
  const pick = (code) => dispatch({ type: "region", dest, code, step: first ? `${first.id}-0` : null });
  return { dest, regions, region, word, pick };
}

/** Dropdown to pick the province (used in Settings and the welcome card). Renders nothing outside Canada. */
export function RegionSelect({ mod, label }) {
  const { regions, region, word, pick } = useRegion();
  if (!regions.length) return null;
  return (
    <Select mod={mod} label={label || `Your ${word}`} value={region ? region.code : ""} placeholder={`Choose a ${word}`}
      options={regions.map((r) => ({ value: r.code, label: `${r.region} · ${r.abbr}` }))} onChange={(v) => v && pick(v)} />
  );
}

/** "Your province" card: the chosen college's rules, then a button to the next step.
 *  from="boards" → "Continue to next step" (opens the roadmap); from="roadmap" → "Change province" (opens the college list). */
export function YourRegionCard({ mod, from }) {
  const t = useTheme(mod); const { regions, region, word } = useRegion();
  if (!regions.length) return null;
  const W = word[0].toUpperCase() + word.slice(1);
  if (!region) {
    return (
      <Card mod={mod} accent style={{ gap: 10 }}>
        <Row gap={12}>
          <IconTile mod={mod} icon="MapPin" size={42} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="eyebrow">Step 1 · Pick your {word}</Txt>
            <Txt v="h3">Each {word} has its own nursing college and rules</Txt>
          </View>
        </Row>
        <Txt v="small" muted>{from === "boards" ? `Pick a college below to set your ${word}. Your roadmap then follows that college's rules.` : `Choose where you'll register first. A license in one ${word} can later be used to apply in another.`}</Txt>
        {from !== "boards" ? <Btn mod={mod} icon="MapPin" title={`Choose My ${W}`} onPress={() => router.push("/boards")} /> : null}
      </Card>
    );
  }
  return (
    <Card mod={mod} accent style={{ gap: 10 }}>
      <Row gap={12} center={false}>
        <View style={{ minWidth: 46, height: 46, paddingHorizontal: 6, borderRadius: 15, backgroundColor: t.tint, alignItems: "center", justifyContent: "center" }}>
          <Txt v="smallB" color="#fff" numberOfLines={1}>{region.code}</Txt>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt v="eyebrow">Your {word}</Txt>
          <Txt v="h3">{region.region}</Txt>
          <Txt v="tiny" muted>{region.name}{region.abbr ? ` (${region.abbr})` : ""}</Txt>
        </View>
        <Chip tone="ok" icon="CheckCircle2" text="Chosen" />
      </Row>
      {region.notes ? <Txt v="small">{region.notes}</Txt> : null}
      {region.tags && region.tags.length ? <Row wrap gap={6}>{region.tags.map((x, k) => <Chip key={x} mod={mod} tone={k % 2 ? "acc2" : "acc"} text={x} />)}</Row> : null}
      <Row wrap gap={8}>
        {from === "boards"
          ? <Btn mod={mod} icon="ArrowRight" title="Continue to Next Step" onPress={() => { tap(); router.push("/roadmap"); }} />
          : <Btn mod={mod} small kind="secondary" icon="ArrowRightLeft" title={`Change ${W}`} onPress={() => { tap(); router.push("/boards"); }} />}
        {region.url ? <Btn mod={mod} small kind="secondary" icon="Globe" title="College Website" onPress={() => { tap(); Linking.openURL(region.url).catch(() => {}); }} /> : null}
      </Row>
      {from === "boards" ? <Txt v="tiny" muted>Your roadmap now follows {region.abbr || region.region}'s rules, and the first step is checked off.</Txt> : null}
    </Card>
  );
}
