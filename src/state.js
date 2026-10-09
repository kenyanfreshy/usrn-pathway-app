// App state: reducer (ported from the web app), on-device persistence, metrics, levels and badges.
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SAMPLE_DOCS, LESSONS, CAREERS, CREDIT, INSURE_LIST } from "./data/content";
import { dkey, today, daysUntil, isoOffset } from "./util";
import { phasesFor, destId, BADGE_ROLES, lifeOf, WORDS } from "./data/global";

const STORE_KEY = "usrn-pathway-v1";
export const initialState = () => ({
  steps: { "cred-0": true, "cred-1": true, "cred-2": true, "cred-3": true, "att-0": true, "att-1": true },
  flexible: false, docs: SAMPLE_DOCS, exams: [], runs: {}, catSeen: [], lessons: {}, careers: {}, credit: {}, drive: {}, qstats: {},
  profile: { dest: "US", regions: {}, name: "", lastName: "", homeCountry: "", specialty: "", targetState: "", country: "ph", pd: "", testDate: "", attEnd: "" },
  palette: "vivid", days: {}, qotd: {}, flash: 0, badgesSeen: null, alertsOn: false, onboarded: false,
  payments: [
    { id: "y1", phase: "cred", label: "CGFNS CES Professional Report (sample)", amount: 395, date: isoOffset(-200), sample: true },
    { id: "y2", phase: "att", label: "Board application fee (sample)", amount: 143, date: isoOffset(-60), sample: true },
  ],
  ladder: [
    { id: "l1", type: "Charge shift", date: isoOffset(-40), hours: 12, note: "Night charge, 24-bed step-down (sample)" },
    { id: "l2", type: "Preceptor hours", date: isoOffset(-25), hours: 36, note: "Precepted new graduate, week 3 (sample)" },
    { id: "l3", type: "EBP / UPC project", date: isoOffset(-12), hours: 6, note: "CAUTI bundle audit for practice council (sample)" },
  ],
});

const ACTIVE = new Set(["step", "region", "addDoc", "exam", "lesson", "career", "credit", "addLadder", "qotd", "flash", "addPay", "drive", "qstat"]);
function reducer(s, a) {
  const n = reducer0(s, a);
  if (n !== s && ACTIVE.has(a.type)) return { ...n, days: { ...(n.days || {}), [dkey(new Date())]: true } };
  return n;
}
function reducer0(s, a) {
  switch (a.type) {
    case "hydrate": return a.state;
    case "step": return { ...s, steps: { ...s.steps, [a.id]: !s.steps[a.id] } };
    case "flex": return { ...s, flexible: !s.flexible };
    case "addDoc": return { ...s, docs: [a.doc, ...s.docs] };
    case "delDoc": return { ...s, docs: s.docs.filter((d) => d.id !== a.id) };
    case "exam": return { ...s, exams: [a.rec, ...s.exams].slice(0, 30) };
    case "run": return { ...s, runs: { ...(s.runs || {}), [a.key]: a.data } };          // saved progress of a long exam (null clears it)
    case "catSeen": return { ...s, catSeen: [...new Set([...(s.catSeen || []), ...a.ids])].slice(-2000) };
    case "lesson": {
      // Keep the best knowledge-check score. Older saves stored just `true`, which still counts as complete.
      const prev = s.lessons[a.id]; const r = a.result;
      if (!r) return { ...s, lessons: { ...s.lessons, [a.id]: prev || true } };
      const keep = prev && typeof prev === "object" && prev.best >= r.best ? prev : r;
      return { ...s, lessons: { ...s.lessons, [a.id]: keep } };
    }
    case "career": return { ...s, careers: { ...s.careers, [a.id]: !s.careers[a.id] } };
    case "credit": return { ...s, credit: { ...s.credit, [a.id]: !s.credit[a.id] } };
    case "drive": return { ...s, drive: { ...(s.drive || {}), [a.id]: !(s.drive || {})[a.id] } };
    case "addLadder": return { ...s, ladder: [a.entry, ...s.ladder] };
    case "delLadder": return { ...s, ladder: s.ladder.filter((e) => e.id !== a.id) };
    case "profile": return { ...s, profile: { ...s.profile, ...a.patch } };
    case "region": {
      // Pick a province (Canada): save it and tick the roadmap step "Pick one province first".
      const regions = { ...(s.profile.regions || {}), [a.dest]: a.code };
      const steps = a.step ? { ...s.steps, [a.step]: true } : s.steps;
      return { ...s, steps, profile: { ...s.profile, regions } };
    }
    case "palette": return { ...s, palette: a.key };
    case "qotd": return { ...s, qotd: { ...(s.qotd || {}), [a.key]: a.rec } };
    case "flash": return { ...s, flash: (s.flash || 0) + 1 };
    case "addPay": return { ...s, payments: [a.pay, ...(s.payments || [])] };
    case "delPay": return { ...s, payments: (s.payments || []).filter((x) => x.id !== a.id) };
    case "seen": return { ...s, badgesSeen: a.ids };
    case "alerts": return { ...s, alertsOn: !!a.on };
    case "onboarded": return { ...s, onboarded: true };
    case "qstat": {
      const q = { ...(s.qstats || {}) };
      Object.entries(a.res).forEach(([id, ok]) => { const v = q[id] || [0, 0]; q[id] = [v[0] + 1, v[1] + (ok ? 1 : 0), ok ? 1 : 0]; });
      return { ...s, qstats: q };
    }
    case "reset": return { ...initialState(), palette: s.palette, onboarded: true };
    default: return s;
  }
}

