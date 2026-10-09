// Migration monitors for Canada, Australia and New Zealand, kept current without an app update.
// Works like the visa bulletin (src/bulletin.js): on launch the app downloads one small public JSON file
// (expo.extra.migrationUrl in app.json). No personal data is sent. If the phone is offline or the file is
// broken, the app uses the last good copy it saved, and failing that, the data built into the app
// (src/data/countries/*.json).
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { countryData } from "./data/global";

const CACHE_KEY = "usrn.migration.v1";
const URL = (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.migrationUrl) || "";
const MIN_GAP_MS = 6 * 60 * 60 * 1000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const KEYS = ["CA", "AU", "NZ"];
const isObj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const isArr = Array.isArray;
const str = (x) => typeof x === "string";

/** Checks one country's migration block has the shape the screens need. */
export function validCountry(id, m) {
  if (!isObj(m)) return false;
  if (id === "CA") {
    const ee = m.express_entry;
    return isObj(ee) && str(ee.summary) && isArr(ee.draws) && ee.draws.every((d) => isObj(d) && ISO.test(d.date || "") && typeof d.crs === "number" && typeof d.invitations === "number")
      && isArr(m.pnp) && m.pnp.every((p) => isObj(p) && str(p.province) && str(p.stream) && str(p.status));
  }
  if (id === "AU") {
    return isArr(m.occupations) && m.occupations.every((o) => isObj(o) && str(o.anzsco) && str(o.title))
      && isObj(m.points) && typeof m.points.minimum === "number" && str(m.points.summary)
      && isArr(m.states) && m.states.every((x) => isObj(x) && str(x.state) && str(x.status))
      && (m.rounds === undefined || isArr(m.rounds));
  }
  if (id === "NZ") {
    return isObj(m.green_list) && str(m.green_list.tier) && isArr(m.green_list.requirements)
      && isObj(m.aewv) && str(m.aewv.summary) && isObj(m.smc) && str(m.smc.summary);
  }
  return false;
}

/** Returns { CA: {checked, migration}, … } with only the countries that pass validation, or null. */
export function validate(file) {
  if (!isObj(file)) return null;
  const out = {};
  KEYS.forEach((id) => {
    const c = file[id];
    if (isObj(c) && ISO.test(c.checked || "") && validCountry(id, c.migration)) out[id] = { checked: c.checked, migration: c.migration };
  });
  return Object.keys(out).length ? out : null;
}

const BUNDLED = {};
KEYS.forEach((id) => { const d = countryData(id); BUNDLED[id] = { checked: d.checked, migration: d.migration, source: "bundled" }; });

// Keep whichever copy of each country is newer.
function merge(cur, next, source) {
  if (!next) return cur;
  const out = { ...cur }; let changed = false;
  KEYS.forEach((id) => {
    const n = next[id]; if (!n) return;
    if (!out[id] || n.checked >= out[id].checked) { out[id] = { ...n, source }; changed = true; }
  });
  return changed ? out : cur;
}

const Ctx = createContext(BUNDLED);

export function MigrationProvider({ children }) {
  const [data, setData] = useState(BUNDLED);
  const cur = useRef(BUNDLED);
  useEffect(() => {
    let alive = true; let last = 0;
    const apply = (v, src) => { if (!alive) return; const m = merge(cur.current, v, src); if (m !== cur.current) { cur.current = m; setData(m); } };
    const load = async () => { try { apply(validate(JSON.parse(await AsyncStorage.getItem(CACHE_KEY))), "saved"); } catch (e) {} };
    const fetchLatest = async () => {
      if (!URL || Date.now() - last < MIN_GAP_MS) return; last = Date.now();
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 10000);
      try {
        const res = await fetch(URL, { signal: ctrl.signal, headers: { "Cache-Control": "no-cache" } });
        if (!res.ok) return;
        const v = validate(await res.json());
        if (v) { apply(v, "online"); AsyncStorage.setItem(CACHE_KEY, JSON.stringify(v)).catch(() => {}); }
      } catch (e) { /* offline or bad file: keep what we have */ } finally { clearTimeout(timer); }
    };
    load().then(fetchLatest);
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") fetchLatest(); });
    return () => { alive = false; sub.remove(); };
  }, []);
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const short = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MON[m - 1]} ${d}, ${y}`; };

/** One headline figure for the Today tile. */
export function headlineOf(dest, m) {
  if (!m) return { value: "—", label: "" };
  if (dest === "CA") {
    const d = [...m.express_entry.draws].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return d ? { value: `CRS ${d.crs}`, label: `Healthcare draw · ${short(d.date)}` } : { value: "No draws", label: "Express Entry healthcare" };
  }
  if (dest === "AU") return { value: `${m.points.minimum} pts`, label: "Minimum points for a SkillSelect EOI" };
  if (dest === "NZ") return { value: "Tier 1", label: "Green List · Straight to Residence" };
  return { value: "—", label: "" };
}

/** { migration, checked, source, headline } for a destination (null fields for the U.S.). */
export function useMigration(dest) {
  const all = useContext(Ctx); const c = all[dest];
  if (!c) return { migration: null, checked: null, source: null, headline: { value: "—", label: "" } };
  return { migration: c.migration, checked: c.checked, source: c.source, headline: headlineOf(dest, c.migration) };
}
