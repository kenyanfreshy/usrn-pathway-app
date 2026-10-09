# USRN Pathway (Expo) — foundation guide for screen authors

Project: `/home/claude/usrn-app` (Expo Router, JavaScript, no TypeScript). The web version this ports is
`/tmp/claude-0/-home-claude/c3b6f838-ecd0-5197-ba4b-a5ac9af1cf90/scratchpad/web_app.jsx` — copy its wording, data, logic and
behaviour faithfully; only the rendering changes from HTML/Tailwind to React Native.

## Hard rules
- Allowed imports ONLY: `react`, `react-native`, `expo-router` (`router`, `useLocalSearchParams`, `Link`), `react-native-svg`
  (`Svg, Path, Circle, Rect, Line, Polyline, G, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop`),
  `react-native-safe-area-context`, and the project modules below. No other packages, no web APIs (no `window`, `document`,
  `localStorage`, `fetch` of local files), no CSS, no `className`.
- No AI features (the coach, AI practice sets, "Ask the AI coach", "Rewrite my note" are removed in the store app).
- No payment UI except via `ProGate` / `router.push("/paywall")`.
- Every screen file default-exports a component and is wrapped in `<Screen mod="...">` (it handles safe area, background and scrolling).
  Screens that are pushed (not tabs) add a back row at the top: `<BackRow title="..." />` from `src/ui-extra.js` (write nothing for tabs).
- Keep text inside `<Txt>`; never put raw strings directly inside `<View>` (React Native crashes).
- Lists: plain `.map` inside the ScrollView is fine (content is small). Give every mapped element a `key`.
- No `gap` on Text. Use `Row` for horizontal layout (it supports `wrap`). Width-sensitive grids: use `Row wrap` with children `style={{ flexGrow: 1, flexBasis: 150 }}`.
- Syntax-check each file you write: `cd /home/claude/usrn-app && bun build --no-bundle <file> --outfile /tmp/claude-0/-home-claude/c3b6f838-ecd0-5197-ba4b-a5ac9af1cf90/scratchpad/chk.js` must succeed.

## Modules
`src/ui.js` — UI kit:
- `Txt v="hero|h1|h2|h3|body|bodyB|small|smallB|tiny|eyebrow|mono|big" muted color style numberOfLines`
- `Screen mod header` · `Row gap wrap center style` · `Card mod accent onPress style padding` · `Grad mod colors style` · `IconTile mod icon size colors`
- `Hero mod icon eyebrow title sub stats=[[label,value]]` (gradient banner — use at top of every module screen)
- `Btn title icon onPress kind="primary|secondary|ghost|danger" mod disabled small full`
- `Chip text tone="ok|warn|crit|acc|acc2|mute" icon mod onPress active`
- `Note tone="acc|acc2|ok|warn|crit" icon title` (children string or nodes)
- `Bar pct(0..1) mod height` · `Seg value onChange options=[{id,label,icon}] mod` · `Accordion title meta defaultOpen mod`
- `Field label value onChangeText placeholder keyboardType multiline mono error hint` · `DateField label value onChange` (YYYY-MM-DD)
- `Select label value options=[{value,label}]|string[] onChange` · `Check checked onToggle label sub disabled strike`
- `Option letter label why state=null|"sel"|"right"|"wrong" onPress disabled multi` (quiz answers)
- `Stat label value tone` · `SectionTitle eyebrow title sub` · `Bullets items numbered` · `CopyButton text label` · `Sheet visible onClose title` · `Divider` · `Icon name size color` (lucide names, e.g. "CheckCircle2") · `tap()` haptic · `buzz()`
`src/theme.js` — `useTheme(mod)` → `{ c: {bg,surface,sunk,ink,muted,line,ok,okSoft,warn,warnSoft,crit,critSoft}, dark, acc:[a,b], tint, tint2, soft, soft2 }`; `PHASE_COLORS`; `mix(hex, other, amt)`; `FONTS`.
  Module color keys (`mod`): home, roadmap, boards, nclex, imm, bedside, career, drive, more.
`src/state.js` — `useApp()` → `{ state, dispatch, m, lvl }`. Actions (same as web): step, flex, addDoc, delDoc, exam, lesson, career, credit, drive,
  addLadder, delLadder, profile(patch), palette(key), qotd(key,rec), flash, addPay, delPay, alerts(on), qstat(res), reset.
  Also exports `phaseStatus(state,i)`, `phaseDone`, `metrics`, `levelOf`, `BADGES`, `BADGE_HUES`, `LEVELS`.
`src/pro.js` — `usePro()` → `{ isPro, packages }`; `<ProGate feature desc mod>{children}</ProGate>`; `ProBadge`; `PRO_FEATURES`.
`src/notify.js` — `askPermission()`, `scheduleExpiryAlerts(docs)`, `cancelAlerts()`.
`src/overlays.js` — `Medal badge idx size locked`.
`src/util.js` — `dkey today todayKey parseISO isISO daysUntil fmtDate monYr addYears isoOffset addMonths money uid clamp num shuffle shuffleOptions pmiSchedule yrsMo planCost`.
`src/data/content.js` — all web constants: PHASES DOC_STYLE DOC_CATS SAMPLE_DOCS BOARDS ENDORSE DIAG CAT_POOL BULLETIN LESSONS ACUITY SAMPLE_PTS
  CAREERS CREDIT NGN_CASE NGN_ITEMS DIFF PHASE_COLORS LEVELS LICENSE_DOS LICENSE_DONTS INSURERS CHART_CASES RATES HEALTH_TERMS PLAN_FIELDS
  INSURE_LIST AUTO_COVER DRIVE_WHY DRIVE_PREP AEIRP_LIST SPONSORS JPTS JLABELS DUR.
`src/data/questions.json` — question bank (import with `import BANK_ALL from "../src/data/questions.json"`; use `.filter(q => q.active !== false)`).
`src/ui-extra.js` — `BackRow({ title })` (pushed screens), `Medal` re-export, `Rings`, `Journey` helpers may live here (see task).

## Navigation
Tabs: `/` (Today), `/roadmap`, `/nclex`, `/visa`, `/more`. Pushed screens: `/boards`, `/bedside`, `/career`, `/driving`, `/quiz` (params),
modals: `/paywall`, `/settings`, `/badges`. Navigate with `router.push("/boards")`.

## Pro gating (store build)
Free: roadmap, board comparison table, visa bulletin, Diagnostic Baseline, question bank, lessons, guides.
Pro (wrap in `ProGate`): NGN case study, automated expiry alerts (notification toggle), endorsement wizard, charge nurse command center
(acuity, SBAR, clinical ladder), overtime & taxes tab.
