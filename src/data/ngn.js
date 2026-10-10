// Next Generation NCLEX-RN (NGN) unfolding case studies.
// Each case has an electronic health record (tabs: Notes, Vitals, Labs, Orders) and six items, one per step of
// the NCSBN Clinical Judgment Measurement Model (NCJMM):
//   Recognize Cues → Analyze Cues → Prioritize Hypotheses → Generate Solutions → Take Action → Evaluate Outcomes
//
// Item kinds and scoring (modeled on NGN scoring rules):
//   single     one answer                        0/1
//   multi      select all that apply             +/− (1 per correct choice, −1 per wrong choice, never below 0)
//   highlight  tap the cues in the chart text    +/− (same as multi)
//   matrix     one column per row                0/1 per row
//   cloze      drop-down blanks                  0/1 per blank
//   order      put the steps in order            0/1 per step in the right place
//   bowtie     1 condition, 2 actions, 2 params  0/1 per box (5 points)
// Any item may carry a trend table { cols, rows } shown above the stem.
//
// Written for NurseBound. Educational practice only; not affiliated with or endorsed by NCSBN.

export const NGN_STEPS = ["Recognize Cues", "Analyze Cues", "Prioritize Hypotheses", "Generate Solutions", "Take Action", "Evaluate Outcomes"];

import { NEW_CASES } from "./ngn-more";

