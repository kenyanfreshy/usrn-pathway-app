// Date, money and quiz helpers shared by every screen.
export const dkey = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const todayKey = () => dkey(today());
export const parseISO = (iso) => { if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null; const [y, m, d] = iso.split("-").map(Number); const x = new Date(y, m - 1, d); return isNaN(x) ? null : x; };
export const isISO = (iso) => !!parseISO(iso);
export const daysUntil = (iso) => { const d = parseISO(iso); if (!d) return null; return Math.round((d - today()) / 86400000); };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (iso) => { const d = parseISO(iso); return d ? `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "—"; };
export const monYr = (d) => `${MON[d.getMonth()]} ${d.getFullYear()}`;
export const addYears = (iso, n) => { const d = parseISO(iso); if (!d) return ""; d.setFullYear(d.getFullYear() + n); return dkey(d); };
export const isoOffset = (days) => { const d = today(); d.setDate(d.getDate() + days); return dkey(d); };
export const addMonths = (d, m) => { const x = new Date(d); x.setDate(x.getDate() + Math.round(m * 30.44)); return x; };
const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const money = (n) => "$" + group(Math.round(n || 0));
export const uid = () => Math.random().toString(36).slice(2, 9);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const num = (v) => { const x = parseFloat(String(v).replace(/,/g, "")); return isFinite(x) ? x : 0; };

export const shuffle = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
export function shuffleOptions(q) {
  const opts = shuffle(q.options); const ids = ["a", "b", "c", "d", "e", "f"]; const map = {};
  const options = opts.map((o, k) => { map[o.id] = ids[k]; return { ...o, id: ids[k] }; });
  return { ...q, options, answer: map[q.answer] };
}

export function pmiSchedule(price, downPct, rate, years) {
  const loan = price * (1 - downPct / 100); const r = rate / 1200; const n = Math.max(1, Math.round(Math.min(years, 50) * 12)); // cap: a typo like 30000 years would freeze the loop
  const pay = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
  let bal = loan, m80 = null, m78 = null;
  for (let k = 1; k <= n && (m80 === null || m78 === null); k++) {
    bal -= pay - bal * r;
    if (m80 === null && bal <= price * 0.8) m80 = k;
    if (m78 === null && bal <= price * 0.78) m78 = k;
  }
  return { loan, pay, m80, m78 };
}
export const yrsMo = (m) => m === null || m === undefined ? "—" : (m >= 12 ? Math.floor(m / 12) + " yr " : "") + (m % 12 ? (m % 12) + " mo" : "");
export function planCost(p, bills) {
  const ded = num(p.ded), co = num(p.co) / 100, oop = num(p.oop);
  const share = bills <= ded ? bills : ded + (bills - ded) * co;
  return num(p.prem) * 12 + Math.min(share, oop) - num(p.hsa);
}
