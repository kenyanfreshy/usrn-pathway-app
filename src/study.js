// Study helpers for the smart review and the personal study plan. All on the phone.
import { router } from "expo-router";
import { BANK, shuffleItem } from "./exam";
import { setRun } from "./runStore";
import { shuffle, daysUntil, dkey } from "./util";
import { dueReview } from "./state";

export const CATS = ["Management of Care", "Safety & Infection Control", "Health Promotion & Maintenance", "Psychosocial Integrity",
  "Basic Care & Comfort", "Pharmacological & Parenteral Therapies", "Reduction of Risk Potential", "Physiological Adaptation"];
const BY_ID = Object.fromEntries(BANK.map((q) => [q.id, q]));

/** Accuracy per Client Needs category from everything answered so far: [{ cat, seen, pct }] (pct null if < 5 answered). */
export function catAccuracy(state) {
  const st = state.qstats || {}; const agg = {};
  CATS.forEach((c) => { agg[c] = [0, 0]; });
  Object.entries(st).forEach(([id, v]) => { const q = BY_ID[id]; if (!q || !agg[q.cat]) return; agg[q.cat][0] += v[0]; agg[q.cat][1] += v[1]; });
  return CATS.map((cat) => ({ cat, seen: agg[cat][0], pct: agg[cat][0] >= 5 ? agg[cat][1] / agg[cat][0] : null }));
}

/** Weakest categories first (unknown categories count as weak so they get practiced). */
export function weakest(state, n = 2) {
  return [...catAccuracy(state)].sort((a, b) => (a.pct ?? 0.5) - (b.pct ?? 0.5) || a.seen - b.seen).slice(0, n);
}

export const dueCount = (state) => dueReview(state).filter((id) => BY_ID[id]).length;

/** Start a smart review run (tutor mode so each answer updates the schedule). */
export function startReview(state, max = 25) {
  const ids = dueReview(state).filter((id) => BY_ID[id]).slice(0, max);
  if (!ids.length) return false;
  setRun({ items: shuffle(ids.map((id) => BY_ID[id])).map(shuffleItem), tutor: true, label: "Smart Review" });
  router.push({ pathname: "/quiz", params: { mode: "bank" } });
  return true;
}

/** Practice set from given categories: unseen questions first, then missed ones, then the rest. */
export function startPractice(state, cats, count) {
  const st = state.qstats || {};
  const pool = BANK.filter((q) => cats.includes(q.cat));
  const unseen = shuffle(pool.filter((q) => !st[q.id])), missed = shuffle(pool.filter((q) => st[q.id] && !st[q.id][2])), rest = shuffle(pool.filter((q) => st[q.id] && st[q.id][2]));
  const items = [...unseen, ...missed, ...rest].slice(0, Math.max(1, count)).map(shuffleItem);
  if (!items.length) return false;
  setRun({ items, tutor: true, label: "Study Plan" });
  router.push({ pathname: "/quiz", params: { mode: "bank" } });
  return true;
}

/** Questions answered on each of the last n days (oldest first): [{ key, n, label }]. */
export function lastDays(state, n = 7) {
  const out = []; const d = new Date();
  for (let k = n - 1; k >= 0; k--) {
    const x = new Date(d); x.setDate(d.getDate() - k); const key = dkey(x);
    out.push({ key, n: (state.daily || {})[key] || 0, label: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][x.getDay()] });
  }
  return out;
}

/** Plan stage from days until the exam. */
export function stageOf(days) {
  if (days === null || days === undefined) return { id: "nodate", title: "Set Your Exam Date", sub: "Add your test date so the plan can pace itself." };
  if (days < 0) return { id: "after", title: "Your Exam Date Has Passed", sub: "Update your test date, or keep practicing to stay sharp." };
  if (days <= 21) return { id: "final", title: "Final Review", sub: "Full-length practice and smart review every day, then rest the day before." };
  if (days <= 60) return { id: "build", title: "Build and Test", sub: "Work your weak areas daily and take a benchmark every week." };
  return { id: "found", title: "Foundation", sub: "Cover every Client Needs area and build a daily habit." };
}

export const daysToExam = (state) => daysUntil(state.profile.testDate);
