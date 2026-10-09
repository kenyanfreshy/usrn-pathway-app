// Today: greeting hero, journey map, activity rings, next step, countdowns, question of the day and achievements.
import React, { useEffect, useMemo, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import Svg, { Path, Circle, G, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { Screen, Txt, Row, Card, Grad, Btn, Chip, Note, Option, Icon, IconTile, tap, Grid, HScroll } from "../../src/ui";
import { useTheme, FONTS, PHASE_COLORS } from "../../src/theme";
import { useApp, phaseStatus, BADGES } from "../../src/state";
import { usePro } from "../../src/pro";
import { Medal } from "../../src/overlays";
import { daysUntil, fmtDate, parseISO, todayKey } from "../../src/util";
import { PHASES, JPTS, JLABELS, DIAG, CAT_POOL } from "../../src/data/content";
import { useBulletin } from "../../src/bulletin";
import BANK_ALL from "../../src/data/questions.json";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const BANK = BANK_ALL.filter((q) => q.active !== false);
const NCLEX_POOL = BANK.filter((q) => q.bank === "NCLEX" && (q.type || "single") === "single");   // question of the day is single-answer

function useNow(ms) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

/* ---------- avatar ---------- */
function Avatar({ size = 38 }) {
  const { state } = useApp(); const p = state.profile;
  const ini = ((p.name || "").trim()[0] || "") + ((p.lastName || "").trim()[0] || "");
  return (
    <Grad mod="home" style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>
      {ini ? <Txt v="h3" color="#fff" style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}>{ini.toUpperCase()}</Txt> : <Icon name="User" size={Math.round(size * 0.5)} color="#fff" />}
    </Grad>
  );
}

/* ---------- journey map ---------- */
// Catmull-Rom style cubic segments, same control points as the web version.
function cubicSegs(pts) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    out.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return out;
}
const bez = (s, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]);
};
// Sample each segment so we can measure lengths and find a point at a given distance (no getPointAtLength in react-native-svg).
function sampleSegs(S, n = 48) {
  return S.map((s) => {
    const pts = [s[0]]; const cum = [0];
    for (let k = 1; k <= n; k++) { const p = bez(s, k / n); const q = pts[k - 1]; cum.push(cum[k - 1] + Math.hypot(p[0] - q[0], p[1] - q[1])); pts.push(p); }
    return { pts, cum, len: cum[n] };
  });
}
function pointAt(sample, d) {
  const { pts, cum } = sample;
  for (let k = 1; k < cum.length; k++) {
    if (cum[k] >= d) { const f = (d - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); return [pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * f, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * f]; }
  }
  return pts[pts.length - 1];
}

