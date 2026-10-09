// Color tokens (light + dark), module color identities and fonts.
import { useColorScheme } from "react-native";
import { useApp } from "./state";

export const LIGHT = {
  bg: "#f5f6fb", surface: "#ffffff", sunk: "#eef1f8", ink: "#0d1324", muted: "#5b6478", line: "#e1e5ef",
  ok: "#15803d", okSoft: "#dcf5e4", warn: "#b45309", warnSoft: "#fdefd6", crit: "#c81e3a", critSoft: "#fde2e6",
  shadow: "rgba(20,28,60,0.10)", onAcc: "#ffffff",
};
export const DARK = {
  bg: "#080b16", surface: "#111527", sunk: "#0c1020", ink: "#eef1fa", muted: "#9aa3bd", line: "#232a44",
  ok: "#4ade80", okSoft: "#0f2a1b", warn: "#fbbf24", warnSoft: "#2e2210", crit: "#fb7185", critSoft: "#371520",
  shadow: "rgba(0,0,0,0.45)", onAcc: "#ffffff",
};

const VIVID = { home: ["#2563eb", "#c026d3"], roadmap: ["#0891b2", "#10b981"], boards: ["#4f46e5", "#8b5cf6"], nclex: ["#ea580c", "#e11d48"], imm: ["#9333ea", "#db2777"], bedside: ["#e11d48", "#f97316"], career: ["#059669", "#0284c7"], drive: ["#0d9488", "#65a30d"], more: ["#475569", "#6366f1"] };
export const PALETTES = {
  vivid: { label: "Vivid", colors: VIVID },
  ocean: { label: "Ocean", colors: { ...VIVID, home: ["#0369a1", "#0d9488"], roadmap: ["#0e7490", "#0891b2"], boards: ["#1d4ed8", "#0891b2"], nclex: ["#0f766e", "#0284c7"], imm: ["#4338ca", "#0369a1"], bedside: ["#0e7490", "#4f46e5"], career: ["#047857", "#0e7490"], drive: ["#0e7490", "#0d9488"] } },
  sunrise: { label: "Sunrise", colors: { ...VIVID, home: ["#ea580c", "#db2777"], roadmap: ["#d97706", "#ea580c"], boards: ["#c2410c", "#be185d"], nclex: ["#dc2626", "#ea580c"], imm: ["#be185d", "#9333ea"], bedside: ["#e11d48", "#d97706"], career: ["#b45309", "#dc2626"], drive: ["#ca8a04", "#ea580c"] } },
  midnight: { label: "Midnight", colors: VIVID, dark: true },
};

export const PHASE_COLORS = ["#0891b2", "#4f46e5", "#ea580c", "#db2777", "#9333ea", "#059669"];

// Font family names are filled in by app/_layout.js once fonts load; system fonts until then.
export const FONTS = { display: undefined, displayX: undefined, body: undefined, bodyMed: undefined, bodySemi: undefined, bodyBold: undefined, mono: undefined, monoBold: undefined };

// Mix a hex color with white/black (amount 0..1) — used for soft tints.
export function mix(hex, other, amt) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(other);
  const c = a.map((v, i) => Math.round(v * (1 - amt) + b[i] * amt));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** useTheme(mod) → { c: tokens, dark, acc: [a, b], soft, soft2, mod } */
export function useTheme(mod = "home") {
  const scheme = useColorScheme();
  const app = useApp();
  const pal = PALETTES[(app && app.state && app.state.palette) || "vivid"] || PALETTES.vivid;
  const dark = pal.dark || scheme === "dark";
  const c = dark ? DARK : LIGHT;
  const acc = pal.colors[mod] || pal.colors.home;
  const base = dark ? c.surface : "#ffffff";
  return {
    c, dark, acc, mod, pal,
    tint: dark ? mix(acc[0], "#ffffff", 0.35) : acc[0],
    tint2: dark ? mix(acc[1], "#ffffff", 0.35) : acc[1],
    soft: mix(acc[0], base, dark ? 0.78 : 0.87),
    soft2: mix(acc[1], base, dark ? 0.78 : 0.87),
  };
}
