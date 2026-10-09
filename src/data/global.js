// Destination countries: the U.S. pathway plus Canada, Australia and New Zealand.
// The U.S. roadmap lives in content.js. The other three come from researched data files in ./countries
// (each with sources and a "checked" date). Migration figures in those files can also be refreshed
// online from data/migration.json (see src/migration.js).
import { PHASES as US_PHASES } from "./content";
import CA from "./countries/ca.json";
import AU from "./countries/au.json";
import NZ from "./countries/nz.json";
import CA_LIFE from "./countries/ca-life.json";
import AU_LIFE from "./countries/au-life.json";
import NZ_LIFE from "./countries/nz-life.json";

export const DESTINATIONS = [
  { id: "US", flag: "🇺🇸", name: "United States", short: "U.S.", cur: "USD", regulator: "State boards of nursing (NCSBN)" },
  { id: "CA", flag: "🇨🇦", name: "Canada", short: "Canada", cur: "CAD", regulator: "Provincial nursing colleges" },
  { id: "AU", flag: "🇦🇺", name: "Australia", short: "Australia", cur: "AUD", regulator: "NMBA and Ahpra" },
  { id: "NZ", flag: "🇳🇿", name: "New Zealand", short: "New Zealand", cur: "NZD", regulator: "Nursing Council of New Zealand" },
];
export const DEST_IDS = DESTINATIONS.map((d) => d.id);
export const destOf = (id) => DESTINATIONS.find((d) => d.id === id) || DESTINATIONS[0];
export const destId = (state) => (state && state.profile && DEST_IDS.includes(state.profile.dest) ? state.profile.dest : "US");

const DATA = { CA, AU, NZ };
/** The researched data file for a destination (null for the U.S., which uses content.js). */
export const countryData = (dest) => DATA[dest] || null;
const LIFE = { CA: CA_LIFE, AU: AU_LIFE, NZ: NZ_LIFE };
/** Practice and everyday-life data (regulators, careers, money, health, driving, license protection, lesson notes). Null for the U.S. */
export const lifeOf = (dest) => LIFE[dest] || null;

/** Country wording used across screens. */
export const WORDS = {
  US: { boards: "Boards", boardsDesc: "State boards & endorsement", bedside: "U.S. bedside", cert: "U.S. Clinical Readiness", regulator: "Board of Nursing", privacy: "HIPAA" },
  CA: { boards: "Colleges", boardsDesc: "Provincial nursing colleges & moving provinces", bedside: "Canadian bedside", cert: "Canada Clinical Readiness", regulator: "nursing college", privacy: "provincial privacy law" },
  AU: { boards: "Registration", boardsDesc: "Ahpra registration & state health employers", bedside: "Australian bedside", cert: "Australia Clinical Readiness", regulator: "NMBA / Ahpra", privacy: "the Privacy Act" },
  NZ: { boards: "Council", boardsDesc: "Nursing Council & Health NZ regions", bedside: "New Zealand bedside", cert: "New Zealand Clinical Readiness", regulator: "Nursing Council", privacy: "the Health Information Privacy Code" },
};

// Rough planning lengths in months for phases 1–5 (phase 6 is the visa / migration stage).
const MONTHS = { CA: [2, 6, 6, 2, 1], AU: [0.5, 2, 2, 6, 2], NZ: [2, 2, 3, 2, 2] };
const US_MONTHS = [3, 2, 2, 1, 2];

const fmtUSD = (n) => "$" + Math.round(n).toLocaleString("en-US");
/** Phases for a destination, all in one shape: { id, n, title, sub, time, costText, steps, links, months, cost? } */
const CACHE = {};
export function phasesFor(dest) {
  if (CACHE[dest]) return CACHE[dest];
  let out;
  if (!DATA[dest]) {
    out = US_PHASES.map((p, i) => ({ ...p, costText: fmtUSD(p.cost[0]) + (p.cost[1] !== p.cost[0] ? "–" + fmtUSD(p.cost[1]) : ""), links: [], months: US_MONTHS[i] }));
  } else {
    out = DATA[dest].pathway.phases.map((p, i) => ({
      id: p.id, n: i + 1, title: p.title, sub: p.sub, time: p.time, costText: p.cost, steps: p.steps, links: p.links || [], months: MONTHS[dest][i],
    }));
  }
  CACHE[dest] = out; return out;
}

/** Labels for the journey path on Today: start, the end of phases 1–5, then arrival. */
export const JOURNEY = {
  US: ["Home", "Credentials", "ATT", "NCLEX", "English", "VisaScreen", "U.S. bedside"],
  CA: ["Home", "Credentials", "College", "Assessment", "NCLEX", "Registered", "Canada bedside"],
  AU: ["Home", "Route", "English", "Portfolio", "Exams", "Ahpra", "Aussie bedside"],
  NZ: ["Home", "English", "TruMerit", "Council", "Theory exam", "OSCE", "NZ bedside"],
};

