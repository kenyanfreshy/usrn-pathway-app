// Scores: the destination's minimums (OET and IELTS side by side), sitting/combining rules, a score checker that
// compares the nurse's own results with every destination, and "Save to Document Vault" with the 2-year expiry.
import React, { useState } from "react";
import { View, Linking } from "react-native";
import { Card, Row, Txt, Btn, Chip, Note, Icon, Seg, Field, DateField, Grid, tap, buzz } from "../ui";
import { useTheme, FONTS } from "../theme";
import { useApp } from "../state";
import { destId, destOf } from "../data/global";
import { addYears, isISO, uid, fmtDate, daysUntil } from "../util";
import { JURIS, SKILLS, CA_PROVINCES, jurisFor, juris, check, combineText, oetGrade } from "./rules";

const fmt = (test, v) => (v == null ? "—" : test === "oet" ? `${v} (${oetGrade(v)})` : Number(v).toFixed(1));

function Matrix({ j, mod }) {
  const t = useTheme(mod);
  const col = (test, title) => {
    const req = j[test];
    return (
      <View style={{ flexGrow: 1, flexBasis: 150, padding: 12, borderRadius: 14, backgroundColor: req ? t.c.sunk : t.c.critSoft, gap: 6 }}>
        <Txt v="smallB">{title}</Txt>
        {!req ? <Txt v="small" color={t.c.crit}>Not accepted here</Txt> : (
          <>
            {test === "ielts" && req.overall != null ? <Row style={{ justifyContent: "space-between" }}><Txt v="small">Overall</Txt><Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{fmt(test, req.overall)}</Txt></Row> : null}
            {SKILLS.map(([k, label]) => (
              <Row key={k} style={{ justifyContent: "space-between" }}>
                <Txt v="small">{label}</Txt>
                <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{req[k] != null ? fmt(test, req[k]) : "no minimum"}</Txt>
              </Row>
            ))}
          </>
        )}
      </View>
    );
  };
  return <Row wrap gap={10} center={false}>{col("oet", "OET Nursing")}{col("ielts", "IELTS Academic")}</Row>;
}

