// Roadmap tab: 6-phase milestone tracker, personalized timeline, cost tracker and document vault.
import React, { useEffect, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { Screen, Hero, Card, Row, Txt, Bar, Check, Chip, Note, Btn, Field, DateField, Select, SectionTitle, Icon, Grad, IconTile, tap, Grid } from "../../src/ui";
import { useTheme, mix, FONTS } from "../../src/theme";
import { useApp, phaseStatus } from "../../src/state";
import { usePro, ProGate } from "../../src/pro";
import { askPermission, scheduleExpiryAlerts, cancelAlerts } from "../../src/notify";
import { today, todayKey, daysUntil, fmtDate, addYears, isISO, money, uid, addMonths, monYr } from "../../src/util";
import { PHASES, DOC_STYLE, DOC_CATS, BULLETIN, PHASE_COLORS, DUR } from "../../src/data/content";

const MOD = "roadmap";

export default function Roadmap() {
  const { state, dispatch } = useApp();
  const t = useTheme(MOD);
  const total = PHASES.reduce((n, p) => n + p.steps.length, 0);
  const done = Object.keys(state.steps).filter((k) => state.steps[k]).length;
  const pct = Math.round((done / total) * 100);
  const costLo = PHASES.reduce((n, p) => n + p.cost[0], 0), costHi = PHASES.reduce((n, p) => n + p.cost[1], 0);
  const spentLo = PHASES.reduce((n, p, i) => n + (phaseStatus(state, i).complete ? p.cost[0] : 0), 0);
  const spentHi = PHASES.reduce((n, p, i) => n + (phaseStatus(state, i).complete ? p.cost[1] : 0), 0);

  return (
    <Screen mod={MOD}>
      <Hero mod={MOD} icon="Map" eyebrow="Module 1 · Milestones" title="From foreign RN to U.S. bedside"
        sub="Tick each step as you finish it. Phases unlock in order; switch on flexible order if you are running steps in parallel (most nurses study for NCLEX and English at the same time)."
        stats={[["Progress", pct + "%"], ["Steps done", done + " / " + total], ["Est. total cost", money(costLo) + "–" + money(costHi)]]} />

      <Card mod={MOD} style={{ gap: 12 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <Txt v="eyebrow">Overall progress</Txt>
          <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{done}/{total} steps · {pct}%</Txt>
        </Row>
        <Bar pct={done / total} mod={MOD} height={11} />
        <Check mod={MOD} checked={state.flexible} onToggle={() => dispatch({ type: "flex" })} label="Flexible order (unlock all phases)" />
        <Grid min={150} gap={10}>
          <View style={{ flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: t.soft, gap: 2 }}>
            <Txt v="eyebrow">Est. total cost</Txt>
            <Txt v="h3" color={t.tint}>{money(costLo)}–{money(costHi)}</Txt>
            <Txt v="tiny" muted>Nurse-paid fees, excluding prep courses and travel</Txt>
          </View>
          <View style={{ flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: t.soft2, gap: 2 }}>
            <Txt v="eyebrow">Completed phases</Txt>
            <Txt v="h3" color={t.tint2}>{money(spentLo)}–{money(spentHi)}</Txt>
            <Txt v="tiny" muted>Approximate spend so far</Txt>
          </View>
        </Grid>
      </Card>

      <View style={{ gap: 12 }}>
        <View style={{ position: "absolute", left: 19, top: 24, bottom: 24, width: 2, backgroundColor: t.c.line }} />
        {PHASES.map((p, i) => <PhaseRow key={p.id} p={p} i={i} />)}
      </View>

      <Timeline />
      <CostTracker />
      <Vault />
    </Screen>
  );
}

/* ---------- phase timeline row ---------- */
function PhaseRow({ p, i }) {
  const { state, dispatch } = useApp();
  const t = useTheme(MOD);
  const st = phaseStatus(state, i);
  const [open, setOpen] = useState(st.active);
  const node = st.complete ? (
    <Grad mod={MOD} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: t.c.surface }}>
      <Icon name="Check" size={18} color="#fff" strokeWidth={3} />
    </Grad>
  ) : st.locked ? (
    <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: t.c.sunk, borderWidth: 3, borderColor: t.c.surface }}>
      <Icon name="Lock" size={15} color={t.c.muted} />
    </View>
  ) : (
    <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: t.c.surface, borderWidth: 2.5, borderColor: t.tint }}>
      <Txt v="bodyB" color={t.tint} style={{ fontFamily: FONTS.monoBold }}>{p.n}</Txt>
    </View>
  );
  return (
    <Row gap={12} center={false}>
      <View style={{ paddingTop: 8 }}>{node}</View>
      <Card mod={MOD} padding={0} accent={st.active && open} style={{ flex: 1, gap: 0, opacity: st.locked ? 0.72 : 1 }}>
        <Pressable onPress={() => { tap(); setOpen(!open); }} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ padding: 14, gap: 8 }}>
          <Row center={false} gap={8}>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt v="bodyB">{p.title}</Txt>
              <Txt v="small" muted>{p.sub}</Txt>
            </View>
            <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} color={t.c.muted} />
          </Row>
          <Row wrap gap={6}>
            <Chip text={money(p.cost[0]) + (p.cost[1] !== p.cost[0] ? "–" + money(p.cost[1]) : "")} tone="mute" />
            {st.complete ? <Chip text="Complete" tone="ok" icon="Check" /> : st.locked ? <Chip text="Locked" tone="mute" icon="Lock" /> : <Chip mod={MOD} text={`${st.done}/${p.steps.length} in progress`} tone="acc" />}
          </Row>
        </Pressable>
        {open ? (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 4 }}>
            <Txt v="mono" muted style={{ fontSize: 12 }}>Typical timeline: {p.time}</Txt>
            {p.steps.map((s, j) => {
              const id = `${p.id}-${j}`;
              return <Check key={id} mod={MOD} checked={!!state.steps[id]} disabled={st.locked} strike label={s} onToggle={() => dispatch({ type: "step", id })} />;
            })}
            {st.locked ? <Txt v="tiny" muted>Finish “{PHASES[i - 1].title}” to unlock, or turn on flexible order.</Txt> : null}
          </View>
        ) : null}
      </Card>
    </Row>
  );
}

