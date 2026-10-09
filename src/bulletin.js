// Visa bulletin dates, kept current without an app update.
// On launch the app downloads one small public JSON file (expo.extra.bulletinUrl in app.json).
// No personal data is sent: it is a plain file download, like loading a web page.
// If the phone is offline or the file is broken, the app uses the last good copy it saved,
// and failing that, the dates built into the app (src/data/content.js → BULLETIN).
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { BULLETIN as BUNDLED } from "./data/content";

const CACHE_KEY = "usrn.bulletin.v1";
const URL = (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.bulletinUrl) || "";
const MIN_GAP_MS = 6 * 60 * 60 * 1000; // check at most every 6 hours
const TONES = ["ok", "warn", "crit"];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Returns a cleaned bulletin, or null if the data is not usable. */
export function validate(b) {
  if (!b || typeof b !== "object") return null;
  if (typeof b.month !== "string" || !/^\d{4}-\d{2}$/.test(b.month)) return null;
  if (typeof b.label !== "string" || !Array.isArray(b.rows) || !b.rows.length) return null;
  const rows = [];
  for (const r of b.rows) {
    if (!r || typeof r.key !== "string" || typeof r.name !== "string") return null;
    if (!ISO.test(r.fa || "") || !ISO.test(r.dff || "")) return null;
    const rate = Number(r.rate);
    rows.push({ key: r.key, name: r.name, fa: r.fa, dff: r.dff, alert: typeof r.alert === "string" ? r.alert : "",
      tone: TONES.includes(r.tone) ? r.tone : "warn", rate: rate > 0 && rate < 60 ? rate : 6 });
  }
  return { month: b.month, label: b.label, checked: ISO.test(b.checked || "") ? b.checked : null, rows };
}

const newer = (a, b) => (a && (!b || a.month >= b.month) ? a : b);
const BASE = validate(BUNDLED);

const Ctx = createContext({ bulletin: BASE, source: "bundled", refresh: () => {} });

export function BulletinProvider({ children }) {
  const [bulletin, setBulletin] = useState(BASE);
  const [source, setSource] = useState("bundled");
  const cur = useRef(BASE);

  useEffect(() => {
    let alive = true; let last = 0;
    const apply = (b, src) => {
      if (!alive || !b || newer(b, cur.current) !== b) return;
      cur.current = b; setBulletin(b); setSource(src);
    };

    const load = async () => {
      try { apply(validate(JSON.parse(await AsyncStorage.getItem(CACHE_KEY))), "saved"); } catch (e) {}
    };
    const fetchLatest = async () => {
      if (!URL || Date.now() - last < MIN_GAP_MS) return; last = Date.now();
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 10000);
      try {
        const res = await fetch(URL, { signal: ctrl.signal, headers: { "Cache-Control": "no-cache" } });
        if (!res.ok) return;
        const b = validate(await res.json());
        if (b && b.month >= BASE.month) { apply(b, "online"); AsyncStorage.setItem(CACHE_KEY, JSON.stringify(b)).catch(() => {}); }
      } catch (e) { /* offline or bad file: keep what we have */ } finally { clearTimeout(timer); }
    };

    load().then(fetchLatest);
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") fetchLatest(); });
    return () => { alive = false; sub.remove(); };
  }, []);

  return <Ctx.Provider value={{ bulletin, source }}>{children}</Ctx.Provider>;
}

/** The current bulletin: { month, label, checked, rows[] }. */
export function useBulletin() { return useContext(Ctx).bulletin; }
/** Where the dates came from: "online" | "saved" | "bundled". */
export function useBulletinSource() { return useContext(Ctx).source; }

/** "October 2026" from "2026-10". */
export function monthName(ym) {
  const [y, m] = (ym || "").split("-").map(Number);
  if (!y || !m) return "";
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1] + " " + y;
}