/** Phases of the destination the nurse picked (U.S., Canada, Australia or New Zealand). */
export const phasesOf = (state) => phasesFor(destId(state));
export function phaseStatus(state, i) {
  const PHASES = phasesOf(state); const p = PHASES[i];
  const done = p.steps.filter((_, j) => state.steps[`${p.id}-${j}`]).length;
  const complete = done === p.steps.length;
  const prevComplete = i === 0 || PHASES[i - 1].steps.every((_, j) => state.steps[`${PHASES[i - 1].id}-${j}`]);
  const locked = !state.flexible && !prevComplete && !complete;
  return { done, complete, locked, active: !locked && !complete };
}
export const phaseDone = (s, id) => { const p = phasesOf(s).find((x) => x.id === id); return !!p && p.steps.every((_, j) => s.steps[`${id}-${j}`]); };
/** Done when the roadmap phase this badge follows (for the chosen destination) is complete. */
const roleDone = (s, role) => { const r = BADGE_ROLES[destId(s)][role]; const p = phasesOf(s)[r[0]]; return !!p && p.steps.every((_, j) => s.steps[`${p.id}-${j}`]); };

/** Credit checklist for the destination, and the key each item is saved under (U.S. keeps the original numeric keys). */
export const creditList = (s) => { const l = lifeOf(destId(s)); return l ? l.credit : CREDIT; };
export const creditKey = (s, i) => (destId(s) === "US" ? i : `${destId(s)}-${i}`);
/** Career tracks for the destination; ids are prefixed per country so ticks don't collide. */
export const careersOf = (s) => { const d = destId(s); const l = lifeOf(d); return l ? l.careers.map((c) => ({ ...c, id: `${d}-${c.id}` })) : CAREERS; };
export const insureListOf = (s) => { const l = lifeOf(destId(s)); return l ? l.insureList : INSURE_LIST; };
export const insureKey = (s, i) => (destId(s) === "US" ? "ins" + i : `${destId(s)}-ins${i}`);