/* ---------- personalized timeline ---------- */
const LABEL_W = 150, TRACK_W = 400, BAR_H = 28;
function Timeline() {
  const { state } = useApp();
  const t = useTheme(MOD);
  const TODAY = today();
  const row = BULLETIN.rows.find((r) => r.key === state.profile.country) || BULLETIN.rows[0];
  let cur = new Date(TODAY); let nclexStart = null; const bars = [];
  PHASES.forEach((p, i) => {
    if (p.id === "imm") return;
    const st = phaseStatus(state, i);
    if (st.complete) { bars.push({ label: p.title, c: PHASE_COLORS[i], done: true }); return; }
    const start = p.id === "eng" && nclexStart ? nclexStart : cur;
    const end = addMonths(start, Math.max(0.5, DUR[p.id] * (1 - st.done / p.steps.length)));
    if (p.id === "nclex") nclexStart = start;
    bars.push({ label: p.title, c: PHASE_COLORS[i], start, end }); if (end > cur) cur = end;
  });
  let arrival = null, capped = false;
  if (phaseStatus(state, 5).complete) bars.push({ label: "Immigration", c: PHASE_COLORS[5], done: true });
  else {
    const offerEnd = addMonths(cur, 6), pd = addMonths(cur, 3);
    const gap = (pd - new Date(row.fa + "T00:00:00")) / (86400000 * 30.44);
    const queueEnd = gap > 0 ? addMonths(TODAY, (12 * gap) / row.rate) : offerEnd;
    const ready = queueEnd > offerEnd ? queueEnd : offerEnd;
    bars.push({ label: "Offer & I-140", c: PHASE_COLORS[5], start: cur, end: offerEnd });
    if (ready > offerEnd) bars.push({ label: "Visa queue (est.)", c: PHASE_COLORS[4], start: offerEnd, end: ready, wait: true });
    arrival = addMonths(ready, 4);
    bars.push({ label: "NVC, medical & interview", c: PHASE_COLORS[3], start: ready, end: arrival });
  }
  let spanEnd = arrival || addMonths(TODAY, 12);
  if (spanEnd - TODAY > 96 * 30.44 * 86400000) { spanEnd = addMonths(TODAY, 96); capped = true; }
  const total = Math.max(1, spanEnd - TODAY);
  const pos = (d) => Math.max(0, Math.min(1, (d - TODAY) / total)) * TRACK_W;
  const years = []; for (let y = TODAY.getFullYear() + 1; new Date(y, 0, 1) < spanEnd; y++) years.push(y);

  return (
    <Card mod={MOD} style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Txt v="eyebrow">Personalized timeline</Txt>
        <Txt v="h2">Projected path to arrival</Txt>
        <Txt v="small" muted>From today, based on your progress, typical phase lengths, and the {row.name} EB-3 queue at {row.rate} months of bulletin movement per year.</Txt>
      </View>
      <Grad mod={MOD} style={{ borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
          <Icon name="PlaneLanding" size={21} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Txt v="eyebrow" color="rgba(255,255,255,0.85)">Estimated arrival</Txt>
          <Txt v="h1" color="#fff">{!arrival ? "Arrived 🎉" : capped ? "8+ years" : monYr(arrival)}</Txt>
        </View>
      </Grad>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: LABEL_W + 12 + TRACK_W, gap: 8 }}>
          <View style={{ height: 18, marginLeft: LABEL_W + 12, width: TRACK_W }}>
            <Txt v="tiny" muted style={{ position: "absolute", left: 0, fontFamily: FONTS.mono }}>Today</Txt>
            {years.map((y) => (
              <Txt key={y} v="tiny" muted style={{ position: "absolute", left: pos(new Date(y, 0, 1)) - 16, width: 32, textAlign: "center", fontFamily: FONTS.mono }}>{y}</Txt>
            ))}
          </View>
          {bars.map((b, i) => {
            const left = b.done ? 0 : pos(b.start);
            const w = b.done ? 0 : Math.max(6, pos(b.end) - left);
            return (
              <Row key={i} gap={12}>
                <Txt v="smallB" numberOfLines={1} style={{ width: LABEL_W }}>{b.label}</Txt>
                <View style={{ width: TRACK_W, height: BAR_H, borderRadius: 9, backgroundColor: t.c.sunk, overflow: "hidden" }}>
                  {years.map((y) => <View key={y} style={{ position: "absolute", top: 0, bottom: 0, left: pos(new Date(y, 0, 1)), width: 1, backgroundColor: t.c.line }} />)}
                  {b.done ? (
                    <View style={{ position: "absolute", left: 6, top: 3 }}><Chip text="Done" tone="ok" icon="Check" /></View>
                  ) : b.wait ? (
                    <View style={{ position: "absolute", left, top: 4, bottom: 4, width: w, borderRadius: 6, overflow: "hidden", backgroundColor: mix(b.c, t.dark ? "#111527" : "#ffffff", 0.45) }}>
                      <Svg width={w} height={BAR_H - 8}>
                        {Array.from({ length: Math.ceil((w + BAR_H) / 12) }).map((_, k) => (
                          <Line key={k} x1={k * 12} y1={-2} x2={k * 12 - (BAR_H - 4)} y2={BAR_H - 6} stroke={b.c} strokeWidth={6} />
                        ))}
                      </Svg>
                    </View>
                  ) : (
                    <Grad colors={[b.c, mix(b.c, "#ffffff", 0.3)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{ position: "absolute", left, top: 4, bottom: 4, width: w, borderRadius: 6 }} />
                  )}
                </View>
              </Row>
            );
          })}
        </View>
      </ScrollView>
      <Txt v="tiny" muted>Estimates only. Bulletin movement is unpredictable and can retrogress. Change your chargeability country in Settings or on the Visa tab.</Txt>
    </Card>
  );
}

/* ---------- cost tracker ---------- */
function CostTracker() {
  const { state, dispatch } = useApp();
  const t = useTheme(MOD);
  const [f, setF] = useState({ phase: "cred", label: "", amount: "" }); const [err, setErr] = useState("");
  const pays = state.payments || [];
  const by = PHASES.map((p, i) => ({ p, i, sum: pays.filter((x) => x.phase === p.id).reduce((n, x) => n + (+x.amount || 0), 0) }));
  const total = by.reduce((n, x) => n + x.sum, 0);
  const lo = PHASES.reduce((n, p) => n + p.cost[0], 0), hi = PHASES.reduce((n, p) => n + p.cost[1], 0);
  const R = 70, C = 2 * Math.PI * R; let acc = 0;
  const add = () => {
    const amt = parseFloat(String(f.amount).replace(/,/g, ""));
    if (!f.label.trim() || !(amt > 0)) { setErr("Add what you paid for and an amount above $0."); return; }
    dispatch({ type: "addPay", pay: { id: uid(), phase: f.phase, label: f.label.trim(), amount: amt, date: todayKey() } });
    setF({ ...f, label: "", amount: "" }); setErr("");
  };
  return (
    <Card mod={MOD} style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Txt v="eyebrow">Cost tracker</Txt>
        <Txt v="h2">What you've actually paid</Txt>
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Svg width={210} height={210} viewBox="0 0 200 200" accessibilityLabel={`Total paid ${money(total)}`}>
          <Circle cx={100} cy={100} r={R} fill="none" stroke={t.c.sunk} strokeWidth={26} />
          {by.filter((x) => x.sum > 0).map((x) => {
            const len = (x.sum / Math.max(total, 1)) * C;
            const el = <Circle key={x.p.id} cx={100} cy={100} r={R} fill="none" stroke={PHASE_COLORS[x.i]} strokeWidth={26}
              strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-acc} rotation={-90} origin="100, 100" />;
            acc += len; return el;
          })}
          <SvgText x={100} y={100} textAnchor="middle" fontSize={26} fontWeight="800" fill={t.c.ink} fontFamily={FONTS.displayX}>{money(total)}</SvgText>
          <SvgText x={100} y={120} textAnchor="middle" fontSize={10} fill={t.c.muted} fontFamily={FONTS.mono} letterSpacing={1}>PAID SO FAR</SvgText>
        </Svg>
        <Txt v="small" muted style={{ textAlign: "center" }}>Estimated journey total {money(lo)}–{money(hi)}</Txt>
      </View>
      <Grid min={140} gap={8}>
        {by.map((x) => (
          <Row key={x.p.id} gap={8} style={{ flexGrow: 1, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: t.c.sunk }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: PHASE_COLORS[x.i] }} />
            <Txt v="small" numberOfLines={1} style={{ flex: 1 }}>{x.p.title}</Txt>
            <Txt v="mono" style={{ fontSize: 12 }}>{money(x.sum)}</Txt>
          </Row>
        ))}
      </Grid>
      <View style={{ gap: 10 }}>
        <Select mod={MOD} label="Phase" value={f.phase} options={PHASES.map((p) => ({ value: p.id, label: p.title }))} onChange={(v) => setF({ ...f, phase: v })} />
        <Row gap={10} center={false}>
          <Field mod={MOD} style={{ flex: 1.6 }} label="Paid for" value={f.label} onChangeText={(v) => setF({ ...f, label: v })} placeholder="e.g. IELTS fee" />
          <Field mod={MOD} style={{ flex: 1 }} label="Amount ($)" value={f.amount} onChangeText={(v) => setF({ ...f, amount: v.replace(/[^\d.,]/g, "") })} keyboardType="numeric" mono placeholder="0" />
        </Row>
        {err ? <Txt v="small" color={t.c.crit}>{err}</Txt> : null}
        <Btn mod={MOD} icon="Plus" title="Log" onPress={add} />
      </View>
      <View style={{ gap: 6 }}>
        {pays.slice(0, 5).map((x) => (
          <Row key={x.id} gap={8} style={{ padding: 9, borderRadius: 12, backgroundColor: t.c.sunk }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: PHASE_COLORS[PHASES.findIndex((p) => p.id === x.phase)] || t.c.muted }} />
            <View style={{ flex: 1, gap: 3 }}>
              <Txt v="small" numberOfLines={2}>{x.label}</Txt>
              {x.sample ? <Chip text="Sample" tone="mute" /> : null}
            </View>
            <Txt v="mono">{money(x.amount)}</Txt>
            <Pressable onPress={() => { tap(); dispatch({ type: "delPay", id: x.id }); }} accessibilityRole="button" accessibilityLabel={"Remove " + x.label} hitSlop={8}
              style={{ padding: 5, borderRadius: 8, borderWidth: 1, borderColor: t.c.line, backgroundColor: t.c.surface }}>
              <Icon name="X" size={13} color={t.c.muted} />
            </Pressable>
          </Row>
        ))}
      </View>
    </Card>
  );
}

