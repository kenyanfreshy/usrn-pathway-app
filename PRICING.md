# Pro pricing, free trial and store setup

**How it works:** you set one price per country in App Store Connect and Play Console. The app shows whatever
price and currency the store gives each shopper, so country pricing needs no code and follows store rules.
The app never picks a price based on where it thinks someone is, and never links to an outside payment page.

## Plans

| Product | Apple ID | Google Play ID | Trial |
|---|---|---|---|
| Pro monthly (auto-renewing) | `usrn_pro_monthly` | subscription `usrn_pro`, base plan `monthly` | **2 weeks free**, new subscribers only |
| All-access pass (one-time) | `usrn_pro_lifetime` (Non-Consumable) | in-app product `usrn_pro_lifetime` | none |

Both unlock the RevenueCat entitlement `pro`. The trial is set up only on the monthly plan. It belongs to the
store product, not the app's code. If you'd rather not offer the one-time pass, remove it from the RevenueCat
offering and the paywall will show only the subscription.

## Suggested prices by country group (starting point — adjust to your goals)

Pick the nearest price each store offers in the local currency. Where a store sells in U.S. dollars in a country,
it shows dollars.

| Group | Countries (main nurse-recruitment markets) | Monthly | One-time pass |
|---|---|---|---|
| A | United States, Canada, United Kingdom, Ireland, Australia, New Zealand, UAE, Saudi Arabia, Qatar, Singapore, EU | US$14.99 | US$59.99 |
| B | South Africa, Mexico, Jamaica, Trinidad & Tobago, Brazil, Colombia, Malaysia, Thailand, Caribbean | US$7.99 | US$29.99 |
| C | Philippines, India, Nigeria, Kenya, Ghana, Uganda, Zimbabwe, Cameroon, Pakistan, Nepal, Bangladesh, Sri Lanka, Egypt, Vietnam, Indonesia | US$3.99 | US$14.99 |

Every other country: let the store convert your U.S. price automatically, then lower any that look too high.

## App Store Connect (iPhone)

1. **Monetization → Subscriptions →** create a subscription group named "USRN Pathway Pro", then the subscription
   `usrn_pro_monthly`, duration **1 month**. Give it a display name ("Pro monthly"), a description and a review screenshot of the paywall.
2. **Subscription Prices → Add pricing:** choose the United States and US$14.99. Apple fills in every other country.
   Then use **Edit country or region prices** to set groups B and C from the table.
3. **Introductory Offers → Create:** all countries and regions, start date today, no end date, type **Free**, duration **2 weeks**.
   Apple gives each Apple ID one free trial per subscription group. The app checks this before it mentions a trial.
4. **In-App Purchases → Non-Consumable** `usrn_pro_lifetime`: set prices the same way.
5. Add both products to the app version you submit (**App Store → your version → In-App Purchases and Subscriptions**).
6. **App Information:** add your Privacy Policy URL. Keep the Terms link (Apple's standard EULA) or upload your own EULA.

## Google Play Console (Android)

1. **Monetize → Products → Subscriptions →** create `usrn_pro`, then a base plan `monthly`: auto-renewing, billing period 1 month.
2. **Prices:** set US$14.99, let Play convert it, then edit the group B and C countries.
3. **Add offer** on the `monthly` base plan: offer ID `free-trial`, eligibility **New customer acquisition → never had
   this subscription**, phase **Free trial, 14 days**. Activate it.
4. **In-app products →** `usrn_pro_lifetime`, prices set the same way.

## RevenueCat

- Products: attach all four (two Apple, two Google). Entitlement `pro` → attach all of them.
- Offering `default` (current): package **Monthly** (`$rc_monthly`) → `usrn_pro_monthly` / `usrn_pro:monthly`;
  package **Lifetime** (`$rc_lifetime`) → `usrn_pro_lifetime`.
- Put the public SDK keys in `app.json → expo.extra.revenueCatAppleKey / revenueCatGoogleKey`.

## What the app already does to meet the store rules

- Price, billing period and currency come from the store. The amount charged after the trial appears beside the
  trial button and on the plan card.
- The trial is mentioned only when the store says this shopper qualifies. On iPhone the app checks first;
  Google Play only offers trials to accounts that qualify.
- Before purchase, the paywall says the subscription renews automatically, when the card is charged, and how to cancel.
- **Restore purchases**, **Terms of Use** and **Privacy Policy** are on the paywall. Members get **Manage subscription**,
  which opens the store's own page.
- A reminder notification 2 days before the trial ends, and only if the trial is still going to renew.
- Pending purchases (Ask to Buy, delayed payment) unlock automatically when approved. A member who opens the app
  offline stays unlocked until their paid period ends.
- No outside payment links, no prices based on the user's location, and no hidden or ambiguous charges.

## Before you submit

- [ ] Real Privacy Policy URL in `app.json → expo.extra.privacyPolicyUrl` (and in App Store Connect / Play Console)
- [ ] Support email in `app.json → expo.extra.supportEmail`
- [ ] Test with an Apple **Sandbox** tester. In sandbox, a 2-week trial lasts about 3 minutes and renewals come every 5 minutes.
- [ ] Test with a Google Play **license tester**. Test trials and renewals are shortened the same way.
- [ ] App Review notes: "Pro is optional. Free features: roadmap, board comparison, visa bulletin, question bank.
      Pro: NGN case study (NCLEX tab → Test 2), expiry reminders (Roadmap → Documents), endorsement wizard
      (More → Boards), charge nurse and tax tools (More → Career). Restore Purchases is on the Pro screen."