const BASE_CASES = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: "adhf",
    title: "Acute Decompensated Heart Failure",
    sub: "Flash pulmonary edema · Cardiac step-down",
    area: "Physiological Adaptation",
    icon: "HeartPulse",
    profile: "68-year-old man with ischemic cardiomyopathy (ejection fraction 25%), admitted to the cardiac step-down unit.",
    ehr: {
      Notes: [
        ["Nurses' notes 06:30", "Client sitting upright on the edge of the bed, breathing fast and using accessory muscles. Productive cough with pink, frothy sputum. Crackles throughout both lower and middle lung fields. +3 pitting edema in both lower extremities. States, \"I can't catch my breath.\""],
      ],
      Vitals: [
        ["06:30", "BP 188/104 mm Hg · HR 118 (sinus tachycardia) · RR 32 · SpO₂ 84% on 2 L nasal cannula · T 37.0 °C (98.6 °F)"],
        ["Yesterday 18:00", "BP 142/86 · HR 92 · RR 20 · SpO₂ 94% on 2 L"],
      ],
      Labs: [
        ["05:00", "BNP 1,840 pg/mL (normal < 100) · Troponin I 0.02 ng/mL (normal < 0.04) · K⁺ 4.1 mEq/L · Creatinine 1.4 mg/dL · Na⁺ 136 mEq/L"],
      ],
      Orders: [
        ["Active", "Furosemide 40 mg IV push now · Oxygen to keep SpO₂ ≥ 92%; BiPAP per respiratory therapy if SpO₂ < 90% · Nitroglycerin IV infusion, titrate per protocol for SBP > 140 · Strict intake and output · Daily weight · 2 g sodium, 1.5 L fluid-restricted diet"],
      ],
    },
    items: [
      { id: "h1", step: "Recognize Cues", kind: "multi", stem: "Which findings require immediate follow-up by the nurse? Select all that apply.",
        options: [["a", "Pink, frothy sputum"], ["b", "SpO₂ 84% on 2 L nasal cannula"], ["c", "Respiratory rate 32"], ["d", "Crackles in the lower and middle lung fields"],
          ["e", "Blood pressure 188/104 mm Hg"], ["f", "Temperature 37.0 °C"], ["g", "Troponin I 0.02 ng/mL"], ["h", "Potassium 4.1 mEq/L"]],
        answer: ["a", "b", "c", "d", "e"],
        rationale: "Pink frothy sputum, crackles rising to the middle lung fields, hypoxemia and tachypnea show fluid filling the alveoli. Severe hypertension raises afterload and drives this \"flash\" pulmonary edema, so it also needs treatment now. The temperature, troponin and potassium are within normal limits." },
      { id: "h2", step: "Analyze Cues", kind: "single", stem: "What is causing the client's pink, frothy sputum and low oxygen saturation?",
        options: [["a", "High left ventricular filling pressure pushing fluid into the alveoli"], ["b", "Bacterial pneumonia filling the alveoli with pus"], ["c", "A new myocardial infarction damaging the left ventricle"], ["d", "A pulmonary embolism blocking blood flow to the lungs"]],
        answer: "a",
        rationale: "A failing left ventricle cannot empty. Pressure backs up into the pulmonary capillaries until fluid and red cells leak into the alveoli, which causes the pink froth and blocks oxygen exchange. No fever points away from pneumonia, a normal troponin argues against a new MI, and crackles with frothy sputum do not fit a PE." },
      { id: "h3", step: "Prioritize Hypotheses", kind: "single", stem: "The client is at highest risk for which life-threatening complication?",
        options: [["a", "Acute respiratory failure from cardiogenic pulmonary edema"], ["b", "Hypokalemia from diuretic therapy"], ["c", "Acute kidney injury"], ["d", "Deep vein thrombosis from immobility"]],
        answer: "a",
        rationale: "With an SpO₂ of 84% on oxygen, a respiratory rate of 32 and accessory muscle use, the client is close to respiratory failure. Hypokalemia and kidney injury are later risks of treatment. DVT is not the immediate threat." },
      { id: "h4", step: "Generate Solutions", kind: "matrix", stem: "For each intervention, mark whether it is indicated, non-essential, or contraindicated right now.", cols: ["Indicated", "Non-essential", "Contraindicated"],
        rows: [
          ["r1", "Give furosemide 40 mg IV push", "Indicated"],
          ["r2", "Move to BiPAP or high-flow oxygen", "Indicated"],
          ["r3", "Give a 500 mL 0.9% sodium chloride bolus", "Contraindicated"],
          ["r4", "Lay the client flat with legs elevated", "Contraindicated"],
          ["r5", "Start continuous pulse oximetry", "Indicated"],
          ["r6", "Weigh the client on a standing scale now", "Non-essential"] ],
        rationale: "Diuresis and better oxygen support treat the cause and the hypoxemia. A fluid bolus adds volume to lungs that are already flooded. Lying flat with legs up increases venous return and worsens the edema. Daily weight matters for tracking, but standing a hypoxic client on a scale now is unsafe and can wait." },
      { id: "h5", step: "Take Action", kind: "single", stem: "Which action should the nurse take first, before giving the IV furosemide?",
        options: [["a", "Raise the head of the bed to high-Fowler's with legs dependent and increase oxygen support"], ["b", "Give the furosemide immediately, then reposition"], ["c", "Insert an indwelling urinary catheter to measure output"], ["d", "Draw a repeat BNP level"]],
        answer: "a",
        rationale: "Airway and breathing come first. Sitting upright with the legs down reduces venous return and lets the diaphragm move, and stepping up oxygen (non-rebreather or BiPAP per order) treats the hypoxemia. These take seconds, and then the diuretic is given. A catheter and repeat labs can follow." },
      { id: "h6", step: "Evaluate Outcomes", kind: "matrix", stem: "At 07:30, after 1,200 mL of urine output: for each finding, mark whether the client has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        rows: [
          ["e1", "Respiratory rate 20", "Improved"],
          ["e2", "SpO₂ 95% on 4 L nasal cannula", "Improved"],
          ["e3", "Crackles now only at the bases", "Improved"],
          ["e4", "BP 148/88 mm Hg", "Improved"],
          ["e5", "+3 pitting edema in both legs", "No change"],
          ["e6", "Potassium 3.2 mEq/L", "Declined"] ],
        rationale: "Breathing, oxygenation, lung sounds and blood pressure show a good response. Peripheral edema clears more slowly than lung fluid. The new low potassium is a common side effect of loop diuretics and raises the risk of dysrhythmias, so report it and expect replacement." },
    ],
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: "urosepsis",
    title: "Septic Shock from Urosepsis",
    sub: "Catheter-associated urinary infection · Emergency department",
    area: "Physiological Adaptation",
    icon: "Activity",
    profile: "74-year-old woman sent from a skilled nursing facility with an indwelling urinary catheter and new confusion.",
    ehr: {
      Notes: [
        ["Nurses' notes 14:00", "Client lethargic and responds only to painful stimuli (baseline: alert, oriented to person and place). Urine in the drainage bag is dark amber and cloudy with heavy sediment. Skin warm and flushed. Capillary refill 4 seconds."],
      ],
      Vitals: [
        ["14:00", "BP 78/42 mm Hg (MAP 54) · HR 126 · RR 26 · T 39.2 °C (102.6 °F) · SpO₂ 93% on room air · Weight 60 kg"],
      ],
      Labs: [
        ["13:40", "WBC 19,800/µL with 18% bands · Lactate 4.2 mmol/L (normal < 2.0) · Glucose 148 mg/dL · Platelets 110,000/µL · Creatinine 1.9 mg/dL (baseline 1.0)"],
      ],
      Orders: [
        ["Active", "Blood cultures × 2 · Urine culture from a newly placed catheter · Lactated Ringer's 30 mL/kg IV (1,800 mL) · Piperacillin-tazobactam IV · Norepinephrine infusion, titrate to MAP ≥ 65 mm Hg · Repeat lactate in 2 hours · Replace the indwelling urinary catheter"],
      ],
    },
    items: [
      { id: "s1", step: "Recognize Cues", kind: "highlight", stem: "Tap the findings in the record that show poor blood flow to the tissues (hypoperfusion).",
        passage: [
          ["Responds only to painful stimuli", "p1"], [" · "], ["Skin warm and flushed", "p2"], [" · "], ["Capillary refill 4 seconds", "p3"], [" · "],
          ["Dark amber, cloudy urine", "p4"], [" · "], ["MAP 54 mm Hg", "p5"], [" · "], ["T 39.2 °C", "p6"], [" · "],
          ["SpO₂ 93% on room air", "p7"], [" · "], ["Lactate 4.2 mmol/L", "p8"], [" · "], ["Glucose 148 mg/dL", "p9"] ],
        answer: ["p1", "p3", "p5", "p8"],
        rationale: "A MAP below 65, a lactate above 2 (here 4.2), slow capillary refill and a drop in consciousness all show that organs are not getting enough oxygen. Fever, cloudy urine and flushed skin point to infection and vasodilation but do not by themselves measure perfusion. Mild hyperglycemia is a stress response." },
      { id: "s2", step: "Analyze Cues", kind: "single", stem: "Which mechanism is mainly causing the client's low blood pressure?",
        options: [["a", "Bacterial toxins causing widespread vasodilation and leaky capillaries"], ["b", "Blood loss lowering circulating volume"], ["c", "Pump failure from a weakened left ventricle"], ["d", "Low blood sugar reducing vascular tone"]],
        answer: "a",
        rationale: "Septic shock is distributive shock. Inflammatory mediators triggered by the infection dilate blood vessels and make capillaries leak, so blood pools and fluid shifts out of the vessels. Nothing suggests bleeding or heart failure, and the glucose is high, not low." },
      { id: "s3", step: "Prioritize Hypotheses", kind: "single", stem: "Which problem needs immediate resuscitation?",
        options: [["a", "Septic shock with tissue hypoperfusion"], ["b", "Uncomplicated urinary tract infection"], ["c", "Dehydration from poor oral intake"], ["d", "Delirium from a new environment"]],
        answer: "a",
        rationale: "Hypotension (MAP 54), a lactate of 4.2 and new organ dysfunction (confusion, creatinine nearly double baseline) show sepsis with hypoperfusion that is progressing to septic shock, which carries the highest risk of death. Confusion here comes from poor brain perfusion, not from a new environment." },
      { id: "s4", step: "Generate Solutions", kind: "order", stem: "The 30 mL/kg lactated Ringer's bolus has been started. Put the remaining hour-1 actions in order. Tap each in sequence; tap again to undo.",
        steps: [["o1", "Draw blood cultures × 2"], ["o2", "Give the first dose of broad-spectrum IV antibiotics"], ["o4", "Start norepinephrine if MAP stays below 65 mm Hg after the bolus"]],
        answer: ["o1", "o2", "o4"],
        rationale: "The Surviving Sepsis hour-1 bundle: measure lactate (already done), start 30 mL/kg crystalloid for hypotension or lactate ≥ 4 (running now), draw blood cultures before antibiotics so the organism can still be identified, give broad-spectrum antibiotics without delay, and add a vasopressor if MAP stays under 65 after the fluid challenge." },
      { id: "s5", step: "Take Action", kind: "single", stem: "The ordered 30 mL/kg (1,800 mL) of lactated Ringer's has infused. BP is now 82/46 mm Hg (MAP 58). Which action is the priority?",
        options: [["a", "Start and titrate the norepinephrine infusion to keep MAP ≥ 65 mm Hg"], ["b", "Give another 2 L fluid bolus before starting a vasopressor"], ["c", "Place the client flat with legs raised and recheck in 30 minutes"], ["d", "Give acetaminophen to lower the fever, then reassess"]],
        answer: "a",
        rationale: "The client has had the full fluid challenge and is still hypotensive, which is septic shock that needs a vasopressor. Norepinephrine is first-line; it is given through a central line when possible (a large, well-placed peripheral IV is acceptable for a short time, checked often for extravasation). More fluid without reassessment risks fluid overload, and waiting delays perfusion." },
      { id: "s6", step: "Evaluate Outcomes", kind: "matrix", stem: "Four hours after resuscitation: for each finding, mark whether the client has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        rows: [
          ["e1", "Lactate 2.1 mmol/L (was 4.2)", "Improved"],
          ["e2", "Urine output 35 mL/h (about 0.6 mL/kg/h)", "Improved"],
          ["e3", "MAP 68 mm Hg on norepinephrine", "Improved"],
          ["e4", "Opens eyes to voice, confused", "Improved"],
          ["e5", "Platelets 82,000/µL (was 110,000)", "Declined"],
          ["e6", "WBC 19,600/µL", "No change"] ],
        rationale: "Lactate clearance, urine output above 0.5 mL/kg/h, a MAP at goal and better responsiveness show that tissue perfusion is improving. Falling platelets can signal developing coagulopathy (DIC), so report them. White cells take days to fall once antibiotics start." },
    ],
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: "compartment",
    title: "Acute Compartment Syndrome",
    sub: "After tibial fracture surgery · Orthopedic unit",
    area: "Reduction of Risk Potential",
    icon: "Footprints",
    profile: "24-year-old man, 14 hours after open reduction and internal fixation (ORIF) of a closed right tibial shaft fracture.",
    ehr: {
      Notes: [
        ["Nurses' notes 22:00", "Reports right lower leg pain rising to 10/10, not relieved by IV morphine 4 mg given 30 minutes ago. Right calf tense, firm (\"wood-like\") and shiny. Passively flexing the right great toe upward causes severe pain. Surgical dressing feels tight."],
      ],
      Vitals: [
        ["22:00", "BP 142/88 mm Hg · HR 102 · RR 20 · SpO₂ 98% on room air · T 37.2 °C (99 °F)"],
        ["Neurovascular check 22:00", "Right dorsalis pedis pulse +1 (left +2) · Right foot warm · Light touch intact; tingling between the first and second toes · Capillary refill 3 seconds"],
      ],
      Labs: [
        ["20:00", "Hgb 12.8 g/dL · K⁺ 4.4 mEq/L · Creatinine 0.9 mg/dL · CK 1,150 U/L (expected after surgery)"],
      ],
      Orders: [
        ["Active", "Morphine 4 mg IV every 2 hours as needed for pain · Neurovascular checks every hour · Elevate right leg on pillows · Ice to the right leg as needed · Notify orthopedic surgery of neurovascular changes"],
      ],
    },
    items: [
      { id: "c1", step: "Recognize Cues", kind: "multi", stem: "Which findings are early warning signs of rising pressure in the muscle compartment? Select all that apply.",
        options: [["a", "Pain 10/10 not relieved by opioids"], ["b", "Severe pain when the toe is passively stretched"], ["c", "Tense, firm, shiny calf"], ["d", "Tingling between the first and second toes"],
          ["e", "Right dorsalis pedis pulse palpable at +1"], ["f", "Right foot warm"], ["g", "Temperature 37.2 °C"], ["h", "CK 1,150 U/L"]],
        answer: ["a", "b", "c", "d"],
        rationale: "Pain out of proportion to the injury, pain on passive stretch, a tense compartment and new paresthesia are the earliest signs. The deep peroneal nerve supplies the first web space, so tingling there is an early nerve warning. A warm foot and a palpable pulse are often still present early and do not rule it out; a pulse weaker than the other side (+1 vs. +2) is a late sign. Report it, but it is not an early warning. A mildly raised CK is expected after bone surgery." },
      { id: "c2", step: "Analyze Cues", kind: "single", stem: "The client's right dorsalis pedis pulse is palpable at +1. How should the nurse interpret this?",
        options: [["a", "It does not rule out compartment syndrome; pulses often remain until very late"], ["b", "It rules out compartment syndrome because arterial flow is present"], ["c", "It shows the pain is from the surgical incision"], ["d", "It means the pain medicine dose is too low"]],
        answer: "a",
        rationale: "Compartment pressure first collapses the low-pressure veins and capillaries. Arterial pulses can stay palpable until muscle and nerve damage is already severe. Waiting for a lost pulse means waiting too long." },
      { id: "c3", step: "Prioritize Hypotheses", kind: "single", stem: "These findings represent which urgent priority?",
        options: [["a", "Impending muscle and nerve death from high compartment pressure"], ["b", "Deep vein thrombosis of the right calf"], ["c", "Fat embolism syndrome"], ["d", "Surgical site infection"]],
        answer: "a",
        rationale: "Within 4 to 6 hours, ischemia from high compartment pressure can cause permanent muscle and nerve damage, contracture or limb loss, and can trigger rhabdomyolysis. DVT does not cause pain on passive toe stretch with paresthesia. Fat embolism presents with breathing problems, confusion and petechiae. Infection usually appears later." },
      { id: "c4", step: "Generate Solutions", kind: "matrix", stem: "For each intervention, mark whether it is indicated or contraindicated now.", cols: ["Indicated", "Contraindicated"],
        rows: [
          ["r1", "Keep the right leg elevated above the level of the heart", "Contraindicated"],
          ["r2", "Loosen the tight dressing (and ask the surgeon about splitting any cast)", "Indicated"],
          ["r3", "Apply ice packs to the calf", "Contraindicated"],
          ["r4", "Notify the orthopedic surgeon immediately", "Indicated"],
          ["r5", "Keep the client NPO (nothing by mouth) for possible surgery", "Indicated"],
          ["r6", "Give more morphine and reassess the leg in 1 hour", "Contraindicated"] ],
        rationale: "Raising the leg above the heart lowers arterial pressure into a compartment that is already squeezed, and ice constricts vessels. Both reduce blood flow and should be stopped even though they were ordered after surgery. Release anything tight, call the surgeon now, and keep the client NPO for an emergency fasciotomy. Medicating and waiting delays a time-critical diagnosis." },
      { id: "c5", step: "Take Action", kind: "single", stem: "While waiting for the orthopedic surgeon to arrive, how should the nurse position the right leg?",
        options: [["a", "Level with the heart"], ["b", "Elevated on two pillows above the heart"], ["c", "Lowered below the level of the bed"], ["d", "In traction with weights applied"]],
        answer: "a",
        rationale: "Keeping the limb level with the heart balances venous drainage against arterial inflow, which gives the best blood flow to the compartment. Elevation reduces arterial inflow; lowering the leg increases swelling." },
      { id: "c6", step: "Evaluate Outcomes", kind: "matrix", stem: "Twelve hours after an emergency fasciotomy: for each finding, mark whether the client has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        rows: [
          ["e1", "Tingling between the toes has resolved", "Improved"],
          ["e2", "Calf compartments soft to touch", "Improved"],
          ["e3", "Pain 4/10, relieved by ordered analgesia", "Improved"],
          ["e4", "Dorsalis pedis pulse +2", "Improved"],
          ["e5", "Dark tea-colored urine; CK 18,500 U/L", "Declined"] ],
        rationale: "Returning sensation, soft compartments, controlled pain and a stronger pulse confirm the decompression worked. Tea-colored urine with a very high CK signals rhabdomyolysis from damaged muscle. Report it and expect aggressive IV fluids and close monitoring of kidney function and potassium." },
    ],
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: "postop-sepsis",
    title: "Sepsis After Surgery",
    sub: "Post-op day 2, sigmoid colectomy · Surgical unit",
    area: "Physiological Adaptation",
    icon: "Stethoscope",
    profile: "72-year-old client on post-op day 2 after a sigmoid colectomy.",
    ehr: {
      Notes: [["Nurses' notes 07:40", "New confusion: oriented to self only (yesterday oriented × 4). Skin warm, flushed. Reports abdominal pain 3/10. Incision edges approximated, no drainage."]],
      Vitals: [["07:40", "T 38.9 °C (102 °F) · HR 118 · RR 24 · BP 88/50 (MAP 63) · SpO₂ 93% on room air · Weight 70 kg"]],
      Labs: [["06:00", "WBC 17.8 × 10³/µL · Lactate 4.1 mmol/L · Na⁺ 139 mEq/L · Creatinine 1.6 mg/dL (baseline 0.9) · Hgb 11.9 g/dL"]],
      Orders: [["Intake & output", "Urine output 90 mL over the last 6 hours"], ["Active", "Notify provider for SBP < 90, HR > 110 or new confusion · Sepsis protocol: if screen positive, the nurse may draw blood cultures × 2 and a lactate and start lactated Ringer's 30 mL/kg IV while notifying the provider"]],
    },
    items: [
      { id: "n1", step: "Recognize Cues", kind: "multi", stem: "Select all findings that require immediate follow-up.",
        options: [["a", "Temperature 38.9 °C"], ["b", "Heart rate 118"], ["c", "BP 88/50"], ["d", "Lactate 4.1 mmol/L"], ["e", "New confusion"], ["f", "Pain 3/10"], ["g", "Sodium 139 mEq/L"], ["h", "Urine output 90 mL / 6 h"]],
        answer: ["a", "b", "c", "d", "e", "h"],
        rationale: "Fever, tachycardia, hypotension, lactate ≥ 4, acute confusion and oliguria (< 0.5 mL/kg/h) are signs of sepsis with hypoperfusion. Pain 3/10 and a normal sodium are expected." },
      { id: "n2", step: "Analyze Cues", kind: "cloze", stem: "Complete the sentence.",
        blanks: [
          { id: "b1", pre: "The client's findings are most consistent with", opts: ["sepsis-induced hypoperfusion", "post-op ileus", "expected post-op inflammation"], answer: "sepsis-induced hypoperfusion" },
          { id: "b2", pre: "as shown by", opts: ["hypotension and a lactate of 4.1", "pain of 3/10", "a sodium of 139"], answer: "hypotension and a lactate of 4.1" },
          { id: "b3", pre: "and the rising creatinine suggests", opts: ["acute kidney injury", "dehydration only", "lab error"], answer: "acute kidney injury" } ],
        rationale: "Lactate ≥ 4 mmol/L or hypotension define sepsis with hypoperfusion and trigger the full fluid bolus. Creatinine near double baseline with oliguria points to AKI from poor perfusion. Anastomotic leak is a likely source after colectomy." },
      { id: "n3", step: "Prioritize Hypotheses", kind: "single", stem: "Which condition is the client at highest immediate risk of developing?",
        options: [["a", "Septic shock"], ["b", "Wound dehiscence"], ["c", "Deep vein thrombosis"], ["d", "Paralytic ileus"]], answer: "a",
        rationale: "Persistent hypotension needing vasopressors after fluids defines septic shock, with the highest short-term mortality. The others are real post-op risks but not the most immediate threat." },
      { id: "n4", step: "Generate Solutions", kind: "matrix", stem: "For each potential order, mark whether it is indicated or not indicated.", cols: ["Indicated", "Not indicated"],
        rows: [
          ["r1", "Obtain blood cultures before antibiotics", "Indicated"], ["r2", "30 mL/kg IV crystalloid bolus", "Indicated"],
          ["r3", "Broad-spectrum antibiotics within 1 hour", "Indicated"], ["r4", "Repeat lactate within 2–4 hours", "Indicated"],
          ["r5", "Furosemide 40 mg IV for low urine output", "Not indicated"], ["r6", "Hold IV fluids because of the client's age", "Not indicated"] ],
        rationale: "These follow the Surviving Sepsis hour-1 bundle. Diuretics in a hypoperfused client worsen the kidney injury. Age alone is not a reason to withhold resuscitation, though lungs are reassessed after each bolus." },
      { id: "n5", step: "Take Action", kind: "multi", stem: "Select all actions the nurse should take now.",
        options: [["a", "Call the provider using SBAR and request a sepsis evaluation / rapid response"], ["b", "Draw blood cultures before the first antibiotic dose"], ["c", "Start the prescribed fluid bolus"], ["d", "Increase vital signs to at least every 15 minutes"], ["e", "Encourage the client to ambulate to raise BP"], ["f", "Give acetaminophen and recheck vitals in 4 hours before calling"]],
        answer: ["a", "b", "c", "d"],
        rationale: "Escalate now, follow the bundle order (cultures, then antibiotics), resuscitate, and watch closely. Ambulating a hypotensive, confused client risks a fall; treating the fever and waiting delays sepsis care." },
      { id: "n6", step: "Evaluate Outcomes", kind: "matrix", stem: "Three hours later: for each finding, mark whether the client's condition has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        rows: [
          ["e1", "MAP 70 mm Hg", "Improved"], ["e2", "Lactate 1.9 mmol/L", "Improved"], ["e3", "Urine output 45 mL/h", "Improved"],
          ["e4", "New bilateral fine crackles, SpO₂ 89%", "Declined"], ["e5", "Oriented to self only", "No change"] ],
        rationale: "Perfusion markers are improving. New crackles with falling SpO₂ suggest fluid overload: report it, slow fluids per order, and expect vasopressors if MAP falls. Mental status has not yet improved." },
    ],
  },
];