/* ---------- document vault ---------- */
function Vault() {
  const { state, dispatch } = useApp();
  const { isPro, ready: proReady } = usePro();
  const t = useTheme(MOD);
  const blank = (cat) => ({ title: "", cat, file: "", issued: "", expires: "", expiresTouched: false });
  const [form, setForm] = useState(blank("English test"));
  const [filter, setFilter] = useState("All");
  const [err, setErr] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const set = (k, v) => setForm((f) => {
    const n = { ...f, [k]: v };
    if ((k === "issued" || k === "cat") && n.cat === "English test" && isISO(n.issued) && !f.expiresTouched) n.expires = addYears(n.issued, 2);
    if (k === "expires") n.expiresTouched = true;
    return n;
  });
  const add = () => {
    if (!form.title.trim()) { setErr("Give the document a name, for example “PTE Academic score report”."); return; }
    dispatch({ type: "addDoc", doc: { id: uid(), title: form.title.trim(), cat: form.cat, file: form.file.trim() || "(no file attached)", issued: form.issued, expires: form.expires } });
    setForm(blank(form.cat)); setErr("");
  };

  useEffect(() => {
    if (!proReady || !state.alertsOn) return;
    // Keep phone reminders in sync with the vault; drop them if Pro has lapsed.
    if (isPro) scheduleExpiryAlerts(state.docs); else cancelAlerts();
  }, [state.docs, state.alertsOn, isPro, proReady]);

  const toggleAlerts = async () => {
    if (state.alertsOn) { await cancelAlerts(); dispatch({ type: "alerts", on: false }); setAlertMsg(""); return; }
    const ok = await askPermission();
    if (!ok) { setAlertMsg("Notifications are turned off for this app. Allow them in your phone's Settings, then try again."); return; }
    const n = await scheduleExpiryAlerts(state.docs);
    dispatch({ type: "alerts", on: true });
    setAlertMsg(n > 0 ? `${n} reminder${n === 1 ? "" : "s"} scheduled.` : "");
  };

  const alerts = state.docs.map((d) => ({ d, n: daysUntil(d.expires) })).filter((x) => x.n !== null && x.n <= 90).sort((a, b) => a.n - b.n);
  const list = state.docs.filter((d) => filter === "All" || d.cat === filter);
  const status = (n) => n === null ? <Chip text="No expiry" tone="mute" /> : n < 0 ? <Chip text={`Expired ${Math.abs(n)}d ago`} tone="crit" icon="AlertTriangle" /> : n <= 90 ? <Chip text={`${n}d left`} tone="warn" icon="Clock" /> : <Chip text="Valid" tone="ok" icon="Check" />;

  return (
    <View style={{ gap: 14 }}>
      <SectionTitle eyebrow="Document Vault" title="Documents and expiry alerts"
        sub="English scores expire for VisaScreen 2 years after the test date, so the vault fills that in for you. Files stay on this device; the vault keeps only the file name and dates." />

      {/* In-app expiry warnings are free; only the automated phone reminders (notification toggle) are Pro. */}
      <Card mod={MOD} style={{ gap: 10 }}>
          <Row gap={10}>
            <IconTile mod={MOD} icon="BellRing" size={36} colors={["#f59e0b", "#ea580c"]} />
            <Txt v="bodyB" style={{ flex: 1 }}>Expiry alerts</Txt>
            {isPro && state.alertsOn ? <Chip text="On" tone="ok" icon="Check" /> : null}
          </Row>
          {alerts.map(({ d, n }) => (
            <Note key={d.id} tone={n < 0 ? "crit" : "warn"} icon="AlertTriangle">
              <Txt v="small">
                <Txt v="smallB">{d.title}</Txt>{" "}
                {n < 0 ? `expired on ${fmtDate(d.expires)}. Renew before you submit it anywhere.` : `expires in ${n} days (${fmtDate(d.expires)}).`}
                {d.cat === "English test" && n >= 0 ? " Submit VisaScreen before this date or plan a retake." : ""}
              </Txt>
            </Note>
          ))}
          {alerts.length === 0 ? <Note tone="ok" icon="CheckCircle2">Nothing in your vault expires in the next 90 days.</Note> : null}
      </Card>

      <ProGate feature="Automated expiry alerts" desc="Phone reminders 90 and 30 days before scores and licenses expire" mod={MOD}>
        <Card mod={MOD} style={{ gap: 10 }}>
          <View style={{ padding: 10, borderRadius: 14, backgroundColor: t.c.sunk }}>
            <Check mod={MOD} checked={!!state.alertsOn} onToggle={toggleAlerts} label="Remind me on this phone" sub="90 and 30 days before, and on the day each document expires" />
          </View>
          {alertMsg ? <Txt v="tiny" muted>{alertMsg}</Txt> : null}
        </Card>
      </ProGate>

      <Card mod={MOD} style={{ gap: 12 }}>
        <Row gap={8}><Icon name="Upload" size={17} color={t.tint} /><Txt v="bodyB">Add a document</Txt></Row>
        <Field mod={MOD} label="Document name" value={form.title} onChangeText={(v) => set("title", v)} placeholder="e.g. PTE Academic score report" />
        <Select mod={MOD} label="Category" value={form.cat} options={DOC_CATS} onChange={(v) => set("cat", v)} />
        <Field mod={MOD} label="File name (optional)" value={form.file} onChangeText={(v) => set("file", v)} placeholder="e.g. pte_score_report.pdf" autoCapitalize="none" />
        <Row gap={10} center={false}>
          <View style={{ flex: 1 }}><DateField mod={MOD} label="Issued / test date" value={form.issued} onChange={(v) => set("issued", v)} /></View>
          <View style={{ flex: 1 }}><DateField mod={MOD} label="Expires" value={form.expires} onChange={(v) => set("expires", v)} /></View>
        </Row>
        {err ? <Txt v="small" color={t.c.crit}>{err}</Txt> : null}
        <Btn mod={MOD} icon="Plus" title="Add to vault" onPress={add} />
      </Card>

      <Card mod={MOD} style={{ gap: 12 }}>
        <Row gap={10}>
          <Txt v="bodyB" style={{ flex: 1 }}>{list.length} document{list.length === 1 ? "" : "s"}</Txt>
          <View style={{ width: 170 }}>
            <Select mod={MOD} value={filter} options={["All", ...DOC_CATS]} onChange={setFilter} />
          </View>
        </Row>
        {list.map((d) => {
          const c = DOC_STYLE[d.cat] || DOC_STYLE.Credentials;
          const ext = ((d.file || "").match(/\.([a-z0-9]+)$/i) || [])[1];
          const meta = d.cat + ", " + (d.expires ? "expires " + fmtDate(d.expires) : "no expiry") + (ext ? " · " + ext.toUpperCase() : "");
          return (
            <Row key={d.id} gap={12} center={false} style={{ padding: 12, borderRadius: 16, backgroundColor: mix(c[0], t.c.surface, 0.9), borderWidth: 1, borderColor: mix(c[0], t.c.line, 0.72) }}>
              <IconTile icon={c[2]} size={38} colors={[c[0], c[1]]} />
              <View style={{ flex: 1, gap: 5 }}>
                <Row wrap gap={6}>
                  <Txt v="bodyB" style={{ flexShrink: 1 }}>{d.title}</Txt>
                  {d.sample ? <Chip text="Sample" tone="mute" /> : null}
                </Row>
                <Txt v="small" muted>{meta}</Txt>
                {status(daysUntil(d.expires))}
              </View>
              <Pressable onPress={() => { tap(); dispatch({ type: "delDoc", id: d.id }); }} accessibilityRole="button" accessibilityLabel={"Remove " + d.title} hitSlop={8}
                style={{ padding: 7, borderRadius: 10, borderWidth: 1, borderColor: t.c.line, backgroundColor: t.c.surface }}>
                <Icon name="Trash2" size={15} color={t.c.muted} />
              </Pressable>
            </Row>
          );
        })}
        {list.length === 0 ? <Txt v="small" muted>No documents in this category yet.</Txt> : null}
      </Card>
    </View>
  );
}
