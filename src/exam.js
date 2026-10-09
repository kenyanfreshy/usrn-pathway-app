// Exam engine: item scoring (NCSBN-style), option shuffling, the three benchmark exams and the adaptive predictor.
// Pure JavaScript: no React, so it can be tested on its own.
import { shuffle } from "./util";
import BANK_ALL from "./data/questions.json";
import { NGN_CASES } from "./data/ngn";

export const BANK = BANK_ALL.filter((q) => q.active !== false);
export const typeOf = (q) => q.type || (Array.isArray(q.answer) ? "sata" : "single");

/* ---------------- scoring ----------------
 * single  : 0/1
 * sata    : NCSBN +/- rule: +1 per correct option chosen, −1 per incorrect option chosen, never below 0
 * order   : ordered response is scored right/wrong (0/1); the whole sequence must match
 */
export function itemMax(q) { return typeOf(q) === "sata" ? q.answer.length : 1; }
export function scoreItem(q, a) {
  const t = typeOf(q);
  if (a === undefined || a === null) return [0, itemMax(q)];
  if (t === "single") return [a === q.answer ? 1 : 0, 1];
  if (t === "order") return [Array.isArray(a) && a.length === q.answer.length && a.every((x, i) => x === q.answer[i]) ? 1 : 0, 1];
  const plus = a.filter((x) => q.answer.includes(x)).length, minus = a.filter((x) => !q.answer.includes(x)).length;
  return [Math.max(0, plus - minus), q.answer.length];
}
/** Full credit only. Used for "correct / incorrect" marks, mastery stats and the adaptive engine. */
export function isCorrect(q, a) { const [g, m] = scoreItem(q, a); return g === m; }
export function isAnswered(q, a) {
  const t = typeOf(q);
  if (t === "single") return !!a;
  if (t === "order") return Array.isArray(a) && a.length === q.options.length;
  return Array.isArray(a) && a.length > 0;
}
/** Human-readable correct answer, e.g. "B" · "A, C, D" · "C → A → D → B". */
export function answerText(q) {
  const t = typeOf(q); const up = (x) => String(x).toUpperCase();
  if (t === "single") return up(q.answer);
  return q.answer.map(up).join(t === "order" ? " → " : ", ");
}

/** Shuffle the option order and relabel a–f, keeping the answer key in step. */
export function shuffleItem(q) {
  const ids = ["a", "b", "c", "d", "e", "f"]; const map = {};
  const options = shuffle(q.options).map((o, k) => { map[o.id] = ids[k]; return { ...o, id: ids[k] }; });
  const answer = Array.isArray(q.answer) ? q.answer.map((x) => map[x]) : map[q.answer];
  return { ...q, options, answer };
}

/** Points per Client Needs category: { cat: [earned, possible] } */
export function breakdown(items, ans) {
  const by = {};
  items.forEach((q) => { const [g, m] = scoreItem(q, ans[q.id]); by[q.cat] = by[q.cat] || [0, 0]; by[q.cat][0] += g; by[q.cat][1] += m; });
  return by;
}

/* ---------------- the three benchmark exams ---------------- */
/** Test 2 uses 4 of the case studies (picked at random each attempt) so it stays at 150 items. */
export const T2_CASES = 4;
export const EXAM_ITEMS = { 1: BANK.filter((q) => q.exam === 1), 2: BANK.filter((q) => q.exam === 2), 3: BANK.filter((q) => q.exam === 3) };
export const TESTS = {
  t1: { title: "Diagnostic Benchmark", count: EXAM_ITEMS[1].length },
  t2: { title: "NGN Clinical Judgment Simulator", count: EXAM_ITEMS[2].length + T2_CASES * 6 },
  t3: { title: "Comprehensive Predictor", count: EXAM_ITEMS[3].length },
};

export function buildTest1() { return shuffle(EXAM_ITEMS[1]).map(shuffleItem); }

