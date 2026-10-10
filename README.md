# NurseBound — iPhone & Android app (Expo)

The store version of NurseBound, built with Expo (React Native). Bundle ID / package: `com.alexkorir.nursebound` (never change it after release).

- **Store-only payments.** Pro is sold through Apple In-App Purchase and Google Play Billing, managed by RevenueCat.
  The stores set local prices and currencies for each country — no outside payment links (that keeps the app within App Store
  guideline 3.1.1 and Google Play's payments policy worldwide).
- **No accounts, no server.** Progress, documents and settings stay on the phone (AsyncStorage). Expiry reminders are local notifications.
- **Live visa bulletin.** The app downloads `data/visa-bulletin.json` from the public repo kenyanfreshy/nursebound-public on launch (`expo.extra.bulletinUrl`),
  so you update the dates monthly by editing that file — no app release needed. See `nursebound-public/data/README.md`. That repo (not this one) must stay **public**; it also hosts PRIVACY.md and SUPPORT.md.
- **Four destinations.** U.S., Canada, Australia and New Zealand, each with its own 6-phase roadmap, migration monitor,
  employer directory and bedside notes. Researched data with sources lives in `src/data/countries/*.json`; the migration
  figures also refresh from `data/migration.json` in the public repo (`expo.extra.migrationUrl`). The U.S. roadmap is in `src/data/content.js`.
  The destination is part of the profile (U.S. by default; a first-run welcome card lets the nurse pick). Boards, Bedside,
  Career and Driving switch to the chosen country using `src/data/countries/*-life.json` (regulators, careers, pay, tax,
  health cover, credit, driving, liability protection and lesson notes, each with sources).
- **Backup & restore** (Settings): progress is exported as text through the share sheet and restored by pasting it back (`src/backup.js`). No server.
- **Study plan & smart review** (`app/plan.js`, `src/study.js`): daily goal, exam-date pacing, weakest Client Needs areas first,
  and spaced repetition of missed questions (1, 3, 7 days) stored in `state.srs`. Daily reminder is a local notification.
- **English prep** (`app/english.js`, `src/data/english.json`) and **interview prep** (`app/interview.js`, `src/data/interview.json`).
- **U.S. boards** are verified data in `src/data/us-boards.json` (date, sources and open questions inside).
- **Rating prompt** (`src/rate.js`) uses `expo-store-review` after a strong benchmark result (install it with `npx expo install expo-store-review`).
- **No AI features** in this version.

---

## 1. Run it on your computer (once)

Needs Node.js 20+ and the free Expo account.

```bash
cd usrn-app
npm install
npm run setup          # installs every library at the version that matches the Expo SDK
npx expo install --fix # double-checks versions
npx expo-doctor        # should report no problems
```

Before your first store submission, move to the newest Expo SDK (the stores require recent Android/iOS targets):

```bash
npx expo install expo@latest --fix
```

Because the app uses in-app purchases, it runs in a **development build**, not the Expo Go app:

```bash
npm install -g eas-cli
eas login
eas init                                   # links the project to your Expo account
eas build --profile development --platform ios      # or android
npm start                                  # then open the dev build on your phone
```

On iPhone, the development build needs your device registered (`eas device:create`).

## 2. Set up Pro (RevenueCat + the stores)

Follow **`PRICING.md`**: the plans (monthly subscription with a **2-week free trial**, plus an optional one-time pass),
suggested prices by country, and step-by-step setup in App Store Connect, Play Console and RevenueCat.

The paywall (`app/paywall.js`) shows the store's local prices, the free trial (only to eligible users) with the price after it,
the renewal terms, **Restore purchases**, **Manage subscription**, and Terms/Privacy links — all required by Apple and Google. In development builds there is also a "Unlock Pro for testing" switch that does
not exist in store builds.

**What Pro unlocks:** NGN case studies, expiry reminders, endorsement wizard, charge nurse command center, overtime & taxes tools.
Everything else is free (roadmap, board comparison, visa bulletin, Diagnostic Baseline, the full question bank, lessons and guides).
To change this, move `<ProGate>` wrappers in the screen files.

## 3. Build and submit

```bash
eas build --profile production --platform all
eas submit --platform ios       # fill in ascAppId in eas.json first (App Store Connect → App Information → Apple ID)
eas submit --platform android   # first Android upload must be done once by hand in Play Console; after that this works
```

**Google Play, new personal developer accounts:** before the app can go public you must run a **closed test with at least 12 testers
for 14 days in a row**. Start recruiting testers early.

## 4. Store listing checklist

- Screenshots: 6.9" and 6.5" iPhone; Android phone. Take them from the Today, Roadmap, NCLEX and Visa screens.
- Category: **Education** (secondary: Medical).
- Age rating: answer "Medical/Treatment Information — infrequent/mild"; no other sensitive content.
- **Apple App Privacy:** the app itself collects nothing. RevenueCat processes **Purchase History** and an anonymous **app user ID**
  for "App Functionality" — declare those (not linked to identity, not used for tracking).
- **Google Data safety:** declare "Purchase history" collected for app functionality, processed by RevenueCat/Google Play; data is
  encrypted in transit; users can request deletion by email.
- Text for the listing is in `STORE_LISTING.md`.
- Keep the educational disclaimer in the description. Reviewers look closely at medical, legal and financial content.

## Project map

```
app/                 screens (Expo Router)
  (tabs)/            Today · Roadmap · NCLEX · Visa · More
  boards.js bedside.js career.js driving.js quiz.js
  paywall.js settings.js badges.js
src/
  ui.js theme.js     design system (colors, type, components)
  state.js           saved progress, XP, levels, badges
  pro.js             RevenueCat purchases + ProGate
  notify.js          local expiry reminders
  data/content.js    all text and reference data
  data/questions.json  NCLEX-RN question bank (605 active; "exam": 1–3 marks the 576 benchmark items)
  exam.js            scoring (NCSBN +/−), the three benchmark exams and the adaptive predictor
  data/ngn.js        Next Generation NCLEX case studies
  career/            Career & wealth sections
```

Edit wording in `src/data/content.js`; edit questions in `src/data/questions.json` (set `"active": false` to hide one).
