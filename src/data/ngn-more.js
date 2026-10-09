// Four additional NGN unfolding case studies for NurseBound (same schema as NGN_CASES in src/data/ngn.js).
// New item features used here:
//   kind "bowtie"   condition (1 of 4) · actions (2 of 5) · parameters to monitor (2 of 5)
//   item.table      trend exhibit { cols, rows } shown above the stem (any item kind)
// Written for NurseBound. Educational practice only; not affiliated with or endorsed by NCSBN.

export const NEW_CASES = [
  /* ------------------------------------------------------------------ 5 */
  {
    id: "dka",
    title: "Diabetic ketoacidosis",
    sub: "Missed insulin doses · Emergency department",
    area: "Pharmacological & Parenteral Therapies",
    icon: "Pill",
    profile: "19-year-old woman with type 1 diabetes, brought to the emergency department after 2 days of vomiting. She ran out of insulin 3 days ago.",
    ehr: {
      Notes: [
        ["Nurses' notes 10:00", "Drowsy but opens eyes to voice and answers questions slowly. Deep, rapid breathing with a fruity odor on the breath. Dry mucous membranes; skin tenting on the forearm. Reports abdominal pain 6/10 and constant thirst. Her mother says she has been urinating \"all the time.\""],
      ],
      Vitals: [
        ["10:00", "BP 96/58 mm Hg · HR 124 (sinus tachycardia) · RR 30, deep · T 37.4 °C (99.3 °F) · SpO₂ 99% on room air · Weight 55 kg (121 lb)"],
      ],
      Labs: [
        ["09:45", "Glucose 486 mg/dL (27 mmol/L) · Venous pH 7.14 · HCO₃⁻ 9 mEq/L · Anion gap 26 · Beta-hydroxybutyrate 6.2 mmol/L (normal < 0.6) · K⁺ 5.4 mEq/L · Na⁺ 131 mEq/L · Cl⁻ 96 mEq/L · BUN 32 mg/dL · Creatinine 1.4 mg/dL · Urine ketones large"],
      ],
      Orders: [
        ["Active", "0.9% sodium chloride 1 L IV over 1 hour, then per DKA protocol · Regular insulin IV infusion 0.1 unit/kg/h (5.5 units/h); hold and notify provider if K⁺ < 3.5 mEq/L · Add potassium chloride to IV fluids per protocol when K⁺ < 5.0 mEq/L and urine output is adequate · Change to dextrose 5% in 0.45% sodium chloride when glucose < 250 mg/dL · Point-of-care glucose every hour · Basic metabolic panel, venous pH and beta-hydroxybutyrate every 2 hours · Continuous cardiac monitoring · Strict intake and output"],
      ],
    },
    items: [
      { id: "k1", step: "Recognize Cues", kind: "highlight", stem: "Tap the findings that show ketoacidosis, not just a high blood sugar.",
        passage: [
          ["Deep, rapid breathing", "g1"], [" · "], ["Fruity odor on the breath", "g2"], [" · "], ["Constant thirst", "g3"], [" · "],
          ["Urinating \"all the time\"", "g4"], [" · "], ["Glucose 486 mg/dL", "g5"], [" · "], ["pH 7.14", "g6"], [" · "],
          ["HCO₃⁻ 9 mEq/L", "g7"], [" · "], ["Anion gap 26", "g8"], [" · "], ["Beta-hydroxybutyrate 6.2 mmol/L", "g9"], [" · "], ["T 37.4 °C", "g10"] ],
        answer: ["g1", "g2", "g6", "g7", "g8", "g9"],
        rationale: "Ketoacidosis means acid is building up. Kussmaul breathing, acetone (fruity) breath, a low pH, a low bicarbonate, a high anion gap and a high ketone level all show it. Thirst, frequent urination and a high glucose come from hyperglycemia alone and are also seen in hyperosmolar hyperglycemic state, which has no major acidosis. A temperature of 37.4 °C is not a sign of ketoacidosis." },
      { id: "k2", step: "Analyze Cues", kind: "cloze", stem: "Complete the sentences.",
        blanks: [
          { id: "b1", pre: "The client's deep, rapid breathing is the body's attempt to", opts: ["blow off carbon dioxide", "retain carbon dioxide", "take in more oxygen"], answer: "blow off carbon dioxide" },
          { id: "b2", pre: "to make up for a", opts: ["metabolic acidosis", "respiratory acidosis", "metabolic alkalosis"], answer: "metabolic acidosis" },
          { id: "b3", pre: "Although the serum potassium is 5.4 mEq/L, total body potassium is most likely", opts: ["low", "normal", "high"], answer: "low" },
          { id: "b4", pre: "because", opts: ["acidosis and lack of insulin move potassium out of the cells while it is lost in the urine", "the kidneys hold on to potassium during dehydration", "the blood sample was hemolyzed"], answer: "acidosis and lack of insulin move potassium out of the cells while it is lost in the urine" } ],
        rationale: "Ketones are acids, so this is a metabolic acidosis. The lungs compensate by breathing deep and fast to remove CO₂. Without insulin, and with acid in the blood, potassium moves out of the cells into the serum, so the lab value looks normal or high. Meanwhile osmotic diuresis and vomiting have drained the body's stores. The kidneys are losing potassium, not holding it, and nothing in the record suggests hemolysis." },
      { id: "k3", step: "Prioritize Hypotheses", kind: "single", stem: "Once the insulin infusion is running, the client is at highest risk for which life-threatening complication?",
        options: [["a", "Hypokalemia leading to cardiac dysrhythmias"], ["b", "Hyperkalemia from potassium added to the IV fluids"], ["c", "Fluid overload from the 0.9% sodium chloride"], ["d", "Hypercalcemia from dehydration"]],
        answer: "a",
        rationale: "Insulin drives potassium back into the cells, and fluids dilute it, so serum potassium can drop fast in a client whose total stores are already low. Severe hypokalemia causes dysrhythmias and cardiac arrest. Potassium is added only when the level falls below 5.0 and urine output is adequate, which guards against hyperkalemia. A young adult with a large fluid deficit is at low risk for overload. Hypercalcemia is not a feature of DKA." },
      { id: "k4", step: "Generate Solutions", kind: "matrix", stem: "At 10:00, for each order, mark whether it is indicated or not indicated now.", cols: ["Indicated", "Not indicated"],
        rows: [
          ["r1", "0.9% sodium chloride 1 L IV over the first hour", "Indicated"],
          ["r2", "Regular insulin IV infusion at 0.1 unit/kg/h", "Indicated"],
          ["r3", "Sodium bicarbonate IV to correct the pH of 7.14", "Not indicated"],
          ["r4", "Add 40 mEq potassium chloride to the first liter of fluid", "Not indicated"],
          ["r5", "Continuous cardiac monitoring", "Indicated"],
          ["r6", "Point-of-care glucose every hour", "Indicated"] ],
        rationale: "Isotonic fluid comes first to restore volume and kidney blood flow. The insulin infusion can start because potassium is above 3.5 mEq/L. Bicarbonate is considered only when pH is below 7.0; fluids and insulin will correct this acidosis. Potassium is not added while it is 5.4 mEq/L, but it will be needed soon. Cardiac monitoring catches potassium-related rhythm changes, and hourly glucose guides the insulin and the switch to dextrose." },
      { id: "k5", step: "Take Action", kind: "single", stem: "At 14:00 the glucose is 244 mg/dL, pH 7.24, HCO₃⁻ 14 mEq/L, anion gap 18 and K⁺ 4.0 mEq/L. Which action should the nurse take?",
        options: [["a", "Change the IV fluid to dextrose 5% in 0.45% sodium chloride with potassium and continue the insulin infusion"], ["b", "Stop the insulin infusion because the glucose is close to target"], ["c", "Give subcutaneous insulin and stop the IV insulin now"], ["d", "Give 50% dextrose IV push"]],
        answer: "a",
        rationale: "Glucose falls faster than ketones clear. Adding dextrose when glucose drops below 250 mg/dL lets the insulin keep running (the rate may be lowered per protocol) until the acidosis resolves, without causing hypoglycemia. Stopping insulin now would let ketones build up again. The switch to subcutaneous insulin waits until DKA has resolved and the client can eat, with the IV and subcutaneous doses overlapping by 1 to 2 hours. 50% dextrose is a treatment for hypoglycemia, which she does not have." },
      { id: "k6", step: "Evaluate Outcomes", kind: "matrix", stem: "Review the trend. For each finding at 18:00, mark whether the client has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        table: { cols: ["Time", "Glucose (mg/dL)", "pH", "HCO₃⁻ (mEq/L)", "Anion gap", "β-OHB (mmol/L)", "K⁺ (mEq/L)"],
          rows: [
            ["10:00", "486", "7.14", "9", "26", "6.2", "5.4"],
            ["12:00", "362", "7.19", "11", "22", "4.8", "4.6"],
            ["14:00", "244", "7.24", "14", "18", "3.1", "4.0"],
            ["16:00", "198", "7.29", "16", "15", "1.9", "3.8"],
            ["18:00", "176", "7.33", "19", "11", "0.9", "3.2"] ] },
        rows: [
          ["e1", "pH 7.33 and HCO₃⁻ 19 mEq/L", "Improved"],
          ["e2", "Anion gap 11", "Improved"],
          ["e3", "Beta-hydroxybutyrate 0.9 mmol/L", "Improved"],
          ["e4", "Potassium 3.2 mEq/L", "Declined"],
          ["e5", "Alert, oriented, abdominal pain 2/10", "Improved"] ],
        rationale: "The pH, bicarbonate, anion gap and ketones are all moving toward normal, and her mental status and pain have improved. DKA is not resolved until ketones are below 0.6 mmol/L (with venous pH 7.3 or higher or bicarbonate 18 mEq/L or higher), so insulin is still needed. Potassium has dropped below 3.5 mEq/L because insulin keeps moving it into the cells. Follow the order: hold the insulin infusion, notify the provider and expect faster potassium replacement. Insulin restarts once potassium is back above 3.5 mEq/L, because ketones must still be cleared." },
    ],
  },

  /* ------------------------------------------------------------------ 6 */
  {
    id: "pph",
    title: "Postpartum hemorrhage",
    sub: "Uterine atony after vaginal birth · Labor and delivery",
    area: "Reduction of Risk Potential",
    icon: "Droplets",
    profile: "34-year-old, G4 P4, 45 minutes after the vaginal birth of a 4.3 kg (9 lb 8 oz) newborn after 22 hours of labor augmented with oxytocin. History of mild intermittent asthma.",
    ehr: {
      Notes: [
        ["Nurses' notes 15:45", "Placenta delivered intact at 15:08. First-degree perineal laceration repaired. Peripad soaked in 10 minutes, with a steady trickle of bright red blood and clots. Fundus boggy, 2 cm above the umbilicus, midline. Client states, \"I feel dizzy and cold.\" Skin pale and clammy."],
      ],
      Vitals: [
        ["15:45", "BP 96/58 mm Hg · HR 122 · RR 24 · SpO₂ 97% on room air · T 37.6 °C (99.7 °F)"],
        ["Admission", "BP 124/76 · HR 82 · RR 18"],
      ],
      Labs: [
        ["Admission", "Hgb 11.8 g/dL · Platelets 210,000/µL · Fibrinogen 420 mg/dL · Blood type O positive, antibody screen negative"],
      ],
      Orders: [
        ["Active", "Oxytocin 30 units in 500 mL lactated Ringer's IV; increase per postpartum hemorrhage protocol · Methylergonovine 0.2 mg IM per protocol · Carboprost 250 mcg IM per protocol · Misoprostol 800 mcg sublingual or rectal per protocol · Tranexamic acid 1 g IV over 10 minutes within 3 hours of birth · Type and crossmatch 2 units packed red blood cells · Quantitative blood loss (QBL) every 15 minutes"],
      ],
    },
    items: [
      { id: "p1", step: "Recognize Cues", kind: "multi", stem: "Review the flow sheet. Which findings require immediate follow-up? Select all that apply.",
        table: { cols: ["Time", "BP (mm Hg)", "HR", "RR", "SpO₂", "Cumulative QBL (mL)"],
          rows: [
            ["15:00 (birth)", "128/78", "84", "18", "99%", "350"],
            ["15:15", "124/76", "92", "18", "99%", "450"],
            ["15:30", "112/70", "104", "20", "98%", "700"],
            ["15:45", "96/58", "122", "24", "97%", "1,100"] ] },
        options: [["a", "Boggy fundus 2 cm above the umbilicus"], ["b", "Peripad soaked in 10 minutes"], ["c", "Heart rate rising to 122"], ["d", "Cumulative QBL 1,100 mL"],
          ["e", "Dizziness with pale, clammy skin"], ["f", "Temperature 37.6 °C"], ["g", "SpO₂ 97% on room air"], ["h", "Platelets 210,000/µL"]],
        answer: ["a", "b", "c", "d", "e"],
        rationale: "A boggy, high fundus and a pad soaked in minutes show active bleeding. Blood loss of 1,000 mL or more, a heart rate climbing every 15 minutes, a falling BP and dizziness with clammy skin show hypovolemia. A shock index (HR ÷ systolic BP) of 1.27 is well above the warning level of 0.9. A temperature up to 38 °C (100.4 °F) is common in the first 24 hours after birth, the SpO₂ is normal, and the admission platelet count is normal." },
      { id: "p2", step: "Analyze Cues", kind: "single", stem: "What is the most likely cause of this client's bleeding?",
        options: [["a", "Uterine atony"], ["b", "Retained placental fragments"], ["c", "An unrepaired vaginal or cervical laceration"], ["d", "A clotting disorder"]],
        answer: "a",
        rationale: "Atony causes most postpartum hemorrhages. A soft, boggy uterus cannot squeeze the open blood vessels at the placental site closed. A large baby and a long labor with oxytocin both overstretch and tire the uterus. The placenta was delivered intact. Bleeding from a laceration continues while the fundus is firm. The platelet count and fibrinogen were normal." },
      { id: "p3", step: "Prioritize Hypotheses", kind: "cloze", stem: "Complete the sentence.",
        blanks: [
          { id: "b1", pre: "The client is experiencing", opts: ["a postpartum hemorrhage", "normal postpartum blood loss", "postpartum preeclampsia"], answer: "a postpartum hemorrhage" },
          { id: "b2", pre: "because her cumulative blood loss is", opts: ["1,000 mL or more with signs of hypovolemia", "less than 500 mL", "unknown until the next hemoglobin result"], answer: "1,000 mL or more with signs of hypovolemia" },
          { id: "b3", pre: "and her most immediate risk is", opts: ["hypovolemic shock", "deep vein thrombosis", "endometritis"], answer: "hypovolemic shock" } ],
        rationale: "Postpartum hemorrhage is cumulative blood loss of 1,000 mL or more, or any blood loss with signs of hypovolemia, within 24 hours of birth. Measured (quantitative) blood loss is used instead of a hemoglobin, which lags behind acute loss. Her BP is low, so this is not preeclampsia. With ongoing bleeding, the threat is hypovolemic shock. DVT and infection are later risks." },
      { id: "p4", step: "Generate Solutions", kind: "matrix", stem: "The provider is on the way. For each medication in the hemorrhage protocol, mark whether it is indicated or contraindicated for this client.", cols: ["Indicated", "Contraindicated"],
        rows: [
          ["r1", "Increase the oxytocin IV infusion", "Indicated"],
          ["r2", "Methylergonovine 0.2 mg IM", "Indicated"],
          ["r3", "Carboprost 250 mcg IM", "Contraindicated"],
          ["r4", "Tranexamic acid 1 g IV over 10 minutes", "Indicated"],
          ["r5", "Misoprostol 800 mcg", "Indicated"],
          ["r6", "Oxytocin 10 units undiluted IV push", "Contraindicated"] ],
        rationale: "Oxytocin is first-line. Methylergonovine is avoided in hypertension and preeclampsia, but her BP is low, so it is safe. Carboprost can cause severe bronchospasm and is contraindicated with asthma. Tranexamic acid is added to uterotonics once a hemorrhage is diagnosed and works only when given within 3 hours of birth; she is 45 minutes postpartum. Misoprostol has no contraindication here. Undiluted oxytocin given by fast IV push can cause sudden hypotension and dysrhythmias, so it is given as an infusion or IM." },
      { id: "p5", step: "Take Action", kind: "multi", stem: "The provider has been paged. Select all actions the nurse should take now.",
        options: [["a", "Massage the fundus firmly with one hand while the other hand supports the lower uterine segment"], ["b", "Call for help and activate the obstetric hemorrhage response"], ["c", "Increase the oxytocin infusion rate per protocol"], ["d", "Start a second large-bore IV (16–18 gauge) and send a type and crossmatch"],
          ["e", "Weigh all pads and underpads to update the QBL"], ["f", "Help the client walk to the bathroom to empty her bladder"], ["g", "Give oral fluids and reassess in 30 minutes"], ["h", "Put the newborn to breast instead of increasing the oxytocin"]],
        answer: ["a", "b", "c", "d", "e"],
        rationale: "Fundal massage with lower segment support firms the uterus without risking inversion. A hemorrhage needs more hands, uterotonics, IV access for fluids and blood, and accurate measurement (1 g of weight equals about 1 mL of blood). A dizzy, hypotensive client must not walk; if her bladder is full, catheterize her. Oral fluids may delay surgery and do not replace blood. Breastfeeding releases some oxytocin but is not a substitute for treatment during an active hemorrhage." },
      { id: "p6", step: "Evaluate Outcomes", kind: "matrix", stem: "Forty-five minutes after treatment: for each finding, mark whether the client has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        rows: [
          ["e1", "Fundus firm, at the umbilicus, midline", "Improved"],
          ["e2", "HR 96, BP 110/68 mm Hg", "Improved"],
          ["e3", "Pad weights show 40 mL of blood loss over the last 30 minutes", "Improved"],
          ["e4", "Less dizzy; skin warm and dry", "Improved"],
          ["e5", "SpO₂ 98% on room air", "No change"],
          ["e6", "Hgb 8.4 g/dL (was 11.8 on admission)", "Declined"] ],
        rationale: "A firm fundus, small pad weights and better vital signs show the bleeding is controlled. Oxygenation was normal before and is still normal. The hemoglobin drop is expected after this much blood loss and often falls further as fluids are given. Report it so the provider can decide about transfusion and iron, and keep assessing the fundus and bleeding." },
    ],
  },

  /* ------------------------------------------------------------------ 7 */
  {
    id: "peds-asthma",
    title: "Severe asthma exacerbation",
    sub: "6-year-old child · Pediatric emergency department",
    area: "Physiological Adaptation",
    icon: "Stethoscope",
    profile: "6-year-old boy (22 kg) with persistent asthma, brought by his father after 2 days of cold symptoms and 1 day of worsening cough and wheezing. He has used his albuterol inhaler 6 times since midnight.",
    ehr: {
      Notes: [
        ["Nurses' notes 08:10", "Sitting upright and leaning forward on his arms. Speaks 2 to 3 words at a time. Suprasternal and intercostal retractions with nasal flaring. Inspiratory and expiratory wheezes in all fields; air movement diminished at the bases. Father says his daily inhaled corticosteroid \"ran out last month.\""],
      ],
      Vitals: [
        ["08:10", "HR 148 · RR 44 · SpO₂ 89% on room air · BP 104/64 mm Hg · T 37.8 °C (100.0 °F)"],
      ],
      Labs: [
        ["08:20", "Respiratory viral panel: rhinovirus positive"],
      ],
      Orders: [
        ["Active", "Oxygen to keep SpO₂ 94–98% · Albuterol 2.5 mg with ipratropium 0.5 mg nebulized every 20 minutes × 3 · Dexamethasone 0.6 mg/kg PO (13 mg) now · Magnesium sulfate 50 mg/kg IV (1,100 mg) over 20 minutes if no improvement after the first hour · Continuous pulse oximetry and cardiorespiratory monitoring · Notify provider for SpO₂ < 90% on oxygen, decreasing breath sounds or change in mental status"],
      ],
    },
    items: [
      { id: "a1", step: "Recognize Cues", kind: "highlight", stem: "Tap the findings that show severe respiratory distress.",
        passage: [
          ["Leaning forward on his arms", "q1"], [" · "], ["Speaks 2 to 3 words at a time", "q2"], [" · "], ["Suprasternal and intercostal retractions", "q3"], [" · "],
          ["Nasal flaring", "q4"], [" · "], ["RR 44", "q5"], [" · "], ["SpO₂ 89% on room air", "q6"], [" · "],
          ["BP 104/64 mm Hg", "q7"], [" · "], ["T 37.8 °C", "q8"], [" · "], ["Inhaled corticosteroid ran out last month", "q9"] ],
        answer: ["q1", "q2", "q3", "q4", "q5", "q6"],
        rationale: "The tripod position, speaking only in short phrases, retractions, nasal flaring, a respiratory rate about twice normal for age (about 18 to 25) and an SpO₂ below 90% all mark a severe exacerbation. The BP is normal for his age. A low-grade temperature fits the viral trigger. The missed controller medicine is a risk factor that needs teaching, but it is not a sign of distress." },
      { id: "a2", step: "Analyze Cues", kind: "single", stem: "The nurse notes diminished air movement at the lung bases. How should the nurse interpret this finding?",
        options: [["a", "Airflow is severely limited; a quieter chest can mean the obstruction is getting worse"], ["b", "The wheezing is resolving because the airways are opening"], ["c", "It shows pneumonia with consolidation in both bases"], ["d", "It is a normal finding in children because of the thin chest wall"]],
        answer: "a",
        rationale: "Wheezing needs moving air. When the airways narrow so much that little air moves, breath sounds and wheezes fade. A \"quiet\" or silent chest in a child who is still working hard to breathe is an ominous sign, not improvement. Consolidation would be focal with crackles or bronchial breath sounds, and a thin chest wall makes breath sounds louder, not softer." },
      { id: "a3", step: "Prioritize Hypotheses", kind: "bowtie", stem: "Complete the diagram: the condition the client is most likely experiencing, 2 actions the nurse should take, and 2 parameters the nurse should monitor.",
        condition: { opts: [["c1", "Severe asthma exacerbation"], ["c2", "Foreign-body aspiration"], ["c3", "Croup (laryngotracheobronchitis)"], ["c4", "Anaphylaxis"]], answer: "c1" },
        actions: { opts: [["x1", "Give nebulized albuterol and ipratropium with oxygen"], ["x2", "Give the systemic corticosteroid now"], ["x3", "Lay the child flat to listen to the posterior lung fields"], ["x4", "Give a sedative to ease his anxiety"], ["x5", "Delay treatment until a peak flow reading is obtained"]], answer: ["x1", "x2"] },
        params: { opts: [["m1", "Oxygen saturation"], ["m2", "Work of breathing and air movement"], ["m3", "Bowel sounds"], ["m4", "Daily weight"], ["m5", "Urine specific gravity"]], answer: ["m1", "m2"] },
        rationale: "A known asthmatic with a viral trigger, a missed controller and diffuse wheezing on both sides is having an asthma exacerbation. Foreign-body aspiration usually causes sudden, one-sided findings. Croup causes a barky cough and stridor in younger children. Anaphylaxis comes with hives or swelling after an exposure. A short-acting bronchodilator with ipratropium opens the airways, and an early systemic steroid treats the inflammation. Lying flat worsens breathing, sedatives can stop it, and a child this breathless cannot do a reliable peak flow. SpO₂ and work of breathing (retractions, speech, air entry) show whether treatment is working." },
      { id: "a4", step: "Generate Solutions", kind: "matrix", stem: "At 09:10, after three albuterol–ipratropium treatments and oral dexamethasone, he still has severe retractions and an SpO₂ of 91% on 2 L. For each possible order, mark whether it is indicated or not indicated.", cols: ["Indicated", "Not indicated"],
        rows: [
          ["r1", "Magnesium sulfate 50 mg/kg IV over 20 minutes", "Indicated"],
          ["r2", "Continuous nebulized albuterol", "Indicated"],
          ["r3", "Increase oxygen to keep SpO₂ 94–98%", "Indicated"],
          ["r4", "Chest physiotherapy with percussion", "Not indicated"],
          ["r5", "Nebulized acetylcysteine to loosen mucus", "Not indicated"],
          ["r6", "IV lorazepam for agitation", "Not indicated"] ],
        rationale: "When the first hour of treatment fails, IV magnesium relaxes bronchial smooth muscle, continuous albuterol keeps the airways open, and oxygen is raised to the target range. Chest physiotherapy and mucolytics do not help in an acute attack and can trigger more bronchospasm. Agitation in a hypoxic child is a sign of poor oxygenation; sedation can suppress breathing and lead to respiratory arrest." },
      { id: "a5", step: "Take Action", kind: "single", stem: "Magnesium was given at 09:15 and continuous albuterol is running. A venous blood gas at 10:00 shows pH 7.24 and PCO₂ 58 mm Hg. Review the trend. Which action should the nurse take first?",
        table: { cols: ["Time", "HR", "RR", "SpO₂", "Breath sounds", "Mental status"],
          rows: [
            ["08:10", "148", "44", "89% room air", "Wheezes in and out, all fields", "Anxious, alert"],
            ["08:50", "154", "40", "93% on 2 L", "Expiratory wheezes", "Anxious, alert"],
            ["09:30", "160", "34", "91% on 4 L", "Faint wheezes, poor air entry", "Restless"],
            ["10:00", "164", "22", "87% on 6 L", "Barely audible, no wheezes", "Drowsy, hard to wake"] ] },
        options: [["a", "Call for immediate help from the provider and resuscitation team and prepare to assist breathing with a bag-valve mask on 100% oxygen"], ["b", "Document that the wheezing has resolved and space out the treatments"], ["c", "Let the child sleep because he is finally resting"], ["d", "Repeat the blood gas in 1 hour"]],
        answer: "a",
        rationale: "A falling respiratory rate, a silent chest, worsening SpO₂ on more oxygen, drowsiness and a rising PCO₂ with acidosis show that the child is tiring and heading into respiratory failure. He needs immediate help with ventilation and the team for advanced airway support. The wheeze is gone because air is not moving, not because he is better. Drowsiness here comes from CO₂ retention, and waiting an hour could lead to arrest." },
      { id: "a6", step: "Evaluate Outcomes", kind: "matrix", stem: "Six hours after transfer to the pediatric ICU on high-flow nasal cannula and continuous albuterol: for each finding, mark whether the client has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        rows: [
          ["e1", "Awake and asking for his tablet", "Improved"],
          ["e2", "Speaks in full sentences", "Improved"],
          ["e3", "RR 28 with mild subcostal retractions", "Improved"],
          ["e4", "Expiratory wheezes now heard in all fields", "Improved"],
          ["e5", "SpO₂ 95%; oxygen being weaned", "Improved"],
          ["e6", "Potassium 3.0 mEq/L (was 4.1 mEq/L at 10:00)", "Declined"] ],
        rationale: "Better alertness, full sentences, a slower respiratory rate, less retraction and good SpO₂ on less oxygen show recovery. Hearing wheezes again after a silent chest means air is moving through the airways again, which is improvement. Frequent or continuous albuterol shifts potassium into the cells, so hypokalemia is a known side effect. Report it and expect replacement and cardiac monitoring." },
    ],
  },

  /* ------------------------------------------------------------------ 8 */
  {
    id: "stroke",
    title: "Acute ischemic stroke",
    sub: "Thrombolysis window · Emergency department",
    area: "Management of Care",
    icon: "Brain",
    profile: "71-year-old man with hypertension and type 2 diabetes, brought by EMS at 10:20. His wife last saw him normal at 08:50 and found him at 09:30 slumped in his chair, unable to speak clearly. He takes no anticoagulants.",
    ehr: {
      Notes: [
        ["Nurses' notes 10:25", "Right facial droop. Right arm drifts to the bed within 10 seconds; right leg drifts. Speaks only a few words and cannot name objects, but follows simple commands. Eyes deviate to the left. NIHSS 14. Weight 80 kg."],
      ],
      Vitals: [
        ["10:25", "BP 196/112 mm Hg · HR 108, irregularly irregular (new atrial fibrillation) · RR 18 · SpO₂ 95% on room air · T 36.9 °C (98.4 °F)"],
      ],
      Labs: [
        ["10:24", "Point-of-care glucose 142 mg/dL"],
        ["10:35", "Platelets 228,000/µL · INR 1.0 · aPTT 29 seconds · Creatinine 1.1 mg/dL"],
        ["Imaging 10:38", "Noncontrast CT head: no hemorrhage. CT angiography: occlusion of the left middle cerebral artery (M1)."],
      ],
      Orders: [
        ["Active", "Stroke alert · Labetalol 10 mg IV over 1–2 minutes; may repeat once for BP > 185/110 mm Hg · Tenecteplase 0.25 mg/kg IV bolus (20 mg) once BP < 185/110 mm Hg · Interventional neuroradiology consult for thrombectomy · NPO until bedside swallow screen · Neuro checks and BP every 15 minutes × 2 hours, every 30 minutes × 6 hours, then hourly × 16 hours · Keep BP < 180/105 mm Hg for 24 hours after thrombolysis"],
      ],
    },
    items: [
      { id: "t1", step: "Recognize Cues", kind: "multi", stem: "Which findings require immediate follow-up by the stroke team? Select all that apply.",
        options: [["a", "Last known well at 08:50"], ["b", "BP 196/112 mm Hg"], ["c", "Right arm drifts to the bed within 10 seconds"], ["d", "Speaks only a few words and cannot name objects"],
          ["e", "New irregularly irregular pulse"], ["f", "Point-of-care glucose 142 mg/dL"], ["g", "SpO₂ 95% on room air"], ["h", "Temperature 36.9 °C"]],
        answer: ["a", "b", "c", "d", "e"],
        rationale: "The last-known-well time decides treatment eligibility. A BP above 185/110 must be lowered before a thrombolytic. One-sided weakness and aphasia are deficits that are tracked closely for change. New atrial fibrillation is a likely source of the clot and needs follow-up. The glucose was checked to rule out hypoglycemia as a stroke mimic and is acceptable. Oxygen is not needed while SpO₂ stays at 94% or higher, and he has no fever." },
      { id: "t2", step: "Analyze Cues", kind: "cloze", stem: "Complete the sentences.",
        blanks: [
          { id: "b1", pre: "Right-sided weakness with trouble speaking points to a stroke in the", opts: ["left cerebral hemisphere", "right cerebral hemisphere", "cerebellum"], answer: "left cerebral hemisphere" },
          { id: "b2", pre: "The window for IV thrombolysis is counted from", opts: ["08:50, when he was last known well", "09:30, when his wife found him", "10:20, when he arrived at the hospital"], answer: "08:50, when he was last known well" },
          { id: "b3", pre: "so the 4.5-hour window closes at", opts: ["13:20", "14:00", "14:50"], answer: "13:20" } ],
        rationale: "Motor pathways cross, so a left-hemisphere stroke weakens the right side, and the language centers are in the left hemisphere in most people. The eyes look toward the side of the lesion. When onset is not witnessed, the clock starts at the last time the client was seen normal, not when symptoms were found or when he arrived: 08:50 plus 4.5 hours is 13:20." },
      { id: "t3", step: "Prioritize Hypotheses", kind: "single", stem: "The CT shows no bleeding. Which finding must be corrected before a thrombolytic can be given?",
        options: [["a", "BP 196/112 mm Hg"], ["b", "Atrial fibrillation with a heart rate of 108"], ["c", "Glucose 142 mg/dL"], ["d", "Age of 71 years"]],
        answer: "a",
        rationale: "BP must be below 185/110 mm Hg before thrombolysis and kept below 180/105 mm Hg for 24 hours afterward, because high pressure raises the risk of bleeding into the brain. Atrial fibrillation is not a contraindication. Only a glucose below 50 mg/dL must be corrected first. There is no upper age limit for thrombolysis." },
      { id: "t4", step: "Generate Solutions", kind: "bowtie", stem: "Complete the diagram: the condition the client is most likely experiencing, 2 actions the nurse should take, and 2 parameters the nurse should monitor.",
        condition: { opts: [["c1", "Acute ischemic stroke from a large-vessel occlusion"], ["c2", "Hemorrhagic stroke"], ["c3", "Hypoglycemia mimicking a stroke"], ["c4", "Transient ischemic attack"]], answer: "c1" },
        actions: { opts: [["x1", "Give IV labetalol to bring BP below 185/110 mm Hg"], ["x2", "Give the tenecteplase bolus once BP is below 185/110 mm Hg"], ["x3", "Give aspirin 325 mg by mouth now"], ["x4", "Start a heparin infusion for the atrial fibrillation"], ["x5", "Lower the BP quickly to 120/80 mm Hg"]], answer: ["x1", "x2"] },
        params: { opts: [["m1", "Neurologic status (NIHSS)"], ["m2", "Blood pressure"], ["m3", "Daily weight"], ["m4", "Bowel sounds"], ["m5", "Capillary refill in the right hand"]], answer: ["m1", "m2"] },
        rationale: "The CT shows no blood, the glucose is normal and the deficits are still present, while the CT angiogram shows a blocked M1 artery: an ischemic stroke from a large-vessel occlusion, not a TIA. Lowering the BP just enough makes him eligible, and tenecteplase 0.25 mg/kg (maximum 25 mg) is an accepted choice for IV thrombolysis. Because an M1 occlusion is a large-vessel occlusion, he should also go on to thrombectomy without waiting to see whether the thrombolytic works. Aspirin and heparin are not given within 24 hours of thrombolysis, and he is NPO until a swallow screen. Dropping the BP to normal reduces blood flow to the brain tissue that can still be saved. Neuro checks and BP are the key checks for bleeding and worsening stroke." },
      { id: "t5", step: "Take Action", kind: "multi", stem: "Tenecteplase 20 mg IV was given at 11:00, and the client is waiting in the emergency department for the thrombectomy team. Review the flow sheet. At 12:00 the client reports a severe headache and has vomited once. Select all actions the nurse should take now.",
        table: { cols: ["Time", "BP (mm Hg)", "HR", "NIHSS", "Comments"],
          rows: [
            ["10:52", "178/98", "104", "14", "After labetalol 10 mg IV"],
            ["11:00", "176/96", "102", "14", "Tenecteplase bolus given"],
            ["11:15", "170/94", "98", "11", "—"],
            ["11:30", "168/92", "96", "10", "Speaking more words"],
            ["11:45", "174/100", "98", "10", "—"],
            ["12:00", "194/108", "106", "16", "Severe headache; vomited once"] ] },
        options: [["a", "Notify the stroke provider immediately"], ["b", "Prepare the client for a STAT noncontrast CT of the head"], ["c", "Draw STAT CBC, PT/INR, aPTT, fibrinogen and type and crossmatch"], ["d", "Treat the BP per protocol to keep it below 180/105 mm Hg"],
          ["e", "Give aspirin 325 mg for the headache"], ["f", "Continue neuro checks on the routine hourly schedule"], ["g", "Give an antiemetic and reassess in 1 hour before calling"]],
        answer: ["a", "b", "c", "d"],
        rationale: "A new severe headache, vomiting, a BP surge and an NIHSS that jumps from 10 to 16 after thrombolysis mean brain hemorrhage until a CT proves otherwise. Notify the provider, get an emergency CT, send the labs needed to reverse a bleed, and bring the BP back under 180/105. Aspirin adds bleeding risk and is not given within 24 hours of thrombolysis. Neuro checks are due every 15 minutes in the first 2 hours, and any decline needs action now, not in 1 hour." },
      { id: "t6", step: "Evaluate Outcomes", kind: "matrix", stem: "The 12:05 CT showed no bleeding, and the client had a mechanical thrombectomy that reopened the artery. Twenty-four hours later: for each finding, mark whether the client has improved, not changed, or declined.", cols: ["Improved", "No change", "Declined"],
        rows: [
          ["e1", "NIHSS 4 (was 16)", "Improved"],
          ["e2", "Right arm lifts and holds for 10 seconds", "Improved"],
          ["e3", "Speaks in short sentences with some word-finding pauses", "Improved"],
          ["e4", "BP 156/84 mm Hg", "Improved"],
          ["e5", "Still in atrial fibrillation", "No change"],
          ["e6", "New firm, 6 cm swelling at the right groin puncture site", "Declined"] ],
        rationale: "The lower NIHSS, stronger arm, better speech and a BP within the post-thrombolysis limit show a good response. The heart rhythm is unchanged, and he will need long-term stroke prevention for it, which the team will plan. A new firm swelling at the groin access site suggests a hematoma. Apply firm manual pressure just above the puncture site, check distal pulses and notify the provider; back or flank pain with falling BP would suggest a retroperitoneal bleed." },
    ],
  },
];
