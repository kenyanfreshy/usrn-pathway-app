// Destination switcher (U.S. · Canada · Australia · New Zealand) shown on Today, Roadmap and Visa.
import React from "react";
import { View } from "react-native";
import { Seg, Txt, Row } from "./ui";
import { useApp } from "./state";
import { DESTINATIONS, destOf, destId } from "./data/global";

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
