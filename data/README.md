# Live app data

`visa-bulletin.json` is downloaded by the app on launch (see `src/bulletin.js`), so changing it updates every user's
Visa screen without a new App Store / Google Play release.

**Monthly update (after the State Department posts the new bulletin, usually mid-month):**

1. Open the new bulletin at travel.state.gov → table "Employment-Based", row **3rd** (Skilled Workers & Professionals).
2. In `visa-bulletin.json` change:
   - `month` → the bulletin's month, e.g. `"2026-11"` (the app ignores files older than the dates built into it)
   - `checked` → today's date, `YYYY-MM-DD` (shown as "last updated" in the app)
   - `label` → e.g. `"November 2026 Visa Bulletin · EB-3 Skilled Workers & Professionals"`
   - each row's `fa` (Final Action, chart A) and `dff` (Dates for Filing, chart B) as `YYYY-MM-DD`.
     "C" (current) → use the bulletin's first day of the month. Keep `key` values unchanged.
   - `alert` (short note) and `tone`: `"ok"`, `"warn"` or `"crit"`. `rate` = rough months of movement per year, used for the wait estimate.
3. Commit and push. Phones pick it up the next time the app opens (they check at most every 6 hours).

If the file has a mistake (bad date format, missing field) the app ignores it and keeps the last good dates.
Also update `BULLETIN` in `src/data/content.js` whenever you ship a new app version, so fresh installs start current.

---

## Canada, Australia and New Zealand: `migration.json`

`migration.json` feeds the migration monitors on the Visa tab (see `src/migration.js`). It has one block per country:
`"CA"`, `"AU"`, `"NZ"`, each `{ "checked": "YYYY-MM-DD", "migration": { … } }`. The app keeps whichever copy is newer
(the file or the data built into the app), country by country, and ignores a country block that is malformed.

**Monthly check (the scheduled task prepares this for you to review):**

- **Canada** → `CA.migration.express_entry.draws`: add any new *Healthcare and social services occupations* round from
  the IRCC rounds page as `{ "date", "category", "crs", "invitations" }` (numbers, not text). Update `pnp[].status`
  for provincial healthcare streams that opened, closed or ran a draw.
- **Australia** → `AU.migration.states[].status` (state nomination programs reset each July), `points.minimum`,
  and `rounds` only when the date is confirmed. Leave cut-off scores out unless Home Affairs publishes them.
- **New Zealand** → `NZ.migration.green_list`, `aewv` and `smc` summaries when INZ changes wages, fees or rules.

Then set that country's `checked` to today, commit and push. Keep `src/data/countries/*.json` in step when you ship
a new app version, so fresh installs start current.
