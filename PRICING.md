# Pro pricing, free trial and store setup

**How it works:** you set one price per country in App Store Connect and Play Console. The app shows whatever
price and currency the store gives each shopper, so country pricing needs no code and follows store rules.
The app never picks a price based on where it thinks someone is, and never links to an outside payment page.

## Plans

| Product | Apple ID | Google Play ID | Trial |
|---|---|---|---|
| Pro annual (auto-renewing) — shown first, "Best value" | `com.nursebound.pro.annual` | subscription `nursebound_pro`, base plan `annual` | **2 weeks free**, new subscribers only |
| Pro monthly (auto-renewing) | `com.nursebound.pro.monthly` | subscription `nursebound_pro`, base plan `monthly` | **2 weeks free**, new subscribers only |
| All-access pass (one-time) | `com.nursebound.pro.lifetime` (Non-Consumable) | in-app product `com.nursebound.pro.lifetime` | none |

All three unlock the RevenueCat entitlement `nursebound_pro`. The 2-week trial is set up on both subscriptions. It belongs to the
store product, not the app's code. If you'd rather not offer the one-time pass, remove it from the RevenueCat
offering and the paywall will show only the subscription.

## Suggested prices by country group (starting point — adjust to your goals)

Pick the nearest price each store offers in the local currency. Where a store sells in U.S. dollars in a country,
it shows dollars.

| Group | Countries (main nurse-recruitment markets) | Annual | Monthly | One-time pass |
|---|---|---|---|---|
| A | United States, Canada, United Kingdom, Ireland, Australia, New Zealand, UAE, Saudi Arabia, Qatar, Singapore, EU | US$99.99 | US$9.99 | US$149.99 |
| B | South Africa, Mexico, Jamaica, Trinidad & Tobago, Brazil, Colombia, Malaysia, Thailand, Caribbean | US$49.99 | US$7.99 | US$79.99 |
| C | Philippines, India, Nigeria, Kenya, Ghana, Uganda, Zimbabwe, Cameroon, Pakistan, Nepal, Bangladesh, Sri Lanka, Egypt, Vietnam, Indonesia | US$24.99 | US$3.99 | US$39.99 |

The paywall works out "Save ~X%" on the annual card from the real store prices (annual vs 12 × monthly).
At these prices that's about 17% in group A, 48% in group B and 48% in group C.
The one-time pass is priced above the annual plan, so it doesn't undercut the subscription.

Every other country: let the store convert your U.S. price automatically, then lower any that look too high.

## Special offer for free users 30+ days after install (optional)

The paywall can show a "Special offer — Save X%" version to people who have used the free app for 30 days or more
without subscribing. That group often converts at a lower price. The discount has to be a **real store product**
with its own lower price. The app works out the saving from the two store prices and crosses out the real regular
price of the same plan. There's no made-up "was" price and no fake countdown, which Apple and Google both reject.

1. Create the discounted products:
   - Apple: in the **same subscription group**, add `com.nursebound.pro.monthly.offer` (1 month) at the lower price.
     Group B and C countries can get their own lower prices too.
   - Google: on subscription `nursebound_pro`, add a second base plan `monthly-offer` at the lower price.
2. In RevenueCat, attach them to the `pro` entitlement. Create an offering with the identifier **`special_offer`**
   (don't make it current) and give it a **Monthly** package pointing to those products.
3. That's all. The app picks it up for free users 30+ days after their first open. If the offering is missing or
   empty, everyone sees the regular paywall.

A trial is offered only once per person, so most win-back shoppers see the discounted price with no trial,
and the button reads "Subscribe now".

## App Store Connect (iPhone)

1. **Monetization → Subscriptions →** create a subscription group named "NurseBound Pro", then two subscriptions:
   `com.nursebound.pro.annual` (duration **1 year**) and `com.nursebound.pro.monthly` (duration **1 month**). Put annual at the higher level in the group. Give each a display name ("Pro annual", "Pro monthly"), a description and a review screenshot of the paywall.
2. **Subscription Prices → Add pricing:** choose the United States and US$14.99. Apple fills in every other country.
   Then use **Edit country or region prices** to set groups B and C from the table.
3. **Introductory Offers → Create** on **each** subscription: all countries and regions, start date today, no end date, type **Free**, duration **2 weeks**.
   Apple gives each Apple ID one free trial per subscription group. The app checks this before it mentions a trial.
4. **In-App Purchases → Non-Consumable** `com.nursebound.pro.lifetime`: set prices the same way.
5. Add both products to the app version you submit (**App Store → your version → In-App Purchases and Subscriptions**).
6. **App Information:** add your Privacy Policy URL. Keep the Terms link (Apple's standard EULA) or upload your own EULA.

## Google Play Console (Android)

1. **Monetize → Products → Subscriptions →** create `nursebound_pro`, then two base plans: `annual` (auto-renewing, 1 year)
   and `monthly` (auto-renewing, 1 month).
2. **Prices:** set US$14.99, let Play convert it, then edit the group B and C countries.
3. **Add offer** on **each** base plan: offer ID `free-trial`, eligibility **New customer acquisition → never had
   this subscription**, phase **Free trial, 14 days**. Activate it.
4. **In-app products →** `com.nursebound.pro.lifetime`, prices set the same way.

## RevenueCat

- Products: attach all six (three Apple, three Google). Entitlement `pro` → attach all of them.
- Offering `default` (current): package **Annual** (`$rc_annual`) → `com.nursebound.pro.annual` / `nursebound_pro:annual`;
  package **Monthly** (`$rc_monthly`) → `com.nursebound.pro.monthly` / `nursebound_pro:monthly`;
  package **Lifetime** (`$rc_lifetime`) → `com.nursebound.pro.lifetime`.
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
- "Redeem code" opens Apple's offer-code sheet or Google Play's redeem page, so you can hand out promo codes.
- No outside payment links, no prices based on the user's location, and no hidden or ambiguous charges.

## Before you submit

- [ ] Real Privacy Policy URL in `app.json → expo.extra.privacyPolicyUrl` (and in App Store Connect / Play Console)
- [ ] Support email in `app.json → expo.extra.supportEmail`
- [ ] Test with an Apple **Sandbox** tester. In sandbox, a 2-week trial lasts about 3 minutes and renewals come every 5 minutes.
- [ ] Test with a Google Play **license tester**. Test trials and renewals are shortened the same way.
- [ ] App Review notes: see `store-assets/APP_STORE_CONNECT.md` (section "App Review Information").