const JW = 640; // rendered width of the map; scrolls sideways on narrow phones
function Journey() {
  const { state } = useApp(); const t = useTheme("home");
  const geo = useMemo(() => {
    const S = cubicSegs(JPTS); const samples = sampleSegs(S);
    const L = [0]; samples.forEach((s, i) => L.push(L[i] + s.len));
    const full = "M" + JPTS[0].join(",") + S.map((s) => ` C${s[1].join(",")} ${s[2].join(",")} ${s[3].join(",")}`).join("");
    return { S, samples, L, total: L[L.length - 1], full };
  }, []);
  let f = 0;
  for (let i = 0; i < PHASES.length; i++) { const st = phaseStatus(state, i); if (st.complete) f += 1; else { f += st.done / PHASES[i].steps.length; break; } }
  const k = Math.min(Math.floor(f), JPTS.length - 2); const fr = Math.min(1, f - k);
  const drawn = geo.L[k] + (geo.L[k + 1] - geo.L[k]) * fr;
  const at = pointAt(geo.samples[k], geo.samples[k].len * fr);
  const done = Math.floor(f);
  const sc = JW / 760; const H = Math.round(210 * sc);
  const iconAt = (i) => {
    const reached = i <= done; const [x, y] = JPTS[i];
    return (
      <View key={"ic" + i} pointerEvents="none" style={{ position: "absolute", left: x * sc - 8, top: y * sc - 8, width: 16, height: 16 }}>
        <Icon name={i === 0 ? "Plane" : "Hospital"} size={16} color={reached ? "#fff" : t.c.muted} strokeWidth={2.2} />
      </View>
    );
  };
  return (
    <Card mod="home" padding={14} style={{ backgroundColor: t.dark ? t.c.surface : t.soft, overflow: "hidden" }}>
      <Row wrap style={{ justifyContent: "space-between" }}>
        <Txt v="h3">Your journey</Txt>
        <Chip tone="acc" mod="roadmap" icon={done < 6 ? "MapPin" : "PartyPopper"} text={done < 6 ? `Next stop: ${JLABELS[done + 1]}` : "You made it"} />
      </Row>
      <HScroll mod="home" fade={t.dark ? t.c.surface : t.soft} hint="Swipe to see your whole journey" accessible accessibilityRole="image" accessibilityLabel={`Journey progress: ${done} of 6 phases complete`}>
        <View style={{ width: JW, height: H }}>
          <Svg width={JW} height={H} viewBox="0 0 760 210">
            <Defs>
              <SvgGradient id="jg" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={t.acc[0]} /><Stop offset="1" stopColor={t.acc[1]} /></SvgGradient>
            </Defs>
            <Path d="M0,192 C120,176 220,204 380,188 C540,172 640,202 760,184 L760,210 L0,210 Z" fill={t.acc[1]} fillOpacity={0.14} />
            <Path d="M274,34 a46,10 0 1,0 92,0 a46,10 0 1,0 -92,0 Z" fill={t.c.line} opacity={0.55} />
            <Path d="M566,26 a34,8 0 1,0 68,0 a34,8 0 1,0 -68,0 Z" fill={t.c.line} opacity={0.5} />
            <Path d="M92,40 a28,7 0 1,0 56,0 a28,7 0 1,0 -56,0 Z" fill={t.c.line} opacity={0.45} />
            <Path d={geo.full} fill="none" stroke={t.c.line} strokeWidth={5} strokeDasharray="2 10" strokeLinecap="round" />
            {drawn > 0.5 ? <Path d={geo.full} fill="none" stroke="url(#jg)" strokeWidth={6} strokeLinecap="round" strokeDasharray={`${drawn} ${geo.total + 20}`} /> : null}
            {JPTS.map(([x, y], i) => {
              const reached = i <= done; const end = i === 0 || i === JPTS.length - 1;
              return (
                <G key={i}>
                  <Circle cx={x} cy={y} r={end ? 15 : 11} fill={reached ? "url(#jg)" : t.c.surface} stroke={reached ? t.c.surface : t.c.line} strokeWidth={3} />
                  {!end ? <SvgText x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight="700" fill={reached ? "#fff" : t.c.muted} fontFamily={FONTS.monoBold}>{String(i)}</SvgText> : null}
                  <SvgText x={x} y={y + (y > 120 ? 34 : -22)} textAnchor="middle" fontSize={13} fontWeight="700" fill={reached ? t.c.ink : t.c.muted} fontFamily={FONTS.bodyBold}>{JLABELS[i]}</SvgText>
                </G>
              );
            })}
            <Circle cx={at[0]} cy={at[1]} r={18} fill={t.acc[0]} opacity={0.22} />
            <Circle cx={at[0]} cy={at[1]} r={11.5} fill="none" stroke={t.acc[1]} strokeWidth={3} />
            <Circle cx={at[0]} cy={at[1]} r={7.5} fill="#fff" stroke={t.acc[0]} strokeWidth={3.5} />
          </Svg>
          {iconAt(0)}{iconAt(JPTS.length - 1)}
        </View>
      </HScroll>
    </Card>
  );
}

/* ---------- activity rings ---------- */
function Rings({ rings, center }) {
  const size = 210, stroke = 14, gap = 4, c = size / 2;
  return (
    <View style={{ width: size, height: size, alignSelf: "center" }} accessible accessibilityRole="image" accessibilityLabel={rings.map((r) => `${r.label} ${Math.round(r.pct * 100)}%`).join(", ")}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>{rings.map((r, i) => <SvgGradient key={i} id={"rg" + i} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={r.c[0]} /><Stop offset="1" stopColor={r.c[1]} /></SvgGradient>)}</Defs>
        {rings.map((r, i) => {
          const rad = c - stroke / 2 - 2 - i * (stroke + gap), len = 2 * Math.PI * rad, p = Math.max(0.004, Math.min(1, r.pct));
          return (
            <G key={i} rotation={-90} origin={`${c}, ${c}`}>
              <Circle cx={c} cy={c} r={rad} fill="none" stroke={r.c[0]} strokeOpacity={0.16} strokeWidth={stroke} />
              <Circle cx={c} cy={c} r={rad} fill="none" strokeWidth={stroke} stroke={`url(#rg${i})`} strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - p)} strokeLinecap="round" />
            </G>
          );
        })}
        {center}
      </Svg>
    </View>
  );
}

