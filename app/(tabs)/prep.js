// English tab: OET Nursing & IELTS Academic prep hub. Follows the nurse's destination (and province in Canada).
// Scores, test choice and the diagnostic are free; writing and speaking practice are Pro.
import React, { useState } from "react";
import { Screen, Hero, Seg, Txt } from "../../src/ui";
import { useApp } from "../../src/state";
import { ProGate } from "../../src/pro";
import { DestPill } from "../../src/dest";
import { destOf } from "../../src/data/global";
import { SourceList } from "../../src/sources";
import { jurisFor, RULES_META } from "../../src/english/rules";
import { Scores } from "../../src/english/Scores";
import { Choose } from "../../src/english/Choose";
import { OetWriting } from "../../src/english/OetWriting";
import { IeltsWriting } from "../../src/english/IeltsWriting";
import { Speaking } from "../../src/english/Speaking";
import { Diagnostic } from "../../src/english/Diagnostic";
import EN from "../../src/data/english.json";

const MOD = "bedside";
const TABS = [
  { id: "scores", label: "Scores", icon: "Target" },
  { id: "choose", label: "Which test", icon: "Route" },
  { id: "oet", label: "OET Writing", icon: "FileEdit" },
  { id: "ielts", label: "IELTS Writing", icon: "FileText" },
  { id: "speak", label: "Speaking", icon: "MessageSquare" },
  { id: "diag", label: "Diagnostic", icon: "ClipboardCheck" },
];

export default function EnglishPrep() {
  const { state } = useApp(); const j = jurisFor(state); const [tab, setTab] = useState("scores");
  const diag = state.english && state.english.diag;
  return (
    <Screen mod={MOD}>
      <Hero mod={MOD} icon="Languages" eyebrow={`English Test Prep · ${destOf(j.dest).flag} ${j.name}`} title="OET Nursing & IELTS Academic"
        sub="Know your target scores, pick the right test, and practice the writing and speaking that decide most results."
        stats={[["OET target", j.oet ? `L${j.oet.L} R${j.oet.R} W${j.oet.W} S${j.oet.S}` : "Not accepted"], ["IELTS target", j.ielts ? (j.ielts.overall != null ? `${j.ielts.overall} overall` : `L${j.ielts.L} R${j.ielts.R} W${j.ielts.W} S${j.ielts.S}`) : "Not accepted"], ["Diagnostic", diag ? `${diag.right}/${diag.total}` : "Not taken"]]} />
      <DestPill mod={MOD} />
      <Seg mod={MOD} value={tab} onChange={setTab} options={TABS} />
      {tab === "scores" ? <Scores mod={MOD} /> : null}
      {tab === "choose" ? <Choose mod={MOD} /> : null}
      {tab === "oet" ? <OetWriting mod={MOD} /> : null}
      {tab === "ielts" ? <ProGate mod={MOD} feature="IELTS Academic writing" desc="Healthcare Task 1 charts with Band 7+ models, Task 2 essay plans and a vocabulary booster."><IeltsWriting mod={MOD} /></ProGate> : null}
      {tab === "speak" ? <ProGate mod={MOD} feature="Speaking simulator" desc="OET role-play cards with a 3 + 5 minute timer and self-scoring on the five clinical communication criteria, plus IELTS cue cards."><Speaking mod={MOD} /></ProGate> : null}
      {tab === "diag" ? <Diagnostic mod={MOD} /> : null}
      <SourceList mod={MOD} sources={[...RULES_META.sources, ...EN.sources.filter(([, u]) => !RULES_META.sources.some(([, v]) => v === u))]} uncertain={RULES_META.uncertain} />
      <Txt v="tiny" muted>Practice material written for USRN Pathway. Not affiliated with or endorsed by OET, IELTS, Pearson or CELBAN. Score rules checked {RULES_META.checked}.</Txt>
    </Screen>
  );
}
