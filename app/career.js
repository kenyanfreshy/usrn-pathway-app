// Career & wealth: charge command, career tracks, Magnet & EBP, wealth & credit, overtime & taxes, insurance.
import React, { useState } from "react";
import { Screen, Hero, Seg } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { ProGate } from "../src/pro";
import { useApp, careersOf, creditList, creditKey } from "../src/state";
import { destId, destOf } from "../src/data/global";
import { DestPill } from "../src/dest";
import { CountryTracks, CountryWealth, CountryMoney, CountryInsurance, SourcesBlock } from "../src/career/country";
import { ChargeCommand } from "../src/career/charge";
import { CareerTracks, MagnetEbp } from "../src/career/tracks";
import { Wealth } from "../src/career/wealth";
import { TaxPlaybook } from "../src/career/taxes";
import { InsuranceHub } from "../src/career/insurance";

const TABS_INTL = [{ id: "charge", label: "Charge Command", icon: "LayoutGrid" }, { id: "tracks", label: "Career Tracks", icon: "Route" }, { id: "magnet", label: "Quality & EBP", icon: "Award" }, { id: "wealth", label: "Credit & Pay", icon: "PiggyBank" }, { id: "taxes", label: "Tax & Retirement", icon: "Receipt" }, { id: "insure", label: "Health & Insurance", icon: "Umbrella" }];
const TABS = [{ id: "charge", label: "Charge Command", icon: "LayoutGrid" }, { id: "tracks", label: "Career Tracks", icon: "Route" }, { id: "magnet", label: "Magnet & EBP", icon: "Award" }, { id: "wealth", label: "Wealth & Credit", icon: "PiggyBank" }, { id: "taxes", label: "Overtime & Taxes", icon: "Receipt" }, { id: "insure", label: "Insurance", icon: "Umbrella" }];

export default function Career() {
  const { state } = useApp();
  const [tab, setTab] = useState("charge");
  const dest = destId(state); const US = dest === "US"; const info = destOf(dest);
  const CRED = creditList(state); const credDone = CRED.filter((_, i) => state.credit[creditKey(state, i)]).length;
  return (
    <Screen mod="career">
      <BackRow title="Career & Wealth" mod="career" />
      <Hero mod="career" icon="TrendingUp" eyebrow={`Module 6 · Career & wealth · ${info.flag} ${info.short}`} title="Lead, Grow and Build Wealth"
        sub={US ? "Tools for your first years at the bedside and the plan beyond them." : `Tools for your first years at the bedside in ${info.name}: career paths, pay, tax, retirement and insurance.`}
        stats={[["Ladder entries", state.ladder.length], ["Credit steps", credDone + " / " + CRED.length], ["Career Tracks", careersOf(state).length]]} />
      <DestPill mod="career" />
      <Seg mod="career" value={tab} onChange={setTab} options={US ? TABS : TABS_INTL} />
      {tab === "charge" ? (
        <ProGate feature="Charge Nurse Command Center" desc="Acuity balancer, SBAR call scripts and clinical ladder dossier" mod="career">
          <ChargeCommand />
        </ProGate>
      ) : null}
      {tab === "tracks" ? (US ? <CareerTracks /> : <CountryTracks />) : null}
      {tab === "magnet" ? <MagnetEbp /> : null}
      {tab === "wealth" ? (US ? <Wealth /> : <CountryWealth />) : null}
      {tab === "taxes" ? (US ? (
        <ProGate feature="Overtime Tax Shield" desc="Overtime deduction, W-4 withholding and pre-tax savings calculators" mod="career">
          <TaxPlaybook />
        </ProGate>
      ) : <CountryMoney />) : null}
      {tab === "insure" ? (US ? <InsuranceHub /> : <CountryInsurance />) : null}
      {!US ? <SourcesBlock dest={dest} /> : null}
    </Screen>
  );
}