function Checker({ j, mod }) {
  const t = useTheme(mod); const { state, dispatch } = useApp();
  const saved = (state.english && state.english.mine) || {};
  const [test, setTest] = useState(saved.test || "oet");
  const [sc, setSc] = useState(saved.scores || {});
  const [date, setDate] = useState(saved.date || "");
  const [msg, setMsg] = useState("");
  const set = (k) => (v) => { const n = { ...sc, [k]: v.replace(/[^\d.]/g, "") }; setSc(n); dispatch({ type: "english", patch: { mine: { test, scores: n, date } } }); };
  const res = check(j, test, sc);
  const others = JURIS.filter((x) => x.id !== j.id).map((x) => ({ x, r: check(x, test, sc) }));
  const age = isISO(date) ? -daysUntil(date) : null;
  const save = () => {
    if (!isISO(date)) { setMsg("Add the date you took the test first."); return; }
    const parts = [test === "ielts" && sc.overall ? `Overall ${sc.overall}` : null, ...SKILLS.map(([k]) => (sc[k] ? `${k} ${sc[k]}` : null))].filter(Boolean).join(" · ");
    dispatch({ type: "addDoc", doc: { id: uid(), title: `${test === "oet" ? "OET Nursing" : "IELTS Academic"} result${parts ? ` (${parts})` : ""}`, cat: "English test", file: "", issued: date, expires: addYears(date, 2) } });
    buzz(); setMsg(`Saved to your Document Vault. It's marked to expire ${fmtDate(addYears(date, 2))}, 2 years after the test. Turn on expiry alerts in the Roadmap's Document Vault to get reminders.`);
  };
  return (
    <Card mod={mod} style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <Txt v="eyebrow">Check my scores</Txt>
        <Txt v="h3">Did I meet the minimum?</Txt>
      </View>
      <Seg mod={mod} even value={test} onChange={(v) => { setTest(v); dispatch({ type: "english", patch: { mine: { test: v, scores: sc, date } } }); }} options={[{ id: "oet", label: "OET Nursing" }, { id: "ielts", label: "IELTS Academic" }]} />
      <Grid min={130} gap={8}>
        {test === "ielts" ? <Field mod={mod} style={{ flexGrow: 1 }} label="Overall" value={sc.overall} onChangeText={set("overall")} keyboardType="decimal-pad" mono placeholder="7.0" /> : null}
        {SKILLS.map(([k, label]) => (
          <Field key={k} mod={mod} style={{ flexGrow: 1 }} label={label} value={sc[k]} onChangeText={set(k)} keyboardType={test === "oet" ? "number-pad" : "decimal-pad"} mono placeholder={test === "oet" ? "350" : "7.0"} />
        ))}
      </Grid>
      <DateField mod={mod} label="Test date" value={date} onChange={(v) => { setDate(v); dispatch({ type: "english", patch: { mine: { test, scores: sc, date: v } } }); }} />
      {!res.accepted ? (
        <Note mod={mod} tone="crit" icon="XCircle">{j.name} doesn't accept {test === "oet" ? "OET" : "IELTS Academic"}.</Note>
      ) : (
        <View style={{ gap: 6 }}>
          {res.rows.map((r) => (
            <Row key={r.k} gap={10} style={{ padding: 10, borderRadius: 12, backgroundColor: r.got == null ? t.c.sunk : r.ok ? t.c.okSoft : t.c.critSoft }}>
              <Icon name={r.got == null ? "Circle" : r.ok ? "CheckCircle2" : "XCircle"} size={18} color={r.got == null ? t.c.muted : r.ok ? t.c.ok : t.c.crit} />
              <Txt v="smallB" style={{ flex: 1 }}>{r.label}</Txt>
              <Txt v="mono">{r.got == null ? "—" : fmt(test, r.got)} / need {fmt(test, r.min)}</Txt>
            </Row>
          ))}
          <Note mod={mod} tone={res.missing ? "acc" : res.pass ? "ok" : "warn"} icon={res.missing ? "Info" : res.pass ? "CheckCircle2" : "AlertTriangle"}>
            {res.missing ? "Enter every score to see your result." : res.pass ? `These scores meet ${j.name}'s minimums.` : `Not yet. ${combineText(j)}`}
          </Note>
        </View>
      )}
      {age !== null && age > 730 ? <Note mod={mod} tone="warn" icon="Clock">This test is more than 2 years old. Most regulators won't accept it now.</Note> : null}
      {!res.missing ? (
        <View style={{ gap: 6 }}>
          <Txt v="smallB" muted>Same scores elsewhere</Txt>
          <Row wrap gap={6}>
            {others.map(({ x, r }) => <Chip key={x.id} tone={!r.accepted ? "mute" : r.pass ? "ok" : "warn"} icon={!r.accepted ? "X" : r.pass ? "Check" : "AlertTriangle"} text={`${destOf(x.dest).flag} ${x.province || x.dest}${!r.accepted ? " · not accepted" : r.pass ? " · meets" : " · short"}`} />)}
          </Row>
        </View>
      ) : null}
      <Btn mod={mod} icon="FileCheck" title="Save to Document Vault" onPress={save} />
      {msg ? <Txt v="small" color={t.tint}>{msg}</Txt> : null}
      <Txt v="tiny" muted>A practice check against published minimums, not an official decision. Your regulator decides.</Txt>
    </Card>
  );
}

export function Scores({ mod }) {
  const t = useTheme(mod); const { state } = useApp(); const dest = destId(state);
  const [prov, setProv] = useState(null);
  const j = jurisFor(state, dest === "CA" && prov ? "CA-" + prov : null);
  return (
    <View style={{ gap: 12 }}>
      <Card mod={mod} style={{ gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Txt v="eyebrow">Your target · {destOf(j.dest).flag} {j.name}</Txt>
          <Txt v="h3">{j.body}</Txt>
        </View>
        {dest === "CA" ? <Seg mod={mod} even value={j.province} onChange={setProv} options={CA_PROVINCES.map((p) => ({ id: p, label: { ON: "Ontario", BC: "B.C.", AB: "Alberta" }[p] }))} /> : null}
        <Matrix j={j} mod={mod} />
        <View style={{ gap: 6 }}>
          <Row gap={8} center={false}><Icon name="Layers" size={16} color={t.tint} /><Txt v="small" style={{ flex: 1 }}><Txt v="smallB">Combining sittings: </Txt>{combineText(j)}</Txt></Row>
          {j.validity ? <Row gap={8} center={false}><Icon name="Clock" size={16} color={t.tint} /><Txt v="small" style={{ flex: 1 }}><Txt v="smallB">How recent: </Txt>{j.validity}</Txt></Row> : null}
          {j.notes ? <Txt v="small" muted>{j.notes}</Txt> : null}
        </View>
        {j.url ? <Btn mod={mod} small kind="secondary" icon="Globe" title="Official requirements" onPress={() => { tap(); Linking.openURL(j.url).catch(() => {}); }} style={{ alignSelf: "flex-start" }} /> : null}
      </Card>
      <Checker j={j} mod={mod} />
    </View>
  );
}
