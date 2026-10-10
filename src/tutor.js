// "Meet your app developer, tutor and author" card, shown on the NCLEX and Bedside screens.
// Edit TUTOR to change the name, credentials or bio.
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Card, Row, Txt, Grad, tap } from "./ui";
import { useTheme } from "./theme";

export const TUTOR = {
  name: "A. Korir",
  initials: "AK",
  creds: [
    ["MSN", "Master of Science in Nursing: graduate degree in nursing."],
    ["APRN", "Advanced Practice Registered Nurse: licensed for advanced clinical practice beyond the RN role."],
    ["CCRN-CMC", "Critical Care Registered Nurse certification (AACN), with the Cardiac Medicine subspecialty."],
  ],
  bio: "Author of multiple nursing books, and the app developer and creator of NurseBound's NCLEX-RN practice, NGN case studies and bedside lessons, all written for internationally educated nurses preparing for the bedside in the U.S., Canada, Australia and New Zealand.",
  role: "Meet Your App Developer / Tutor / Author",
};

export function TutorCard({ mod }) {
  const t = useTheme(mod); const [open, setOpen] = useState(null);
  return (
    <Card mod={mod} style={{ gap: 12 }}>
      <Txt v="eyebrow">{TUTOR.role}</Txt>
      <Row gap={14}>
        <Grad mod={mod} style={{ width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" }}>
          <Txt v="h2" color="#fff">{TUTOR.initials}</Txt>
        </Grad>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt v="h3">{TUTOR.name}, {TUTOR.creds.map((c) => c[0]).join(", ")}</Txt>
          <Row gap={6} style={{ flexWrap: "wrap" }}>
            {TUTOR.creds.map(([c]) => {
              const on = open === c;
              return (
                <Pressable key={c} onPress={() => { tap(); setOpen(on ? null : c); }} accessibilityRole="button" accessibilityState={{ expanded: on }} accessibilityLabel={`What ${c} means`}
                  style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: on ? t.tint : t.soft }}>
                  <Txt v="eyebrow" color={on ? "#fff" : t.tint}>{c}</Txt>
                </Pressable>
              );
            })}
          </Row>
        </View>
      </Row>
      {open ? <Txt v="small" muted>{TUTOR.creds.find((c) => c[0] === open)[1]}</Txt> : null}
      <Txt v="small">{TUTOR.bio}</Txt>
    </Card>
  );
}
