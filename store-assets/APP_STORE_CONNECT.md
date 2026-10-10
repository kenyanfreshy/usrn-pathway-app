# NurseBound — App Store Connect, section by section

App: **NurseBound** · Apple ID **6821183583** · Bundle ID `com.alexkorir.nursebound` · SKU `nursebound-ios`
Copy-ready text for the listing is in `STORE_LISTING.md`. Prices and products are in `PRICING.md`.

---

## 1. General → App Information

| Field | Enter |
|---|---|
| Name | `NurseBound` |
| Subtitle | `NCLEX, OET & visa roadmap` |
| Primary language | English (U.S.) |
| Primary category | **Education** |
| Secondary category | **Medical** |
| Content rights | **Yes**, it contains third-party content and I have the necessary rights (visa bulletin dates are U.S. government public-domain data; migration and English-test requirements are facts summarized from official sources; lessons and questions are original) |
| Privacy Policy URL | `https://github.com/kenyanfreshy/usrn-pathway-app/blob/main/PRIVACY.md` |
| License agreement | Apple's standard EULA (leave as is) |

**Age Rating → Edit** (2025 questionnaire):

| Question | Answer |
|---|---|
| Parental controls / age assurance | No |
| Unrestricted web access | No (links open in Safari, there's no in-app browser) |
| User-generated content, messaging, social media | No |
| Advertising | No |
| Profanity, horror, violence, mature/suggestive themes, alcohol/drugs, gambling, contests | None |
| **Medical or treatment information** | **Frequent** (NCLEX questions, drug doses, clinical cases) |
| Health or wellness topics | Frequent |
| Age category | Not applicable |

This should come out as **16+**, which suits an app for licensed nurses. Don't lower it: Apple rejects ratings that
don't match the content.

---

## 2. Monetization → Pricing and Availability

- **Price:** Free (Pro is sold in the app).
- **Availability:** All countries and regions **except China mainland** (it requires an ICP filing number you don't have).
- **Tax category:** leave the default (App Store software).
- **Pre-order:** No.

---

## 3. Monetization → Subscriptions

1. **Create subscription group:** `NurseBound Pro`. Group localization (English U.S.): display name `NurseBound Pro`.
2. Add two subscriptions to the group:

| Reference name | Product ID | Duration | Level |
|---|---|---|---|
| Pro annual | `nursebound_pro_annual` | 1 year | 1 (top) |
| Pro monthly | `nursebound_pro_monthly` | 1 month | 2 |

3. For each one:
   - **Localization (English U.S.):** display name `Pro annual` / `Pro monthly` (30 characters max);
     description `Study plan, NGN sim, OET & IELTS practice` (45 characters max).
   - **Price:** United States US$99.99 (annual) / US$14.99 (monthly); then edit the countries in groups B and C (see `PRICING.md`).
   - **Introductory offer:** all countries, start today, no end date, **Free**, **2 weeks**.
   - **Review information:** screenshot of the paywall (`store-assets/review/paywall.png`), note:
     `Opens from More → NurseBound Pro, or any Pro feature. Restore Purchases is on the same screen.`
4. Status will say "Ready to Submit". They're submitted together with app version 1.0.

## 4. Monetization → In-App Purchases

- **Non-Consumable**, reference name `Pro all-access pass`, product ID `nursebound_pro_lifetime`.
- Display name `Pro all-access pass`, description `Every Pro feature, one payment, no renewal.`
- Price: US$149.99, then groups B and C. Same review screenshot and note.

## 5. Trust & Safety → App Privacy

**Privacy Policy URL:** as above.

**Data collection → Yes, we collect data.** Only one type, because everything else stays on the phone:

| Data type | Purposes | Linked to the user? | Used for tracking? |
|---|---|---|---|
| **Purchases → Purchase History** (collected by RevenueCat to check Pro) | **App Functionality**, **Analytics** | **No** (the app uses RevenueCat's anonymous IDs) | **No** |

Everything else: **not collected** (no accounts, no analytics SDK, no ads, no location, no contacts; backups and
document summaries are only shared where the user sends them). The visa and migration updates are plain file
downloads with no user data.

## 6. Trust & Safety → App Accessibility (optional for now)

Only claim a feature if every common task works with it. After testing on your phone, you can claim:
- **Dark Interface** (the Midnight theme)
- **Larger Text** (text follows the iPhone text-size setting)

Leave VoiceOver, Voice Control and Reduced Motion unclaimed until you've tested them end to end.

## 7. iOS App → 1.0 Prepare for Submission

| Field | Enter |
|---|---|
| Screenshots | **6.9" iPhone** (1320 × 2868 or 1290 × 2796): 3–10 images, see section 8. iPad not needed (iPhone-only app). |
| Promotional text | from `STORE_LISTING.md` (155 characters) |
| Description | from `STORE_LISTING.md` |
| Keywords | `nurse,nursing,ngn,rn,ielts,eb3,ahpra,express entry,canada,australia,new zealand,abroad,study` |
| Support URL | `https://github.com/kenyanfreshy/usrn-pathway-app/blob/main/SUPPORT.md` |
| Marketing URL | leave blank |
| Version | `1.0` |
| Copyright | `2026 Alex Korir` |
| Build | click **+** after `eas submit` finishes processing |
| In-App Purchases and Subscriptions | **+** → add `nursebound_pro_annual`, `nursebound_pro_monthly`, `nursebound_pro_lifetime` |
| Game Center | off |

**App Review Information**

- Sign-in required: **No** (there are no accounts).
- Contact: your name, phone and email.
- Notes:

```
NurseBound is a study and planning app for internationally educated registered nurses moving to the
U.S., Canada, Australia or New Zealand. No account is needed; all data stays on the device.

Free: roadmap for each country (Roadmap tab), visa bulletin and migration monitors (Visa tab), the
NCLEX question bank, Diagnostic Benchmark and Comprehensive Predictor (Exam tab), English score
checker and diagnostic (Exam tab → OET & IELTS), bedside lessons, career and driving guides (More tab).

Pro (subscription with a 2-week free trial for new subscribers, or a one-time pass): study plan and
smart review (Exam tab), NGN Clinical Judgment Simulator (Exam → Test 2), OET/IELTS writing and
speaking practice (Exam → OET & IELTS), interview prep and document summary. The paywall is under
More → NurseBound Pro. Restore Purchases, Terms of Use and Privacy Policy are on the paywall.

All clinical and immigration content is educational, original, and links to official sources.
The app is not affiliated with NCSBN, OET, IELTS or any government agency.
```

**Version release:** Manually release this version (so you choose launch day).

## 8. Screenshots (assets)

Apple wants screenshots of the real app. Take them on your iPhone from the development build
(side button + volume up), AirDrop them to the Mac, and put them in `store-assets/raw/` with these names.
I'll then frame them with a headline at the exact App Store size.

| File | Screen | Headline |
|---|---|---|
| `1-today.png` | Today with the journey map | Your path to the bedside abroad |
| `2-roadmap.png` | Roadmap (Canada, with the province card) | Every step, for your country |
| `3-exam.png` | Exam → Diagnostic result with categories | Know your weak areas |
| `4-ngn.png` | Exam → NGN case study (bowtie item) | Next Gen NCLEX case studies |
| `5-plan.png` | Study plan | A daily plan to exam day |
| `6-english.png` | Exam → OET & IELTS → Scores | OET & IELTS scores for your country |
| `7-visa.png` | Visa tab | Live visa and migration updates |

Tips: use sample data (not your real name), full battery and good signal, light theme for most shots.
Also take `review/paywall.png` (the Pro screen) for the subscription review screenshots.

## 9. After approval

- **Promo Codes:** up to 100 per version for reviewers and nursing groups.
- **Custom Product Pages:** one page per destination (U.S., Canada, Australia, NZ) with that country's screenshots,
  for ads and social links.
- **In-App Events / Game Center / Nominations:** not needed for launch.
