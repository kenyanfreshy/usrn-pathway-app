// Builds a NurseBound demo backup (Canada/Ontario nurse, mid-journey) for store screenshots.
const Q = require(process.argv[2] + "/src/data/questions.json");
const pad = (n) => String(n).padStart(2, "0");
const day = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// accuracy per category: a believable spread with clear weak areas
const ACC = { "Management of Care": 0.81, "Safety & Infection Control": 0.86, "Health Promotion & Maintenance": 0.78, "Psychosocial Integrity": 0.74,
  "Basic Care & Comfort": 0.83, "Pharmacological & Parenteral Therapies": 0.58, "Reduction of Risk Potential": 0.66, "Physiological Adaptation": 0.62 };
const qstats = {}, srs = {};
Q.filter((q) => q.bank === "NCLEX" || !q.bank).forEach((q) => {
  if (rnd() > 0.55) return;
  const n = 1 + Math.floor(rnd() * 2); let r = 0, last = 0;
  for (let i = 0; i < n; i++) { last = rnd() < (ACC[q.cat] || 0.7) ? 1 : 0; r += last; }
  qstats[q.id] = [n, r, last];
  if (!last) srs[q.id] = { box: 0, due: day(rnd() < 0.35 ? 0 : 1 + Math.floor(rnd() * 3)) };
});
const daily = {}, days = {};
for (let i = 0; i < 21; i++) { if (i === 9) continue; daily[day(-i)] = 18 + Math.floor(rnd() * 25); days[day(-i)] = true; }
const cats = Object.keys(ACC);
const byCat = (total, accAdj) => { const o = {}; const w = { "Management of Care": 17, "Safety & Infection Control": 10, "Health Promotion & Maintenance": 7, "Psychosocial Integrity": 8, "Basic Care & Comfort": 7, "Pharmacological & Parenteral Therapies": 14, "Reduction of Risk Potential": 11, "Physiological Adaptation": 11 };
  let sum = 0; cats.forEach((c) => { const n = Math.round(w[c] * total / 85); const r = Math.round(n * Math.min(0.95, ACC[c] + accAdj)); o[c] = [r, n]; sum += n; }); return o; };
const pctOf = (b) => { let r = 0, n = 0; Object.values(b).forEach(([a, m]) => { r += a; n += m; }); return [r, n, Math.round(100 * r / n)]; };
const d1 = byCat(85, 0.0), d0 = byCat(85, -0.08);
const [r1, n1, p1] = pctOf(d1), [r0, n0, p0] = pctOf(d0);
const exams = [
  { mode: "Diagnostic Benchmark", score: `${r1}/${n1}`, pct: p1, date: day(-1), byCat: d1 },
  { mode: "NGN Case Study", score: "21/27 pts · Sepsis after surgery", pct: 78, date: day(-4) },
  { mode: "Question Bank", score: "38/50", pct: 76, date: day(-6) },
  { mode: "Diagnostic Benchmark", score: `${r0}/${n0}`, pct: p0, date: day(-18), byCat: d0 },
];
const steps = {};
["ca-1-0", "ca-1-1", "ca-1-5", "ca-2-0", "ca-2-1", "ca-2-2", "ca-2-5"].forEach((k) => { steps[k] = true; });
// steps that don't apply to Ontario are ticked to skip, as the roadmap suggests
["ca-1-2", "ca-1-3", "ca-1-4", "ca-2-3", "ca-2-4"].forEach((k) => { steps[k] = true; });
const state = {
  steps, flexible: true, exams, srs, qstats, daily, days, catSeen: [], runs: {},
  english: {}, plan: { goal: 30, remind: false, hour: 19 },
  lessons: { sbar: { best: 100 }, code: { best: 80 } }, careers: {}, credit: {}, drive: {}, qotd: {}, flash: 32,
  profile: { dest: "CA", regions: { CA: "ON" }, name: "Maria", lastName: "Santos", homeCountry: "Philippines", specialty: "Medical-surgical", targetState: "", country: "ph", pd: "", testDate: day(42), attEnd: "" },
  palette: "vivid", badgesSeen: null, alertsOn: false,
};
const text = `NURSEBOUND-BACKUP v1\nCreated ${day(0)}. Demo data for store screenshots.\n${JSON.stringify(state)}`;
require("fs").writeFileSync(process.argv[3], text);
console.log("questions answered", Object.keys(qstats).length, "due", Object.values(srs).filter((s) => s.due <= day(0)).length, "diag", p0, "->", p1, "bytes", text.length);