/* ---------- countdown tiles ---------- */
function Tile({ children, onPress, label }) {
  const style = { flexGrow: 1 };
  if (!onPress) return <Card padding={14} style={[style, { gap: 4 }]}>{children}</Card>;
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.985 }], opacity: 0.95 }]}>
      <Card padding={14} style={{ gap: 4, flexGrow: 1 }}>{children}</Card>
    </Pressable>
  );
}
function Countdown({ icon, label, date, empty, onSet, live, tone }) {
  const t = useTheme("home"); const now = useNow(live ? 1000 : 60000);
  const head = <Row gap={6}><Icon name={icon} size={15} color={t.c.muted} /><Txt v="eyebrow" numberOfLines={1} style={{ flex: 1 }}>{label}</Txt></Row>;
  const d0 = parseISO(date);
  if (!d0) return (
    <Tile onPress={onSet} label={`${label}: ${empty}`}>
      {head}
      <Txt v="bodyB" color={t.tint}>{empty} →</Txt>
    </Tile>
  );
  const target = new Date(d0); target.setHours(8, 0, 0, 0);
  const ms = target - now; const d = Math.floor(ms / 86400000);
  const hms = ms > 0 ? [Math.floor(ms / 3600000) % 24, Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60].map((x) => String(x).padStart(2, "0")).join(":") : "";
  const tn = tone || (ms < 0 ? "crit" : d <= 30 ? "warn" : "ok");
  return (
    <Tile>
      {head}
      <Row gap={6} center={false} style={{ alignItems: "flex-end" }}>
        <Txt v="big" color={t.c[tn]} style={{ fontVariant: ["tabular-nums"] }}>{ms < 0 ? "Passed" : String(d)}</Txt>
        {ms >= 0 ? <Txt v="small" muted style={{ paddingBottom: 6 }}>days</Txt> : null}
      </Row>
      <Txt v="tiny" muted style={{ fontFamily: FONTS.mono, fontVariant: ["tabular-nums"] }}>{live && hms ? hms + " · " : ""}{fmtDate(date)}</Txt>
    </Tile>
  );
}

/* ---------- question of the day ---------- */
function QOTD() {
  const { state, dispatch } = useApp(); const t = useTheme("nclex");
  const key = todayKey();
  const pool = NCLEX_POOL.length ? NCLEX_POOL : [...DIAG, ...CAT_POOL];
  const h = [...key].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 9973, 7);
  const rec = (state.qotd || {})[key];
  const q = (rec && [...pool, ...BANK, ...DIAG, ...CAT_POOL].find((x) => x.id === rec.id)) || pool[h % pool.length];
  const pick = (id) => { if (!rec) dispatch({ type: "qotd", key, rec: { id: q.id, choice: id, correct: id === q.answer } }); };
  const right = q.options.find((o) => o.id === q.answer);
  return (
    <Card mod="nclex">
      <Row wrap style={{ justifyContent: "space-between" }}>
        <Row gap={8}><IconTile mod="nclex" icon="CalendarCheck" size={32} /><Txt v="h3">Question of the day</Txt></Row>
        {q.cat ? <Chip tone="acc" mod="nclex" text={q.cat} /> : null}
      </Row>
      <Txt v="bodyB">{q.stem}</Txt>
      <View style={{ gap: 8 }}>
        {q.options.map((o) => {
          const st = !rec ? null : o.id === q.answer ? "right" : rec.choice === o.id ? "wrong" : null;
          const showWhy = rec && (o.id === q.answer || rec.choice === o.id);
          return <Option key={o.id} mod="nclex" letter={o.id} label={o.text} why={showWhy ? o.why : null} state={st} disabled={!!rec} onPress={() => pick(o.id)} />;
        })}
      </View>
      {rec ? (
        <View style={{ gap: 10 }}>
          <Row gap={8}>
            <Icon name={rec.correct ? "PartyPopper" : "RefreshCw"} size={18} color={rec.correct ? t.c.ok : t.c.crit} />
            <Txt v="bodyB" color={rec.correct ? t.c.ok : t.c.crit} style={{ flex: 1 }}>{rec.correct ? "Nailed it! +20 XP" : "Not this time. +5 XP for showing up — come back tomorrow."}</Txt>
          </Row>
          {q.takeaway ? (
            <Note tone="acc" mod="roadmap" icon="Lightbulb">
              <Txt v="small"><Txt v="smallB">Takeaway: </Txt>{q.takeaway}</Txt>
            </Note>
          ) : null}
          {!rec.correct && right ? <Txt v="tiny" muted>Correct answer: {right.text}</Txt> : null}
        </View>
      ) : null}
    </Card>
  );
}