export const HERO = {
  US: { title: "From foreign RN to U.S. bedside", sub: "Tick each step as you finish it. Phases unlock in order; switch on flexible order if you are running steps in parallel (most nurses study for NCLEX and English at the same time)." },
  CA: { title: "From foreign RN to Canadian bedside", sub: "Pick one province and follow its college's process. Most nurses prepare English and the NCLEX while the college reviews their file, so flexible order helps here." },
  AU: { title: "From foreign RN to Australian bedside", sub: "Start with the NMBA Self-check, or the IQRN fast track if you already practice in a comparable country. Fast-track nurses can skip the exam phase." },
  NZ: { title: "From foreign RN to New Zealand bedside", sub: "New Zealand uses the Nursing Council's own theory exam and an OSCE in Christchurch, not the NCLEX. Registration comes before the visa." },
};

/** Which roadmap phase each milestone badge follows (index into phasesFor), with country wording. */
export const BADGE_ROLES = {
  US: {
    cred: [0, "Credentials Cleared", "Finish the credentials evaluation phase"],
    att: [1, "Cleared to Test", "Receive your Authorization to Test"],
    rn: [2, "Licensed RN", "Complete the NCLEX-RN phase"],
    eng: [3, "Fluent & Verified", "Complete English proficiency"],
    visa: [4, "VisaScreen Done", "Receive your VisaScreen certificate"],
    touch: [5, "Touchdown", "Complete the immigration phase"],
  },
  CA: {
    cred: [0, "Credentials Cleared", "Verify your education for your province"],
    eng: [1, "Fluent & Verified", "Apply to your college and prove English"],
    att: [2, "Assessment Complete", "Finish the competence assessment and any bridging"],
    rn: [3, "NCLEX Passed", "Pass the NCLEX-RN"],
    visa: [4, "Registered in Canada", "Pass jurisprudence and register with your college"],
    touch: [5, "Welcome to Canada", "Get your work permit or permanent residence"],
  },
  AU: {
    cred: [0, "Route Chosen", "Choose your registration route"],
    eng: [1, "Fluent & Verified", "Meet the English standard and gather documents"],
    att: [2, "Portfolio Approved", "Finish the IQNM assessment, orientation and portfolio"],
    rn: [3, "Exams Passed", "Pass the NCLEX and OSCE, or skip them on the fast track"],
    visa: [4, "Ahpra Registered", "Receive general registration"],
    touch: [5, "G'day, Australia", "Finish the skills assessment and visa"],
  },
  NZ: {
    eng: [0, "Fluent & Verified", "Check eligibility and pass English"],
    cred: [1, "Documents Verified", "Verify your documents with TruMerit"],
    att: [2, "Council Approved", "Apply to the Nursing Council"],
    rn: [3, "Theory Exam Passed", "Pass the Nursing Council theory exam"],
    visa: [4, "OSCE Passed", "Finish the orientation course and the OSCE"],
    touch: [5, "Kia ora, New Zealand", "Register, get your APC, job and visa"],
  },
};

/** How the NCLEX practice in this app fits each destination. */
export const NCLEX_FIT = {
  US: { uses: true, text: "Required for your U.S. license. The three benchmark exams follow the NCLEX-RN test plan." },
  CA: { uses: true, text: "Canada uses the same NCLEX-RN for RNs in every province except Quebec, which has its own French-language exam." },
  AU: { uses: true, text: "Australia's Outcomes-Based Assessment starts with the NCLEX-RN, then an OSCE. Nurses on the IQRN fast track skip both." },
  NZ: { uses: false, text: "New Zealand doesn't use the NCLEX. The Nursing Council has its own theory exam and an OSCE. This practice still builds the clinical judgment both test." },
};

/* ---------- province choice (Canada) ----------
 * Canada has no national license: the nurse picks one province and follows that college's rules.
 * The choice is saved per destination in profile.regions, e.g. { CA: "ON" }. */
export const PICKS_REGION = { CA: true };
export const REGION_WORD = { CA: "province" };
/** Provinces/territories with their college: [{ code, region, abbr, name, notes, tags, url }]. */
export const regionsOf = (dest) => (PICKS_REGION[dest] && LIFE[dest] ? LIFE[dest].regulators.list : []);
/** The region the nurse picked for the current destination (or null). */
export function regionOf(state) {
  const d = destId(state); const code = state && state.profile && state.profile.regions ? state.profile.regions[d] : null;
  return regionsOf(d).find((r) => r.code === code) || null;
}
/** Which college a roadmap step is about, from its "Ontario (CNO):" style prefix; null if it applies to everyone. */
export function stepRegion(dest, text) {
  const m = /^([A-Z][A-Za-z .&]+?) \(([A-Z]{2,6})\):/.exec(text || "");
  if (!m) return null;
  return regionsOf(dest).find((r) => r.abbr === m[2] || r.region === m[1]) || null;
}
