# NurseBound Pro: paywall compliance and revenue notes

Paywall code: `app/paywall.js` (screen) and `src/pro.js` (store logic). Purchases go through RevenueCat's
`react-native-purchases` SDK, which uses StoreKit 2 on iOS and Google Play Billing on Android. The app never
hard-codes a price: every price, currency, period and free trial comes from the store at runtime
(`package.product.priceString`, `introPrice`, `pricePerMonthString`), so all 175 storefronts and local taxes are
handled by Apple and Google.

Product IDs (must match App Store Connect and RevenueCat exactly):

| Plan | App Store product ID | RevenueCat package | Entitlement |
|---|---|---|---|
| Pro annual (auto-renewing, 2-week free trial for new subscribers) | `com.nursebound.pro.annual` | Annual | `nursebound_pro` |
| Pro monthly (auto-renewing, 2-week free trial for new subscribers) | `com.nursebound.pro.monthly` | Monthly | `nursebound_pro` |
| All-access pass (non-consumable, one-time) | `com.nursebound.pro.lifetime` | Lifetime | `nursebound_pro` |

## App Review checklist

### 3.1.1 In-App Purchase
- [x] Every Pro unlock (study plan, NGN simulator, OET/IELTS writing and speaking, interview prep, document summary,
      expiration alerts, charge tools, endorsement wizard, overtime tax tools) is sold only through StoreKit via RevenueCat.
- [x] No links, buttons or wording about paying outside the App Store. iOS builds only mention the App Store.
- [x] **Restore Purchases** button on the paywall (RevenueCat `restorePurchases`, which syncs StoreKit 2 transactions).
- [x] Non-consumable all-access pass is restorable on any device signed in to the same Apple ID.

### 3.1.2 Subscriptions
- [x] The billed amount and period are the largest price text on each plan card ("$99.99/yr"); the trial line sits
      underneath ("2 weeks free, then $99.99/year").
- [x] A free trial is only shown when Apple says this Apple ID is eligible (`checkTrialOrIntroductoryPriceEligibility`).
- [x] Renewal terms under the button: amount, period, auto-renewal, and how to cancel ("Cancel anytime in your Apple
      ID account settings at least 24 hours before the end of the current billing period.").
- [x] **Manage Subscription** link, plus **Privacy Policy** and **Terms of Use (EULA)** links on the paywall. The same
      two links are in App Store Connect (Privacy Policy URL; standard Apple EULA).
- [x] Trial reminder: a local notification 2 days before a trial ends.
- [x] The subscription gives ongoing value (study plan, alerts, monthly visa/migration data updates).

### 2.1 App completeness
- [x] Plans load from the store; while loading, placeholder cards show (no blank screen). If loading fails, the
      paywall explains it, shows a **Try Again** link and a small "Details:" line with RevenueCat's error code.
- [x] The free tier works without paying (roadmaps, visa monitors, question bank, benchmarks, English scores).
- [x] App Review notes explain where Pro is and that no account is needed.
- [ ] **Before submitting:** in TestFlight, with a Sandbox Apple Account, confirm all three plans load with prices, a
      purchase unlocks Pro, and Restore works. Apple rejects the app (2.1) if its reviewers can't load or buy plans.

### Honest marketing (2.3.1, 5.6, FTC)
- The paywall promises preparation, not results ("Prepare to Pass the NCLEX-RN on Your First Attempt"). It never
  says "guaranteed".
- No user counts, ratings or testimonials are shown until they are real. Add a testimonial only with the nurse's
  written permission, their real first name and country, and no paid or incentivized review unless disclosed.
- The $200 figure is the U.S. NCLEX registration fee charged again for every retake (Pearson VUE, verified 2026).

## Revenue: what you actually receive

Apple's prices in many storefronts include VAT/GST. Apple removes that tax first, then takes its commission from
what's left. Your **proceeds** are:

```
proceeds = (customer price − taxes included in that price) × (1 − commission rate)
```

| Your situation | Commission rate |
|---|---|
| Apple Small Business Program (enrolled, under US$1M proceeds in the previous calendar year) | 15% on all sales |
| Standard program: one-time purchases and a subscriber's first year | 30% |
| Standard program: auto-renewing subscription after that subscriber has 1 year of paid service | 15% |

Example in the U.S. storefront (U.S. prices don't include sales tax; Apple handles sales tax separately), annual
plan at the price you set in App Store Connect, P = $99.99:
- Small Business Program: 99.99 × 0.85 = **$84.99** per annual subscriber.
- Standard, first year: 99.99 × 0.70 = **$69.99**; from the second paid year: 99.99 × 0.85 = **$84.99**.

### Don't hard-code these rates in analytics
- RevenueCat already reports **Proceeds** per transaction. Turn on **Apple Small Business Program** in RevenueCat
  (Project settings → Apps → NurseBound (App Store)) once Apple accepts you, so its proceeds use 15%.
- For your own reports, store the commission rate as a setting with an effective date (it changes when you join or
  leave the Small Business Program), and compute: `price_excl_tax × (1 − rate)`, where the rate is 0.15 if
  enrolled, else 0.15 for a renewal past 365 days of paid service, else 0.30.
- Apple's monthly **Payments and Financial Reports** in App Store Connect are the source of truth for what was paid.