/** Test 2: the NGN case studies interleaved with the stand-alone items, like sections of the real exam. */
export function buildTest2() {
  const items = shuffle(EXAM_ITEMS[2]).map(shuffleItem);
  const cases = shuffle(NGN_CASES.map((c) => c.id)).slice(0, T2_CASES);
  const per = Math.ceil(items.length / cases.length); const blocks = [];
  cases.forEach((id, k) => {
    blocks.push({ kind: "case", id });
    const chunk = items.slice(k * per, (k + 1) * per);
    if (chunk.length) blocks.push({ kind: "items", items: chunk });
  });
  return blocks;
}

/* ---------------- adaptive predictor (Test 3) ----------------
 * A simplified computerized adaptive test using the same rules as the NCLEX-RN since 2023:
 * minimum 85 items, maximum 150, stop early once the 95% confidence interval is clearly above or below
 * the passing line, otherwise judge on the final ability estimate. Item difficulty comes from the
 * item's 1–3 rating; ability is a Rasch (1-parameter) MAP estimate with a standard-normal prior.
 */
export const CAT_MIN = 85, CAT_MAX = 150;
// Client Needs targets (mid-points of the NCSBN 2023 test plan ranges)
export const CN_TARGET = {
  "Management of Care": 0.20, "Safety & Infection Control": 0.12, "Health Promotion & Maintenance": 0.09, "Psychosocial Integrity": 0.09,
  "Basic Care & Comfort": 0.09, "Pharmacological & Parenteral Therapies": 0.15, "Reduction of Risk Potential": 0.12, "Physiological Adaptation": 0.14,
};
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return ((h % 1000) + 1000) % 1000 / 1000; };
export const difficultyOf = (q) => ({ 1: -1.2, 2: 0, 3: 1.2 }[q.difficulty] ?? 0) + (hash(q.id) - 0.5) * 0.6;
const P = (th, b) => 1 / (1 + Math.exp(-(th - b)));

/** MAP ability estimate and standard error from a response history [{ b, ok }]. */
export function estimate(hist) {
  let th = 0;
  for (let k = 0; k < 25; k++) {
    let g = -th, h = -1;
    hist.forEach(({ b, ok }) => { const p = P(th, b); g += (ok ? 1 : 0) - p; h -= p * (1 - p); });
    const step = g / h; th -= step;
    th = Math.max(-4, Math.min(4, th));
    if (Math.abs(step) < 1e-4) break;
  }
  const info = 1 + hist.reduce((n, { b }) => { const p = P(th, b); return n + p * (1 - p); }, 0);
  return { theta: th, se: 1 / Math.sqrt(info) };
}

/** Decide whether to stop: { stop, verdict: "pass" | "fail" | null } */
export function stopRule(hist) {
  const n = hist.length; const { theta, se } = estimate(hist);
  if (n >= CAT_MIN && Math.abs(theta) / se >= 1.96) return { stop: true, verdict: theta > 0 ? "pass" : "fail", theta, se };
  if (n >= CAT_MAX) return { stop: true, verdict: theta > 0 ? "pass" : "fail", theta, se };
  return { stop: false, verdict: null, theta, se };
}

/** Next item: keep the Client Needs mix on target, prefer items not seen in earlier attempts, match difficulty to ability. */
export function nextItem(hist, seen = []) {
  const used = new Set(hist.map((h) => h.item.id));
  const pool = EXAM_ITEMS[3].filter((q) => !used.has(q.id)); if (!pool.length) return null;
  const n = hist.length; const count = {};
  hist.forEach((h) => { count[h.item.cat] = (count[h.item.cat] || 0) + 1; });
  const cats = Object.keys(CN_TARGET).filter((c) => pool.some((q) => q.cat === c));
  const cat = cats.sort((a, b) => (CN_TARGET[b] * (n + 1) - (count[b] || 0)) - (CN_TARGET[a] * (n + 1) - (count[a] || 0)))[0];
  const { theta } = estimate(hist);
  const seenSet = new Set(seen);
  let cand = pool.filter((q) => q.cat === cat);
  const fresh = cand.filter((q) => !seenSet.has(q.id)); if (fresh.length) cand = fresh;
  const top = cand.sort((a, b) => Math.abs(difficultyOf(a) - theta) - Math.abs(difficultyOf(b) - theta)).slice(0, 4);
  return shuffleItem(top[Math.floor(Math.random() * top.length)]);
}
