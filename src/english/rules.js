// English score rules by destination (verified in src/data/english-rules.json) and a score checker.
import RULES from "../data/english-rules.json";
import { destId, regionOf } from "../data/global";

export const SKILLS = [["L", "Listening"], ["R", "Reading"], ["W", "Writing"], ["S", "Speaking"]];
export const CA_PROVINCES = ["ON", "BC", "AB"];
export const JURIS = RULES.jurisdictions;
export const juris = (id) => JURIS.find((j) => j.id === id) || null;

/** Jurisdiction for the nurse's destination. Canada uses the chosen province when it's ON, BC or AB; otherwise Ontario. */
export function jurisFor(state, override) {
  if (override) return juris(override);
  const d = destId(state);
  if (d !== "CA") return juris(d);
  const r = regionOf(state);
  return juris("CA-" + (r && CA_PROVINCES.includes(r.code) ? r.code : "ON"));
}

/** OET grade letter for a 0–500 score. */
export function oetGrade(n) {
  const g = RULES.oetGrades.find((x) => n >= x.min && n <= x.max);
  return g ? g.grade : "";
}

/** Check scores against a jurisdiction. test: "oet" | "ielts". scores: { L, R, W, S, overall? } as numbers (or ""/null).
 *  Returns { accepted, rows: [{ k, label, min, got, ok }], pass, missing } */
export function check(j, test, scores) {
  const req = j && j[test];
  if (!req) return { accepted: false, rows: [], pass: false, missing: false };
  const num = (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));
  const rows = [];
  if (test === "ielts" && req.overall != null) rows.push({ k: "overall", label: "Overall", min: req.overall, got: num(scores.overall), ok: false });
  SKILLS.forEach(([k, label]) => { if (req[k] != null) rows.push({ k, label, min: req[k], got: num(scores[k]), ok: false }); });
  rows.forEach((r) => { r.ok = r.got != null && r.got >= r.min; });
  const missing = rows.some((r) => r.got == null);
  return { accepted: true, rows, pass: !missing && rows.every((r) => r.ok), missing };
}

/** Plain-language combining rule. */
export function combineText(j) {
  const c = j.combine || {};
  if (c.allowed === false) return "All scores must come from one sitting (one complete attempt).";
  if (c.allowed === true) return [c.window ? `You can combine sittings: ${c.window.charAt(0).toLowerCase()}${c.window.slice(1)}.` : "You can combine sittings.", c.sameTest ? "Both sittings must be the same test." : null, c.floors].filter(Boolean).join(" ");
  return "The regulator doesn't say whether results from different sittings can be combined. Plan to meet every score in one sitting, or ask them first.";
}

export const RULES_META = { checked: RULES.checked, sources: RULES.sources, uncertain: RULES.uncertain, decision: RULES.decision, converter: RULES.converter, oetGrades: RULES.oetGrades };