/* ---------- disclaimer ---------- */
function Disclaimer() {
  const t = useTheme();
  return (
    <View accessibilityRole="text" style={{ flexDirection: "row", gap: 12, padding: 16, borderRadius: 18, backgroundColor: t.c.warnSoft, borderWidth: 2, borderColor: t.c.warn }}>
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: t.c.warn, alignItems: "center", justifyContent: "center" }}><Icon name="AlertTriangle" size={20} color={t.c.surface} /></View>
      <View style={{ flex: 1, gap: 4 }}>
        <Txt v="h3" color={t.c.warn}>For educational purposes only</Txt>
        <Txt v="smallB">This app is not legal, immigration, medical or financial advice. Your progress is saved on your device.</Txt>
      </View>
    </View>
  );
}

/* ---------- header ---------- */
function TopBar() {
  const t = useTheme("home"); const { isPro } = usePro();
  return (
    <Row gap={10}>
      <IconTile mod="home" icon="Stethoscope" size={34} />
      <Txt v="h3" style={{ flex: 1 }} numberOfLines={1}>USRN Pathway</Txt>
      {isPro ? (
        <Row gap={4} style={{ backgroundColor: "#f59e0b", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }} accessible accessibilityLabel="Pro member">
          <Icon name="Crown" size={13} color="#1a1204" /><Txt v="eyebrow" color="#1a1204">Pro</Txt>
        </Row>
      ) : (
        <Pressable onPress={() => { tap(); router.push("/paywall"); }} accessibilityRole="button" accessibilityLabel="Upgrade to Pro" hitSlop={6}>
          <Grad colors={["#f59e0b", "#db2777"]} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99 }}>
            <Icon name="Crown" size={14} color="#fff" /><Txt v="smallB" color="#fff">Upgrade</Txt>
          </Grad>
        </Pressable>
      )}
      <Pressable onPress={() => { tap(); router.push("/settings"); }} accessibilityRole="button" accessibilityLabel="Profile and settings" hitSlop={6}
        style={{ borderRadius: 99, borderWidth: 2, borderColor: t.c.surface }}>
        <Avatar size={36} />
      </Pressable>
    </Row>
  );
}