/** Points earned and possible for one item. */
// Eight cases: the original four plus four more (DKA, postpartum hemorrhage, pediatric asthma, stroke) in ngn-more.js.
export const NGN_CASES = [...BASE_CASES, ...NEW_CASES];

export function scoreNgnItem(item, a) {
  if (item.kind === "bowtie") {
    // 0/1 per box: 1 condition + 2 actions + 2 parameters = 5 points
    if (!a) return [0, 5];
    const c = a.condition === item.condition.answer ? 1 : 0;
    const x = (a.actions || []).filter((id) => item.actions.answer.includes(id)).length;
    const m = (a.params || []).filter((id) => item.params.answer.includes(id)).length;
    return [c + x + m, 5];
  }
  const max = item.kind === "single" ? 1
    : item.kind === "cloze" ? item.blanks.length
    : item.kind === "matrix" ? item.rows.length
    : item.kind === "order" ? item.answer.length
    : item.answer.length;
  if (!a) return [0, max];
  if (item.kind === "single") return [a === item.answer ? 1 : 0, max];
  if (item.kind === "cloze") return [item.blanks.filter((b) => a[b.id] === b.answer).length, max];
  if (item.kind === "matrix") return [item.rows.filter(([id, , ans]) => a[id] === ans).length, max];
  if (item.kind === "order") return [item.answer.filter((id, n) => a[n] === id).length, max];
  // multi / highlight: +/− scoring, never below 0
  const plus = a.filter((x) => item.answer.includes(x)).length, minus = a.filter((x) => !item.answer.includes(x)).length;
  return [Math.max(0, plus - minus), max];
}
