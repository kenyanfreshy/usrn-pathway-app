// Career & wealth: charge command, career tracks, Magnet & EBP, wealth & credit, overtime & taxes, insurance.
import React, { useState } from "react";
import { Screen, Hero, Seg } from "../src/ui";
import { BackRow } from "../src/ui-extra";
import { ProGate } from "../src/pro";
import { useApp } from "../src/state";
import { CAREERS, CREDIT } from "../src/data/content";
import { ChargeCommand } from "../src/career/charge";
import { CareerTracks, MagnetEbp } from "../src/career/tracks";
import { Wealth } from "../src/career/wealth";
import { TaxPlaybook } from "../src/career/taxes";
import { InsuranceHub } from "../src/career/insurance";

const TABS = [{ id: "charge", label: "Charge command", icon: "LayoutGrid" }, { id: "tracks", label: "Career tracks", icon: "Route" }, { id: "magnet", label: "Magnet & EBP", icon: "Award" }, { id: "wealth", label: "Wealth & credit", icon: "PiggyBank" }, { id: "taxes", label: "Overtime & taxes", icon: "Receipt" }, { id: "insure", label: "Insurance", icon: "Umbrella" }];

export default function Career() {
  const { state } = useApp();
  const [tab, setTab] = useState("charge");
  return (
    <Screen mod="career">
      <BackRow title="Career & wealth" mod="career" />
      <Hero mod="career" icon="TrendingUp" eyebrow="Module 6 · Career & wealth" title="Lead, grow and build wealth"
        sub="Tools for your first years at the bedside and the plan beyond them."
        stats={[["Ladder entries", state.ladder.length], ["Credit steps", CREDIT.filter((_, i) => state.credit[i]).length + " / " + CREDIT.length], ["Career tracks", CAREERS.length]]} />
      <Seg mod="career" value={tab} onChange={setTab} options={TABS} />
      {tab === "charge" ? (
        <ProGate feature="Charge nurse command center" desc="Acuity balancer, SBAR call scripts and clinical ladder dossier" mod="career">
          <ChargeCommand />
        </ProGate>
      ) : null}
      {tab === "tracks" ? <CareerTracks /> : null}
      {tab === "magnet" ? <MagnetEbp /> : null}
      {tab === "wealth" ? <Wealth /> : null}
      {tab === "taxes" ? (
        <ProGate feature="Overtime tax shield" desc="Overtime deduction, W-4 withholding and pre-tax savings calculators" mod="career">
          <TaxPlaybook />
        </ProGate>
      ) : null}
      {tab === "insure" ? <InsuranceHub /> : null}
    </Screen>
  );
}