/* ---------- screen ---------- */
export default function Today() {
  const { state, dispatch, m, lvl } = useApp(); const t = useTheme("home"); const p = state.profile;
  const pal = t.pal;
  const now = new Date(); const hour = now.getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLine = `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const fullName = [p.name, p.lastName].filter(Boolean).join(" ");

  let next = null;
  for (let i = 0; i < PHASES.length && !next; i++) {
    const st = phaseStatus(state, i); if (st.locked) continue;
    const ph = PHASES[i]; const j = ph.steps.findIndex((_, k) => !state.steps[`${ph.id}-${k}`]);
    if (j >= 0) next = { ph, j, i };
  }
  const docSoon = state.docs.filter((d) => d.expires).map((d) => ({ d, n: daysUntil(d.expires) })).filter((x) => x.n !== null && x.n >= 0).sort((a, b) => a.n - b.n)[0];
  const BULLETIN = useBulletin();
  const row = BULLETIN.rows.find((r) => r.key === p.country) || BULLETIN.rows[0];
  const pdD = parseISO(p.pd), faD = parseISO(row.fa);
  const gap = pdD && faD ? (pdD - faD) / (86400000 * 30.44) : null;
  const rings = [
    { label: "Roadmap", pct: m.roadPct, c: pal.colors.roadmap, to: "/roadmap" },
    { label: "NCLEX benchmarks", pct: m.nclexPct, c: pal.colors.nclex, to: "/nclex" },
    { label: "Bedside lessons", pct: m.lessonPct, c: pal.colors.bedside, to: "/bedside" },
    { label: "Career & credit", pct: m.careerPct, c: pal.colors.career, to: "/career" },
  ];
  const seen = state.badgesSeen || [];
  const glass = { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, flexGrow: 1 };
  const toSettings = () => router.push("/settings");

  return (
    <Screen mod="home">
      <TopBar />

      {/* greeting hero */}
      <Grad mod="home" style={{ borderRadius: 26, padding: 20, gap: 16, overflow: "hidden" }}>
        <View pointerEvents="none" style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, right: -70, top: -100, backgroundColor: "rgba(255,255,255,0.14)" }} />
        <View pointerEvents="none" style={{ position: "absolute", width: 120, height: 120, borderRadius: 60, right: 70, bottom: -70, backgroundColor: "rgba(255,255,255,0.09)" }} />
        <View style={{ gap: 6 }}>
          <Txt v="eyebrow" color="rgba(255,255,255,0.85)">{dateLine}</Txt>
          <Txt v="h2" color="#fff">{greet}{p.name ? "," : ""}</Txt>
          {p.name ? (
            <View style={{ gap: 8 }}>
              <Txt v="hero" color="#fff">{fullName}</Txt>
              <Row wrap gap={6}>
                {[p.specialty, p.homeCountry && "From " + p.homeCountry, p.targetState && "→ " + p.targetState].filter(Boolean).map((x) => (
                  <View key={x} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}>
                    <Txt v="smallB" color="#fff">{x}</Txt>
                  </View>
                ))}
              </Row>
            </View>
          ) : (
            <Pressable onPress={() => { tap(); toSettings(); }} accessibilityRole="button" accessibilityLabel="Add your name"
              style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" }}>
              <Icon name="UserPlus" size={15} color="#fff" /><Txt v="smallB" color="#fff">Add your name</Txt>
            </Pressable>
          )}
          <Txt v="body" color="rgba(255,255,255,0.95)" style={{ marginTop: 4 }}>
            {next ? <>Your next move: <Txt v="bodyB" color="#fff">{next.ph.steps[next.j]}</Txt></> : "Every roadmap step is complete. Welcome to the U.S. bedside."}
          </Txt>
        </View>
        <Grid min={140} gap={8}>
          <View style={glass}>
            <Txt v="eyebrow" color="rgba(255,255,255,0.85)">Level {lvl.idx + 1}</Txt>
            <Txt v="h2" color="#fff">{lvl.name}</Txt>
            <View style={{ height: 8, borderRadius: 99, marginTop: 8, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" }} accessible accessibilityLabel={`Level progress ${Math.round(lvl.pct * 100)}%`}>
              <View style={{ height: "100%", width: `${Math.max(0, Math.min(100, lvl.pct * 100))}%`, backgroundColor: "#fff", borderRadius: 99 }} />
            </View>
            <Txt v="tiny" color="rgba(255,255,255,0.9)" style={{ fontFamily: FONTS.mono, marginTop: 4 }}>{m.xp} XP{lvl.next ? ` · ${lvl.next - m.xp} to ${lvl.nextName}` : ""}</Txt>
          </View>
          {[["Flame", "Streak", m.streak + (m.streak === 1 ? " day" : " days")], ["Gauge", "Readiness", m.readiness + " / 100"], ["Award", "Badges", seen.length + " / " + BADGES.length]].map(([ic, k, v]) => (
            <View key={k} style={[glass, { flexDirection: "row", alignItems: "center", gap: 10 }]}>
              <Icon name={ic} size={22} color="#fff" />
              <View style={{ flex: 1 }}>
                <Txt v="eyebrow" color="rgba(255,255,255,0.85)">{k}</Txt>
                <Txt v="h3" color="#fff" numberOfLines={1}>{v}</Txt>
              </View>
            </View>
          ))}
        </Grid>
      </Grad>

      <Journey />

      {/* rings */}
      <Card mod="home">
        <Rings rings={rings} center={
          <G>
            <SvgText x="105" y="110" textAnchor="middle" fontSize={32} fontWeight="800" fill={t.c.ink} fontFamily={FONTS.displayX}>{String(m.readiness)}</SvgText>
            <SvgText x="105" y="127" textAnchor="middle" fontSize={9} fill={t.c.muted} fontFamily={FONTS.mono} letterSpacing={1}>READY</SvgText>
          </G>
        } />
        <Txt v="h3" style={{ textAlign: "center" }}>Activity rings</Txt>
        <View style={{ gap: 2 }}>
          {rings.map((r) => (
            <Pressable key={r.label} onPress={() => { tap(); router.push(r.to); }} accessibilityRole="button" accessibilityLabel={`${r.label} ${Math.round(r.pct * 100)} percent. Open`}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, paddingHorizontal: 8, borderRadius: 12, backgroundColor: pressed ? t.c.sunk : "transparent" })}>
              <Grad colors={r.c} style={{ width: 14, height: 14, borderRadius: 5 }} />
              <Txt v="body" style={{ flex: 1 }}>{r.label}</Txt>
              <Txt v="mono" style={{ fontFamily: FONTS.monoBold }}>{Math.round(r.pct * 100)}%</Txt>
              <Icon name="ChevronRight" size={16} color={t.c.muted} />
            </Pressable>
          ))}
        </View>
        <Txt v="tiny" muted>Readiness blends roadmap 40%, benchmarks 30%, lessons 15%, document health 15%.</Txt>
      </Card>

      {/* next step */}
      {next ? (
        <Card style={{ borderColor: PHASE_COLORS[next.i], borderWidth: 1.5 }}>
          <Row gap={12}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: PHASE_COLORS[next.i], alignItems: "center", justifyContent: "center" }}>
              <Icon name="ArrowUpRight" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt v="eyebrow">Next step · {next.ph.title}</Txt>
              <Txt v="bodyB">{next.ph.steps[next.j]}</Txt>
            </View>
          </Row>
          <Btn title="Done" icon="Check" mod="roadmap" small onPress={() => dispatch({ type: "step", id: `${next.ph.id}-${next.j}` })} style={{ alignSelf: "flex-end" }} />
        </Card>
      ) : null}

      {/* countdowns */}
      <Grid min={140} gap={10}>
        <Countdown icon="CalendarClock" label="NCLEX day" date={p.testDate} live empty="Set your test date" onSet={toSettings} />
        <Countdown icon="Hourglass" label="ATT closes" date={p.attEnd} empty="Add ATT window" onSet={toSettings} />
        {docSoon
          ? <Countdown icon="FileWarning" label={docSoon.d.title.length > 22 ? docSoon.d.title.slice(0, 21) + "…" : docSoon.d.title} date={docSoon.d.expires} />
          : <Countdown icon="FileCheck" label="Documents" empty="Add expiry dates" onSet={() => router.push("/roadmap")} />}
        <Tile onPress={gap === null ? toSettings : () => router.push("/visa")} label={gap === null ? "Add priority date" : "Open visa bulletin"}>
          <Row gap={6}><Icon name="Plane" size={15} color={t.c.muted} /><Txt v="eyebrow" numberOfLines={1} style={{ flex: 1 }}>Visa · {row.name.split(" ")[0]}</Txt></Row>
          {gap === null ? <Txt v="bodyB" color={t.tint}>Add priority date →</Txt>
            : gap <= 0 ? <Txt v="h1" color={t.c.ok}>Current</Txt>
            : <Row gap={6} style={{ alignItems: "flex-end" }}><Txt v="big" color={t.tint}>{(gap / row.rate).toFixed(1)}</Txt><Txt v="small" muted style={{ paddingBottom: 6 }}>yrs est.</Txt></Row>}
          <Txt v="tiny" muted style={{ fontFamily: FONTS.mono }}>Cutoff {fmtDate(row.fa)}</Txt>
        </Tile>
      </Grid>

      <QOTD />

      {/* achievements */}
      <Card mod="home">
        <Row style={{ justifyContent: "space-between" }}>
          <Txt v="h3">Achievements</Txt>
          <Btn small kind="secondary" title="View all" icon="Award" onPress={() => router.push("/badges")} />
        </Row>
        <Grid min={64} gap={8}>
          {BADGES.slice(0, 12).map((b, i) => {
            const got = seen.includes(b.id);
            return (
              <Pressable key={b.id} onPress={() => { tap(); router.push("/badges"); }} accessibilityRole="button" accessibilityLabel={`${b.name}${got ? "" : ", locked"}. ${b.desc}`}
                style={{ flexGrow: 1, alignItems: "center", gap: 6, paddingVertical: 4 }}>
                <Medal badge={b} idx={i} size={50} locked={!got} />
                <Txt v="tiny" style={{ textAlign: "center", fontFamily: FONTS.bodySemi }} numberOfLines={2} color={got ? t.c.ink : t.c.muted}>{b.name}</Txt>
              </Pressable>
            );
          })}
        </Grid>
        <View style={{ gap: 6, padding: 12, borderRadius: 14, backgroundColor: t.c.sunk }}>
          <Row gap={6}><Icon name="Zap" size={16} color={t.tint} /><Txt v="smallB">Earn XP</Txt></Row>
          <Txt v="tiny" muted>Roadmap step +20 · benchmark +50 (+50 at 75%+) · lesson +40 · daily question +5/+20 · flashcard +2 · ladder entry +15</Txt>
        </View>
      </Card>

      <Disclaimer />
    </Screen>
  );
}