export const LEVELS = [[0, "Applicant"], [250, "Candidate"], [600, "NCLEX Ready"], [1000, "Licensed RN"], [1500, "Bedside Pro"], [2200, "Charge RN"], [3000, "Nurse Leader"]];
export function levelOf(xp) {
  let i = 0; LEVELS.forEach((l, k) => { if (xp >= l[0]) i = k; });
  const floor = LEVELS[i][0], next = LEVELS[i + 1] ? LEVELS[i + 1][0] : null;
  return { idx: i, name: LEVELS[i][1], floor, next, nextName: LEVELS[i + 1] ? LEVELS[i + 1][1] : null, pct: next ? (xp - floor) / (next - floor) : 1 };
}
export function streakOf(days) {
  days = days || {}; let n = 0; const d = today();
  if (!days[dkey(d)]) d.setDate(d.getDate() - 1);
  while (days[dkey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export function metrics(s) {
  const PHASES = phasesOf(s);
  const total = PHASES.reduce((n, p) => n + p.steps.length, 0);
  const done = PHASES.reduce((n, p) => n + p.steps.filter((_, j) => s.steps[`${p.id}-${j}`]).length, 0);
  const latest = (mode) => s.exams.find((e) => e.mode === mode);
  const latestOf = (...modes) => s.exams.find((e) => modes.includes(e.mode));
  const bench = [latestOf("Diagnostic Benchmark", "Diagnostic Baseline"), latestOf("NGN Clinical Judgment Simulator", "NGN Case Study"), latestOf("Comprehensive Predictor", "CAT Predictor")];
  const nclexPct = bench.reduce((n, e) => n + (e ? e.pct / 100 : 0), 0) / 3;
  const lessonsDone = LESSONS.filter((l) => s.lessons[l.id]).length;
  const lessonPct = lessonsDone / LESSONS.length;
  const CAR = careersOf(s), CRED = creditList(s), INS = insureListOf(s);
  const careerTotal = CAR.reduce((n, c) => n + c.items.length, 0) + CRED.length + INS.length;
  const creditDone = CRED.filter((_, i) => s.credit[creditKey(s, i)]).length;
  const careerDone = CAR.reduce((n, c) => n + c.items.filter((_, i) => s.careers[c.id + i]).length, 0) + INS.filter((_, i) => s.careers[insureKey(s, i)]).length + creditDone;
  const careerPct = Math.min(1, careerDone / careerTotal);
  const risky = s.docs.filter((d) => { const n = daysUntil(d.expires); return n !== null && n <= 90; }).length;
  const vaultPct = s.docs.length ? 1 - risky / s.docs.length : 0;
  const readiness = Math.round(100 * (0.4 * (done / total) + 0.3 * nclexPct + 0.15 * lessonPct + 0.15 * vaultPct));
  const q = Object.values(s.qotd || {});
  const answered = Object.values(s.qstats || {}).reduce((n, v) => n + v[0], 0);
  const xp = done * 20 + s.exams.length * 50 + s.exams.filter((e) => e.pct >= 75).length * 50 + lessonsDone * 40 + s.ladder.length * 15
    + q.length * 5 + q.filter((x) => x.correct).length * 15 + (s.flash || 0) * 2 + creditDone * 10
    + Object.values(s.careers).filter(Boolean).length * 5 + (s.payments || []).length * 5 + answered * 3;
  return { total, done, roadPct: done / total, nclexPct, lessonPct, careerPct, vaultPct, readiness, xp, streak: streakOf(s.days), lessonsDone, answered };
}
export const BADGES = [
  { id: "first", icon: "Footprints", name: "First Steps", desc: "Complete your first roadmap step", test: (s, m) => m.done > 0 },
  { id: "cred", icon: "GraduationCap", name: "Credentials Cleared", desc: "Finish the credentials evaluation phase", test: (s) => roleDone(s, "cred") },
  { id: "att", icon: "Ticket", name: "Cleared to Test", desc: "Receive your Authorization to Test", test: (s) => roleDone(s, "att") },
  { id: "bench", icon: "ClipboardCheck", name: "First Benchmark", desc: "Complete any NCLEX benchmark", test: (s) => s.exams.length > 0 },
  { id: "ace", icon: "Trophy", name: "Benchmark Ace", desc: "Score 75% or higher on a benchmark", test: (s) => s.exams.some((e) => e.mode !== "CAT Predictor" && e.mode !== "Comprehensive Predictor" && e.pct >= 75) },
  { id: "cat", icon: "Gauge", name: "Above the Line", desc: "Finish the CAT predictor above the passing line", test: (s) => s.exams.some((e) => (e.mode === "CAT Predictor" || e.mode === "Comprehensive Predictor") && String(e.score).startsWith("Above")) },
  { id: "rn", icon: "BadgeCheck", name: "Licensed RN", desc: "Complete the NCLEX-RN phase", test: (s) => roleDone(s, "rn") },
  { id: "eng", icon: "Languages", name: "Fluent & Verified", desc: "Complete English proficiency", test: (s) => roleDone(s, "eng") },
  { id: "visa", icon: "ShieldCheck", name: "VisaScreen Done", desc: "Receive your VisaScreen certificate", test: (s) => roleDone(s, "visa") },
  { id: "touch", icon: "PlaneLanding", name: "Touchdown", desc: "Complete the immigration phase", test: (s) => roleDone(s, "touch") },
  { id: "scholar", icon: "Award", name: "U.S. Clinical Readiness", desc: "Complete all six bedside lessons and earn the certificate", test: (s) => LESSONS.every((l) => s.lessons[l.id]) },
  { id: "streak3", icon: "Flame", name: "On Fire", desc: "Keep a 3-day activity streak", test: (s, m) => m.streak >= 3 },
  { id: "streak7", icon: "Zap", name: "Unstoppable", desc: "Keep a 7-day activity streak", test: (s, m) => m.streak >= 7 },
  { id: "flash", icon: "Layers", name: "Card Shark", desc: "Review 25 flashcards", test: (s) => (s.flash || 0) >= 25 },
  { id: "bank", icon: "Library", name: "Bank Explorer", desc: "Answer 100 question-bank questions", test: (s, m) => m.answered >= 100 },
  { id: "ladder", icon: "Award", name: "Ladder Climber", desc: "Log 5 clinical ladder entries", test: (s) => s.ladder.length >= 5 },
  { id: "credit", icon: "CreditCard", name: "720 Club", desc: "Finish the credit-building roadmap", test: (s) => creditList(s).every((_, i) => s.credit[creditKey(s, i)]) },
];
/** Badges with the milestone names for the chosen destination. */
export function badgesFor(dest) {
  const roles = BADGE_ROLES[dest] || BADGE_ROLES.US; const US = !lifeOf(dest);
  return BADGES.map((b) => {
    if (roles[b.id]) return { ...b, name: roles[b.id][1], desc: roles[b.id][2] };
    if (b.id === "scholar" && !US) return { ...b, name: (WORDS[dest] || WORDS.US).cert, desc: "Complete all six bedside lessons and earn the certificate" };
    if (b.id === "credit" && !US) return { ...b, name: "Credit Builder", desc: "Finish the credit-building checklist" };
    return b;
  });
}
export const BADGE_HUES = [["#0891b2", "#10b981"], ["#4f46e5", "#8b5cf6"], ["#ea580c", "#e11d48"], ["#9333ea", "#db2777"], ["#d97706", "#ea580c"], ["#059669", "#0284c7"]];

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

/** Wraps the app: loads saved state from the device, saves on every change, and exposes metrics + celebrations. */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const [ready, setReady] = useState(false);
  const [celebrate, setCelebrate] = useState([]); // queue of { badge } | { level }
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (raw) {
          const v = JSON.parse(raw); const base = initialState();
          dispatch({ type: "hydrate", state: { ...base, ...v, profile: { ...base.profile, ...(v.profile || {}) } } });
        }
      } catch (e) {}
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)).catch(() => {}); }, [state, ready]);

  const m = useMemo(() => metrics(state), [state]);
  const lvl = levelOf(m.xp);

  // badges + level-ups → celebration queue
  const earned = BADGES.filter((b) => b.test(state, m)).map((b) => b.id);
  const earnedKey = earned.join(",");
  useEffect(() => {
    if (!ready) return;
    if (!Array.isArray(state.badgesSeen)) { dispatch({ type: "seen", ids: earned }); return; }
    const fresh = earned.filter((id) => !state.badgesSeen.includes(id));
    if (fresh.length) {
      const list = badgesFor(destId(state));
      setCelebrate((q) => [...q, ...fresh.map((id) => ({ badge: list.find((b) => b.id === id) }))]);
      dispatch({ type: "seen", ids: [...state.badgesSeen, ...fresh] });
    }
  }, [earnedKey, ready]);
  const prev = useRef(null);
  useEffect(() => {
    if (!ready) return;
    if (prev.current && m.xp > prev.current.xp) {
      setToast({ text: `+${m.xp - prev.current.xp} XP`, k: Date.now() });
      if (lvl.idx > prev.current.lvl) setCelebrate((q) => [...q, { level: lvl.name }]);
    }
    prev.current = { xp: m.xp, lvl: lvl.idx };
  }, [m.xp, ready]);

  const value = { state, dispatch, m, lvl, ready, celebrate, popCelebrate: () => setCelebrate((q) => q.slice(1)), toast, clearToast: () => setToast(null) };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
