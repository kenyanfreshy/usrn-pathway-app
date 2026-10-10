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
// Legacy fixed exam sets (the `exam` field). Kept for reference; exams are now assembled from the whole bank.
export const EXAM_ITEMS = { 1: BANK.filter((q) => q.exam === 1), 2: BANK.filter((q) => q.exam === 2), 3: BANK.filter((q) => q.exam === 3) };
export const T1_COUNT = 85, T2_COUNT = 150;
/** 1205 → "1,205" (no Intl needed). */
export const fmtN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const TESTS = {
  t1: { title: "Diagnostic Benchmark", count: T1_COUNT },
  t2: { title: "NGN Clinical Judgment Simulator", count: T2_COUNT },
  t3: { title: "Comprehensive Predictor", count: BANK.length },
};

/* ---------------- blueprint assembly ----------------
 * Every benchmark exam is assembled on the phone from the whole bank (no network) with fixed Client Needs quotas
 * from CN_TARGET (mid-points of the NCSBN test plan; pharmacology 15%, never above 16% of an exam). Questions the
 * nurse hasn't answered yet are used first, so repeat attempts see new questions. The assembled list is saved with
 * the in-progress run, so a resumed exam keeps exactly the same questions. */
export function examQuotas(n) { return allocate(BANK, n); }

/** Pick `want` questions per category from pool, unseen first. Tops up from any category if one runs short. */
function fill(pool, want, seen) {
  const s = seen instanceof Set ? seen : new Set(seen || []);
  const by = {};
  shuffle(pool).forEach((q) => { (by[q.cat] = by[q.cat] || []).push(q); });
  Object.keys(by).forEach((c) => { by[c].sort((x, y) => (s.has(x.id) ? 1 : 0) - (s.has(y.id) ? 1 : 0)); });
  const picked = [], spare = [];
  Object.keys(by).forEach((c) => { const k = want[c] || 0; picked.push(...by[c].slice(0, k)); spare.push(...by[c].slice(k)); });
  const total = Object.values(want).reduce((a, b) => a + b, 0);
  if (picked.length < total) picked.push(...spare.sort((x, y) => (s.has(x.id) ? 1 : 0) - (s.has(y.id) ? 1 : 0)).slice(0, total - picked.length));
  return shuffle(picked);
}

/** Test 1: 85 questions in blueprint proportions. `seen`: ids already answered (state.qstats keys). */
export function buildTest1(seen) { return fill(BANK, examQuotas(T1_COUNT), seen).map(shuffleItem); }

/** Test 2: 4 NGN case studies (6 items each) plus stand-alone items. The stand-alone quotas are the 150-item
 *  blueprint minus the case items' own categories, so the whole exam stays on blueprint. */
export function buildTest2(seen) {
  const cases = shuffle(NGN_CASES.map((c) => c.id)).slice(0, T2_CASES);
  const want = examQuotas(T2_COUNT);
  cases.forEach((id) => { const cs = NGN_CASES.find((c) => c.id === id); const per = cs.items ? cs.items.length : 6; if (cs.area) want[cs.area] = Math.max(0, (want[cs.area] || 0) - per); });
  const caseItems = cases.reduce((n, id) => { const cs = NGN_CASES.find((c) => c.id === id); return n + (cs.items ? cs.items.length : 6); }, 0);
  // keep the total at 150 even if a case's area quota hit zero
  let short = T2_COUNT - caseItems - Object.values(want).reduce((a, b) => a + b, 0);
  const order = Object.keys(CN_TARGET).sort((a, b) => CN_TARGET[b] - CN_TARGET[a]).filter((c) => c !== "Pharmacological & Parenteral Therapies");
  for (let i = 0; short > 0; i++, short--) want[order[i % order.length]] += 1;
  // too many (a case-heavy draw, e.g. four Physiological Adaptation cases): trim the largest stand-alone quotas
  while (short < 0) { const c = Object.keys(want).sort((x, y) => want[y] - want[x])[0]; want[c] -= 1; short += 1; }
  const items = fill(BANK, want, seen).map(shuffleItem);
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
/** Short Client Needs names for narrow spaces (heatmap row labels, small badges), so long words never break mid-word. */
export const CAT_SHORT = {
  "Management of Care": "Management of Care", "Safety & Infection Control": "Safety & Infection",
  "Health Promotion & Maintenance": "Health Promotion", "Psychosocial Integrity": "Psychosocial",
  "Basic Care & Comfort": "Basic Care", "Pharmacological & Parenteral Therapies": "Pharm Therapies",
  "Reduction of Risk Potential": "Risk Reduction", "Physiological Adaptation": "Physiological Adapt.",
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
  const pool = BANK.filter((q) => !used.has(q.id)); if (!pool.length) return null;
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

/* ---------------- blueprint-balanced practice ----------------
 * The bank has more pharmacology items than the NCLEX blueprint (pharmacology is most of the newest content), so
 * mixed practice sets are drawn category by category using CN_TARGET instead of uniformly from the whole bank.
 * The three benchmark exams already follow the blueprint and don't use this. */
function allocate(pool, n) {
  const cats = Object.keys(CN_TARGET).filter((c) => pool.some((q) => q.cat === c));
  if (!cats.length) return {};
  const total = cats.reduce((s, c) => s + CN_TARGET[c], 0);
  const raw = cats.map((c) => [c, (CN_TARGET[c] / total) * n]);
  const out = Object.fromEntries(raw.map(([c, x]) => [c, Math.floor(x)]));
  let left = n - Object.values(out).reduce((s, x) => s + x, 0);
  raw.sort((a, b) => (b[1] % 1) - (a[1] % 1)).forEach(([c]) => { if (left > 0) { out[c] += 1; left -= 1; } });
  return out;
}

/** n questions from pool in NCLEX Client Needs proportions; categories that run short are topped up from the rest. */
export function blueprintSample(pool, n) {
  if (pool.length <= n) return shuffle(pool);
  const want = allocate(pool, n); const by = {};
  shuffle(pool).forEach((q) => { (by[q.cat] = by[q.cat] || []).push(q); });
  const picked = []; const spare = [];
  Object.keys(by).forEach((c) => { const k = want[c] || 0; picked.push(...by[c].slice(0, k)); spare.push(...by[c].slice(k)); });
  return shuffle([...picked, ...shuffle(spare).slice(0, n - picked.length)]);
}

/** One question chosen by a numeric seed, with categories weighted by the blueprint (used for Question of the Day). */
export function blueprintPick(pool, seed) {
  const cats = Object.keys(CN_TARGET).filter((c) => pool.some((q) => q.cat === c));
  if (!cats.length) return pool[seed % Math.max(1, pool.length)];
  const total = cats.reduce((s, c) => s + CN_TARGET[c], 0);
  let r = ((seed * 7919) % 10000) / 10000 * total; let cat = cats[cats.length - 1];
  for (const c of cats) { if (r < CN_TARGET[c]) { cat = c; break; } r -= CN_TARGET[c]; }
  const inCat = pool.filter((q) => q.cat === cat);
  return inCat[seed % inCat.length];
}
