// Content ported from the USRN Pathway web app. Edit text here; screens read from these constants.
import { isoOffset } from "../util";

export const PHASES = [
  { id: "cred", n: 1, title: "Credentials Evaluation", sub: "CGFNS / TruMerit CES report", cost: [350, 600], time: "8–16 weeks",
    steps: ["Create a TruMerit (CGFNS) account and choose the CES report your board accepts", "Have your nursing school send transcripts directly to TruMerit", "Request license verification from your home nursing council", "Receive the CES report and confirm it was forwarded to your board"] },
  { id: "att", n: 2, title: "State Board Eligibility", sub: "Authorization to Test (ATT)", cost: [300, 550], time: "4–12 weeks",
    steps: ["Pick an exam state (compare them on the Boards tab)", "Submit the board application and fee", "Complete fingerprints / background check if the board requires it", "Register with Pearson VUE ($200) and receive your ATT"] },
  { id: "nclex", n: 3, title: "NCLEX-RN", sub: "Pearson VUE · Next Generation format", cost: [0, 150], time: "ATT window ≈ 90 days (varies by board)",
    steps: ["Schedule a test date inside your ATT window", "Complete all three benchmark exams on the NCLEX tab", "Sit the NCLEX-RN", "Receive results and your license number"] },
  { id: "eng", n: 4, title: "English Proficiency", sub: "IELTS Academic · PTE Academic · OET", cost: [200, 480], time: "Results in 2–14 days",
    steps: ["Confirm the minimum scores TruMerit accepts for VisaScreen", "Book the test and prepare", "Achieve the required scores", "Log the result date in the Vault (scores are valid 2 years for VisaScreen)"] },
  { id: "visa", n: 5, title: "VisaScreen", sub: "Healthcare worker certificate", cost: [540, 540], time: "6–12 weeks",
    steps: ["Submit the VisaScreen application to TruMerit", "Provide license verification and English scores", "Receive the VisaScreen certificate (valid 5 years)"] },
  { id: "imm", n: 6, title: "Immigration", sub: "EB-3 · I-140 · Consular interview", cost: [345, 900], time: "Driven by your priority date",
    steps: ["Sign an offer with a sponsoring employer (Schedule A occupation)", "Employer files the I-140 — your priority date is set", "Wait for your priority date to be current (Immigration tab)", "File DS-260, complete the medical exam, submit documents to NVC", "Take driving lessons and get your license at home before you travel (see Driving under More)", "Attend the consular interview, receive the immigrant visa, enter the U.S."] },
];

export const DOC_STYLE = {
  "Credentials": ["#4f46e5", "#8b5cf6", "GraduationCap"], "Licensure": ["#0891b2", "#10b981", "BadgeCheck"], "English test": ["#ea580c", "#f59e0b", "Languages"],
  "Immigration": ["#9333ea", "#db2777", "Plane"], "Identity": ["#0284c7", "#2563eb", "Fingerprint"], "Employment": ["#059669", "#65a30d", "Briefcase"], "Certifications": ["#e11d48", "#f97316", "HeartPulse"],
};

export const DOC_CATS = ["Credentials", "Licensure", "English test", "Immigration", "Identity", "Employment", "Certifications"];

export const SAMPLE_DOCS = [
  { id: "s1", title: "IELTS Academic Test Report Form", cat: "English test", file: "ielts_trf.pdf", issued: isoOffset(-686), expires: isoOffset(44), sample: true },
  { id: "s2", title: "Home-country RN license", cat: "Licensure", file: "rn_license_card.jpg", issued: isoOffset(-1000), expires: isoOffset(99), sample: true },
  { id: "s3", title: "BLS provider card", cat: "Certifications", file: "bls_ecard.pdf", issued: isoOffset(-738), expires: isoOffset(-8), sample: true },
  { id: "s4", title: "CGFNS CES Professional Report", cat: "Credentials", file: "ces_report.pdf", issued: isoOffset(-210), expires: "", sample: true },
  { id: "s5", title: "Passport", cat: "Identity", file: "passport_bio.jpg", issued: isoOffset(-900), expires: isoOffset(1650), sample: true },
];

export const BOARDS = [
  { st: "NY", name: "New York", ssn: false, ces: "CGFNS CES", fee: 143, weeks: "8–16", juris: false, nlc: "No", note: "Requires NY-approved infection control and child-abuse identification coursework." },
  { st: "IL", name: "Illinois", ssn: false, ces: "CGFNS CES, ERES", fee: 125, weeks: "6–10", juris: false, nlc: "No", note: "Popular first state; online application through IDFPR." },
  { st: "TX", name: "Texas", ssn: false, ces: "CGFNS CES", fee: 186, weeks: "4–8", juris: true, nlc: "Yes", note: "Texas Nursing Jurisprudence Exam required before ATT." },
  { st: "MT", name: "Montana", ssn: false, ces: "CGFNS CES", fee: 100, weeks: "4–8", juris: false, nlc: "Yes", note: "Known for shorter processing; check current queue." },
  { st: "NM", name: "New Mexico", ssn: false, ces: "CGFNS CES", fee: 150, weeks: "6–10", juris: false, nlc: "Yes", note: "Compact state; residency rules decide multistate eligibility." },
  { st: "FL", name: "Florida", ssn: true, ces: "CGFNS CES", fee: 110, weeks: "6–12", juris: false, nlc: "Yes", note: "SSN or approved alternative typically requested on application." },
  { st: "CA", name: "California", ssn: true, ces: "Board review of transcripts", fee: 300, weeks: "12–24", juris: false, nlc: "No", note: "Detailed course-by-course review; theory/clinical gaps are common." },
  { st: "WA", name: "Washington", ssn: false, ces: "CGFNS CES", fee: 125, weeks: "8–14", juris: false, nlc: "Verify", note: "Compact status has been changing; confirm before relying on it." },
];

export const ENDORSE = {
  CA: { compact: false, fee: "≈ $350", time: "8–16 weeks", hours: "No minimum practice hours for endorsement", extra: ["Apply through BreEZe online", "Live Scan fingerprints (hard cards if outside CA)"] },
  WA: { compact: null, fee: "≈ $125", time: "6–12 weeks", hours: "Recent practice may be reviewed if licensed > 3 years without working", extra: ["Fingerprint-based background check", "Confirm current compact status with the WA Nursing Commission"] },
  TX: { compact: true, fee: "≈ $186", time: "2–6 weeks", hours: "No minimum hours; practice history reviewed", extra: ["Pass the Texas Nursing Jurisprudence Exam", "Fingerprints through the IdentoGO vendor"] },
  NY: { compact: false, fee: "≈ $143", time: "6–12 weeks", hours: "No minimum hours", extra: ["NY infection control & child-abuse identification coursework", "Verification form completed by original state"] },
  FL: { compact: true, fee: "≈ $110", time: "4–8 weeks", hours: "No minimum hours", extra: ["Electronic fingerprints via a Livescan vendor", "Florida-required CE courses (e.g., medical errors, domestic violence)"] },
  IL: { compact: false, fee: "≈ $50", time: "4–8 weeks", hours: "No minimum hours", extra: ["Fingerprints for out-of-state applicants", "Implicit-bias and sexual-harassment prevention CE at renewal"] },
  MT: { compact: true, fee: "≈ $100", time: "2–6 weeks", hours: "No minimum hours", extra: ["Fingerprint background check"] },
  NM: { compact: true, fee: "≈ $150", time: "3–8 weeks", hours: "No minimum hours", extra: ["Fingerprint background check"] },
};

export const DIAG = [
  { id: "d1", cat: "Management of Care", stem: "The nurse receives handoff on four clients. Which client should the nurse assess first?", answer: "b",
    options: [
      { id: "a", text: "Client with COPD whose SpO₂ is 89% on 2 L nasal cannula", why: "88–92% is often the ordered target range in COPD. This is expected, not urgent." },
      { id: "b", text: "Client 12 hours after thyroidectomy reporting tingling around the mouth", why: "Circumoral tingling signals hypocalcemia from parathyroid injury. It can progress to tetany and laryngospasm — an airway threat." },
      { id: "c", text: "Client with type 2 diabetes with a pre-lunch glucose of 182 mg/dL", why: "Elevated but stable. Treat per sliding scale after the unstable client." },
      { id: "d", text: "Client on post-op day 2 rating incisional pain 5/10", why: "Pain needs follow-up but is expected and not life-threatening." } ],
    takeaway: "Unexpected findings that threaten airway, breathing or circulation outrank expected findings, even ones with abnormal numbers." },
  { id: "d2", cat: "Safety & Infection Control", stem: "A client is diagnosed with Clostridioides difficile. Which action is most important for preventing transmission?", answer: "c",
    options: [
      { id: "a", text: "Place the client in a negative-pressure room", why: "Negative pressure is for airborne pathogens such as TB or measles." },
      { id: "b", text: "Use alcohol-based hand rub after leaving the room", why: "Alcohol does not kill C. difficile spores." },
      { id: "c", text: "Use contact precautions and wash hands with soap and water", why: "Contact precautions plus mechanical removal of spores with soap and water is the standard." },
      { id: "d", text: "Wear an N95 respirator during care", why: "C. difficile spreads by the fecal-oral route, not the air." } ],
    takeaway: "Spore-forming organisms (C. diff) need soap and water and a bleach-based (sporicidal) cleaner." },
  { id: "d3", cat: "Management of Care", stem: "Which task can the RN delegate to unlicensed assistive personnel (UAP)?", answer: "d",
    options: [
      { id: "a", text: "Admission assessment of a newly transferred client", why: "Initial assessment is an RN responsibility and cannot be delegated." },
      { id: "b", text: "Teaching a client how to use an incentive spirometer", why: "Initial teaching requires RN judgment." },
      { id: "c", text: "Evaluating a client's response to IV morphine", why: "Evaluating a medication response is assessment." },
      { id: "d", text: "Measuring vital signs of a stable client on post-op day 3", why: "Routine data collection on a stable, predictable client is within UAP scope." } ],
    takeaway: "Remember: Assess, Teach, Evaluate and unstable clients stay with the RN." },
  { id: "d4", cat: "Pharmacological Therapies", stem: "Before giving digoxin 0.125 mg, the nurse finds an apical pulse of 52/min. What should the nurse do?", answer: "a",
    options: [
      { id: "a", text: "Hold the dose and notify the provider", why: "Most protocols hold digoxin for apical HR < 60 in adults; bradycardia may signal toxicity." },
      { id: "b", text: "Give the dose and recheck the pulse in an hour", why: "Giving it could worsen bradycardia or heart block." },
      { id: "c", text: "Give half the dose", why: "Nurses do not change the prescribed dose." },
      { id: "d", text: "Check a radial pulse and give if it is above 60", why: "The apical pulse is the accurate measurement for digoxin." } ],
    takeaway: "Digoxin: count the apical pulse for a full minute. Also watch potassium — hypokalemia raises toxicity risk." },
  { id: "d5", cat: "Reduction of Risk Potential", stem: "A client's potassium is 6.4 mEq/L and the ECG shows peaked T waves. What is the priority action?", answer: "b",
    options: [
      { id: "a", text: "Encourage foods high in potassium", why: "This would make hyperkalemia worse." },
      { id: "b", text: "Place the client on continuous cardiac monitoring", why: "ECG changes mean dysrhythmia risk. Monitoring comes first while treatment (calcium gluconate, insulin/dextrose) is ordered." },
      { id: "c", text: "Repeat the potassium level in the morning", why: "Delays care for a dangerous value with ECG changes." },
      { id: "d", text: "Give the scheduled lisinopril", why: "ACE inhibitors raise potassium." } ],
    takeaway: "Hyperkalemia with ECG changes is an emergency. Monitor, then expect calcium to stabilize the myocardium." },
  { id: "d6", cat: "Psychosocial Integrity", stem: "A client with depression says, \"I won't be a burden to anyone much longer.\" What is the nurse's best response?", answer: "c",
    options: [
      { id: "a", text: "\"You're not a burden. Your family loves you.\"", why: "False reassurance dismisses the statement and closes the conversation." },
      { id: "b", text: "\"Let's talk about your discharge plans.\"", why: "Changes the subject and misses a warning sign." },
      { id: "c", text: "\"Are you thinking about killing yourself?\"", why: "Asking directly is the standard. It does not plant the idea and lets you assess risk." },
      { id: "d", text: "\"Why do you feel that way?\"", why: "\"Why\" questions put clients on the defensive." } ],
    takeaway: "Ask directly about suicidal thoughts, then assess plan, means and intent." },
  { id: "d7", cat: "Health Promotion & Maintenance", stem: "A pregnant client who is Rh-negative asks when she will receive Rho(D) immune globulin. What does the nurse tell her?", answer: "a",
    options: [
      { id: "a", text: "Around 28 weeks, and again within 72 hours after birth if the baby is Rh-positive", why: "This is the standard prophylaxis schedule." },
      { id: "b", text: "Only if the baby is Rh-negative", why: "Sensitization happens when the baby is Rh-positive." },
      { id: "c", text: "At the first prenatal visit only", why: "The routine antepartum dose is at about 28 weeks." },
      { id: "d", text: "It is not needed for a first pregnancy", why: "Prophylaxis protects future pregnancies, so it is given in the first one too." } ],
    takeaway: "RhoGAM: 28 weeks, within 72 hours postpartum, and after any bleeding event or invasive procedure." },
  { id: "d8", cat: "Basic Care & Comfort", stem: "A client is receiving continuous enteral feeding through a nasogastric tube. Which action reduces aspiration risk?", answer: "d",
    options: [
      { id: "a", text: "Keep the client flat to promote gastric emptying", why: "Lying flat increases reflux and aspiration." },
      { id: "b", text: "Check placement only at the start of each shift", why: "Placement is verified before feeding and per protocol, and after any coughing or vomiting." },
      { id: "c", text: "Increase the rate to finish the feeding faster", why: "Faster rates raise residual volume and aspiration risk." },
      { id: "d", text: "Keep the head of the bed elevated at least 30–45°", why: "Elevation is the key positional prevention for aspiration." } ],
    takeaway: "HOB ≥ 30° during feeding and for 30–60 minutes after an intermittent feed." },
];

export const CAT_POOL = [
  { id: "c1", d: 1, cat: "Safety", stem: "Which client has the highest fall risk?", answer: "a", options: [
    { id: "a", text: "78-year-old started on a diuretic, up to the bathroom at night", why: "Age, nocturia and new diuretic combine to raise fall risk." },
    { id: "b", text: "30-year-old ambulating after appendectomy", why: "Young and mobile; low risk." },
    { id: "c", text: "45-year-old admitted with migraine, pain controlled", why: "Lower risk than the older client with nocturia." },
    { id: "d", text: "60-year-old with stable angina on bed rest", why: "Lower risk while following activity orders." } ], takeaway: "Combine factors: age, toileting urgency, new meds, and night-time." },
  { id: "c2", d: 1, cat: "Pharmacology", stem: "A client takes warfarin. Which lab value does the nurse monitor?", answer: "c", options: [
    { id: "a", text: "aPTT", why: "aPTT monitors unfractionated heparin." },
    { id: "b", text: "Platelet count", why: "Useful for heparin-induced thrombocytopenia, not warfarin dosing." },
    { id: "c", text: "INR", why: "Warfarin is dosed to an INR goal, commonly 2–3." },
    { id: "d", text: "Fibrinogen", why: "Not used for warfarin monitoring." } ], takeaway: "Warfarin → INR, antidote vitamin K. Heparin → aPTT, antidote protamine." },
  { id: "c3", d: 1, cat: "Pharmacology", stem: "A client receives insulin lispro at 07:30. When should breakfast be served?", answer: "b", options: [
    { id: "a", text: "Within 2 hours", why: "Lispro onset is about 15 minutes; waiting risks hypoglycemia." },
    { id: "b", text: "Within 15 minutes", why: "Rapid-acting insulin is timed to the meal." },
    { id: "c", text: "At lunch", why: "Far too late." },
    { id: "d", text: "Meal timing does not matter", why: "It matters for rapid-acting insulin." } ], takeaway: "Rapid-acting (lispro, aspart): eat within 15 minutes." },
  { id: "c4", d: 2, cat: "Pharmacology", stem: "A client on a heparin infusion has an aPTT of 112 seconds (therapeutic 60–80). What is the priority action?", answer: "b", options: [
    { id: "a", text: "Increase the infusion rate", why: "The value is already above range." },
    { id: "b", text: "Stop or adjust the infusion per protocol and notify the provider", why: "Supratherapeutic aPTT increases bleeding risk." },
    { id: "c", text: "Give vitamin K", why: "Vitamin K reverses warfarin, not heparin." },
    { id: "d", text: "Recheck in 24 hours", why: "Too long to wait with bleeding risk." } ], takeaway: "Follow the heparin nomogram; assess for bleeding." },
  { id: "c5", d: 2, cat: "Physiological Adaptation", stem: "A client in DKA on an insulin infusion has a potassium of 3.1 mEq/L. What does the nurse anticipate?", answer: "c", options: [
    { id: "a", text: "Increasing the insulin infusion", why: "Insulin moves potassium into cells and would worsen hypokalemia." },
    { id: "b", text: "Giving sodium bicarbonate", why: "Not indicated for this finding." },
    { id: "c", text: "Holding insulin until potassium is replaced", why: "With K⁺ < 3.5, insulin is held and potassium replaced to prevent dysrhythmias." },
    { id: "d", text: "Restricting fluids", why: "DKA requires aggressive fluid replacement." } ], takeaway: "In DKA, check potassium before and during insulin therapy." },
  { id: "c6", d: 2, cat: "Pharmacology", stem: "A client on lithium has vomiting, coarse tremor and a level of 2.0 mEq/L. What should the nurse do?", answer: "a", options: [
    { id: "a", text: "Hold the next dose and notify the provider", why: "These are signs of toxicity; therapeutic is roughly 0.6–1.2." },
    { id: "b", text: "Give the dose with food", why: "Does not address toxicity." },
    { id: "c", text: "Encourage a low-sodium diet", why: "Low sodium raises lithium levels." },
    { id: "d", text: "Document as expected side effects", why: "These are not expected at this level." } ], takeaway: "Lithium: narrow therapeutic range; keep sodium and fluids steady." },
  { id: "c7", d: 2, cat: "Reduction of Risk", stem: "A chest tube drainage system shows continuous bubbling in the water-seal chamber. What does the nurse do first?", answer: "d", options: [
    { id: "a", text: "Clamp the tube for 24 hours", why: "Prolonged clamping can cause tension pneumothorax." },
    { id: "b", text: "Document it as expected", why: "Continuous bubbling means an air leak." },
    { id: "c", text: "Remove the dressing", why: "Not a first action." },
    { id: "d", text: "Check the system for a leak from the insertion site to the chamber", why: "Find and correct the leak; notify the provider if it persists." } ], takeaway: "Tidaling = expected. Continuous bubbling in water seal = leak." },
  { id: "c8", d: 3, cat: "Physiological Adaptation", stem: "A client 2 hours after ischemic stroke onset is a candidate for thrombolytics. BP is 196/104. What is the priority?", answer: "b", options: [
    { id: "a", text: "Give alteplase immediately", why: "BP must be below 185/110 before thrombolytics." },
    { id: "b", text: "Give the prescribed antihypertensive to bring BP below 185/110", why: "This is the eligibility threshold that reduces hemorrhage risk." },
    { id: "c", text: "Lower BP to below 120/80", why: "Too aggressive; may extend the infarct." },
    { id: "d", text: "Wait for BP to fall on its own", why: "Delays time-sensitive treatment." } ], takeaway: "Pre-thrombolytic BP < 185/110; after, keep < 180/105." },
  { id: "c9", d: 3, cat: "Physiological Adaptation", stem: "Which set of findings suggests rising intracranial pressure?", answer: "c", options: [
    { id: "a", text: "BP 104/70, HR 118, RR 22", why: "Looks like shock, not ICP." },
    { id: "b", text: "BP 130/80, HR 80, RR 16", why: "Normal findings." },
    { id: "c", text: "BP 178/62, HR 50, irregular respirations", why: "Widening pulse pressure, bradycardia, irregular breathing = Cushing's triad, a late sign." },
    { id: "d", text: "BP 90/60, HR 60, RR 12", why: "Not the ICP pattern." } ], takeaway: "Cushing's triad is late. Earlier sign: change in level of consciousness." },
  { id: "c10", d: 3, cat: "Pharmacology", stem: "A client on magnesium sulfate for preeclampsia has RR 10/min and absent deep tendon reflexes. What is the first action?", answer: "a", options: [
    { id: "a", text: "Stop the magnesium infusion", why: "These are toxicity signs; stopping the source comes first, then calcium gluconate as prescribed." },
    { id: "b", text: "Increase the infusion", why: "Would worsen toxicity." },
    { id: "c", text: "Recheck reflexes in 1 hour", why: "Delays treatment of respiratory depression." },
    { id: "d", text: "Give oxytocin", why: "Not related to magnesium toxicity." } ], takeaway: "Magnesium toxicity: RR < 12, absent DTRs, low urine output. Antidote: calcium gluconate." },
  { id: "c11", d: 3, cat: "Physiological Adaptation", stem: "After a chest injury, a client has tracheal deviation to the left, absent breath sounds on the right and BP 78/40. What does the nurse prepare for?", answer: "d", options: [
    { id: "a", text: "Chest X-ray before any treatment", why: "Tension pneumothorax is a clinical diagnosis; imaging delays care." },
    { id: "b", text: "Albuterol nebulizer", why: "Not a bronchospasm problem." },
    { id: "c", text: "Placing the client flat", why: "Does not relieve the tension." },
    { id: "d", text: "Needle decompression on the right side", why: "Relieves pressure on the mediastinum, then chest tube." } ], takeaway: "Trachea shifts away from the tension pneumothorax." },
  { id: "c12", d: 2, cat: "Health Promotion", stem: "A client taking metformin is scheduled for a CT with iodinated contrast. What does the nurse expect?", answer: "c", options: [
    { id: "a", text: "Double the dose the day before", why: "Never adjust doses this way." },
    { id: "b", text: "No change is needed", why: "Contrast plus metformin can raise lactic acidosis risk." },
    { id: "c", text: "Hold metformin per protocol and check kidney function before restarting", why: "Commonly held at the time of or before contrast and resumed after renal function is confirmed." },
    { id: "d", text: "Switch to insulin permanently", why: "Not indicated." } ], takeaway: "Metformin + contrast: hold, check creatinine/eGFR, resume per protocol." },
];

// Built-in fallback. The live copy is data/visa-bulletin.json (downloaded by src/bulletin.js).
export const BULLETIN = {
  month: "2026-10",
  checked: "2026-10-08",
  label: "October 2026 Visa Bulletin · EB-3 Skilled Workers & Professionals",
  rows: [
    { key: "row", name: "All Chargeability", fa: "2024-05-15", dff: "2024-08-01", alert: "Final Action retrogressed vs. September", tone: "crit", rate: 8 },
    { key: "ph", name: "Philippines", fa: "2023-08-15", dff: "2024-01-01", alert: "DOS warned of possible retrogression late FY26", tone: "warn", rate: 8 },
    { key: "in", name: "India", fa: "2014-01-01", dff: "2015-01-15", alert: "Slow movement; long backlog", tone: "warn", rate: 3 },
    { key: "cn", name: "China (mainland born)", fa: "2022-01-08", dff: "2024-04-01", alert: "Advanced at start of FY27", tone: "ok", rate: 6 },
  ],
};

// Bedside lessons live in src/data/bedside.js.
export { LESSONS } from "./bedside";

export const ACUITY = [
  { k: "pressors", label: "Titrating vasopressors", w: 3 }, { k: "crrt", label: "CRRT", w: 3 }, { k: "neuro", label: "q1h neuro checks", w: 2 },
  { k: "insulin", label: "Insulin infusion", w: 2 }, { k: "sitter", label: "Restraints / 1:1 safety", w: 2 }, { k: "total", label: "Total care / bariatric", w: 2 },
  { k: "fall", label: "High fall risk", w: 1 }, { k: "iso", label: "Isolation", w: 1 }, { k: "admit", label: "Admission", w: 1 }, { k: "dc", label: "Discharge", w: 1 },
];

export const SAMPLE_PTS = [
  { id: "p1", room: "301", flags: { pressors: true, neuro: true } }, { id: "p2", room: "302", flags: { crrt: true, total: true } },
  { id: "p3", room: "303", flags: { insulin: true, fall: true } }, { id: "p4", room: "304", flags: { iso: true } },
  { id: "p5", room: "305", flags: { admit: true, fall: true } }, { id: "p6", room: "306", flags: { sitter: true } },
  { id: "p7", room: "307", flags: { dc: true } }, { id: "p8", room: "308", flags: { neuro: true, fall: true } },
];

export const CAREERS = [
  { id: "ccrn", title: "CCRN (adult critical care)", items: ["Hold an unencumbered U.S. RN license", "Practice hours: 1,750 hrs direct care of acutely/critically ill patients in the past 2 years (875 in the most recent year), or 2,000 hrs in 5 years with 144 in the most recent year", "Review the AACN exam blueprint (cardiovascular and pulmonary are the largest sections)", "Take 2 full practice exams", "Ask your hospital about exam-fee reimbursement and certification pay"] },
  { id: "crna", title: "CRNA school prerequisites", items: ["BSN (or related bachelor's) with strong science GPA", "At least 1 year full-time critical care RN experience (most competitive applicants have 2+ in ICU)", "CCRN certification", "Graduate chemistry or statistics if the program requires it", "Shadow a CRNA and gather letters of recommendation", "Plan for a doctoral program (DNP/DNAP is now the entry degree)"] },
  { id: "edu", title: "Nurse educator", items: ["Precept new graduates and log preceptor hours", "Join the unit education council", "Complete an MSN in nursing education", "Earn the NLN CNE (academic) or NPD-BC (hospital professional development)"] },
  { id: "ur", title: "Utilization review / insurance roles", items: ["3+ years acute care, often with case management exposure", "Learn InterQual or MCG criteria", "Understand inpatient vs. observation status rules", "Consider CCM or ACM certification", "Remote roles usually require a compact (multistate) license"] },
];
LESSONS.push({ id: "license", title: "Protect your license", mins: 6, body: [
    ["Whose lawyer is it?", "Your hospital's liability coverage is built around defending the hospital. It usually covers lawsuits from your work, but it generally won't pay a lawyer to represent only you before the Board of Nursing, where your license is decided. That is the main reason to carry your own policy."],
    ["Chart like it will be read aloud", "Notes written during or right after care carry the most weight. Quote patients' exact words for refusals, threats and self-reported ingestions. Time-stamp every call, page and escalation."],
    ["Keep the chart clinical", "The medical record is for the patient's care. Staffing problems, late pharmacy deliveries and conflicts with colleagues go in the incident reporting system, and the chart never mentions that a report was filed."],
    ["Lines you never cross", "Never pre-chart, never document care you didn't give, and never copy forward an assessment you didn't repeat. Each one can be treated as falsification."] ],
    check: { q: "The unit is short-staffed and your 14:00 reassessment happens at 15:10. What goes in the chart?", opts: ["\"Reassessment delayed due to short staffing\"", "The reassessment findings, timed 15:10 — and the staffing issue goes in an incident report", "Chart the reassessment at 14:00 since that's when it was due"], a: 1 } });

export const CREDIT = [
  "Get your SSN and open a U.S. checking account with direct deposit",
  "Open a secured credit card ($200–$500 deposit) and put one small recurring bill on it",
  "Set autopay for the full statement balance — never pay interest",
  "Keep reported utilization under 10% of your limit",
  "After 6–12 months of on-time payments, ask to graduate to an unsecured card",
  "Add a second card or a credit-builder loan to build a mix (optional)",
  "Pull your free reports at annualcreditreport.com and dispute errors",
  "Target 720+ before applying for an auto loan or mortgage",
];

// NGN case studies live in src/data/ngn.js.

export const DIFF = { 1: -1, 2: 0, 3: 1 };

export const PHASE_COLORS = ["#0891b2", "#4f46e5", "#ea580c", "#db2777", "#9333ea", "#059669"];

export const LEVELS = [[0, "Applicant"], [250, "Candidate"], [600, "NCLEX Ready"], [1000, "Licensed RN"], [1500, "Bedside Pro"], [2200, "Charge RN"], [3000, "Nurse Leader"]];

export const LICENSE_DOS = [
  ["Carry your own liability policy", "Your employer's coverage is built around the hospital's defense. An individual policy pays for a lawyer whose only client is you, including before the Board of Nursing, where your license is at stake."],
  ["Chart in real time", "Write notes during or right after care, not in a batch at shift change. Late entries are allowed, but label them as late with the actual time of the event."],
  ["Quote patients word for word", "For refusals, threats or self-reported ingestions, record the exact words: Pt states: \"I took three white tablets before arrival.\""],
  ["Document every escalation", "If a provider doesn't respond to worsening data, record each time, who you contacted, what you reported, what they said, and who you escalated to next (charge nurse, supervisor, rapid response, attending)."],
  ["Hold and clarify unsafe orders", "If an order conflicts with protocol, dose limits or patient safety, hold it, call the prescriber, involve pharmacy or your chain of command if needed, and chart the objective reasons."],
];

export const LICENSE_DONTS = [
  ["Never pre-chart or falsify", "Documenting an assessment, vital sign or medication before it happens is falsification of a medical record, and Boards treat it as grounds for discipline."],
  ["Keep staffing complaints out of the chart", "\"Short-staffed, care delayed\" or \"pharmacy late again\" belongs in the hospital's incident reporting system, not the medical record. Don't mention in the chart that an incident report was filed. Protections for incident reports vary by state."],
  ["Drop labels", "\"Combative\", \"uncooperative\", \"drunk\" and \"drug-seeking\" read as bias. Describe what you saw and heard instead: actions, measurements, quotes."],
  ["Never copy forward blindly", "Copying yesterday's assessment into today's note creates contradictions that are easy to expose under cross-examination. Reassess, then document what you actually found."],
];

export const INSURERS = [
  { name: "NSO", full: "Nurses Service Organization", who: "Administered by Aon; underwritten by American Casualty Co. of Reading, PA (a CNA company)",
    limits: "Up to $1M per claim / $6M aggregate", board: "Up to $25,000 license protection", depo: "Up to $10,000", note: "The best-known individual RN program; often offered through nursing associations.", url: "https://www.nso.com" },
  { name: "CM&F Group", full: "CM&F Group", who: "Broker; carrier not named on its RN page",
    limits: "Up to $1M per claim / $6M aggregate", board: "Up to $35,000 per claim / $100,000 aggregate", depo: "Up to $25,000", note: "Occurrence coverage on all products, per its site.", url: "https://www.cmfgroup.com" },
  { name: "Proliability", full: "Proliability by Mercer", who: "Administered by Mercer; carrier depends on the plan",
    limits: "Varies by plan — see your quote", board: "Included on many plans", depo: "Check your quote", note: "Defense costs paid outside the policy limit on most plans.", url: "https://www.proliability.com" },
  { name: "HPSO", full: "Healthcare Providers Service Organization", who: "Sister program to NSO (Aon / CNA)",
    limits: "Varies by profession", board: "Varies by profession", depo: "Varies by profession", note: "Aimed at allied health and advanced practice. Staff RNs usually buy through NSO.", url: "https://www.hpso.com" },
];

export const CHART_CASES = [
  { id: "a", title: "Patient asking for pain medication often", icon: "Pill",
    bad: "Patient exhibiting drug-seeking behavior. Demanding IV Dilaudid constantly while sleeping between doses.",
    good: "10:10 Patient states pain is 9/10 in mid-epigastrium: \"I need my IV medication right now.\" BP 132/78, HR 80, RR 14, SpO₂ 99% on room air. Lying supine, grimacing on palpation. Informed patient last IV hydromorphone was given at 09:00; next dose due 12:00. Offered oral acetaminophen and repositioning; patient declined oral medication. Primary team notified of unrelieved pain at 10:15. Will reassess at 10:45.",
    why: ["Replaces the label \"drug-seeking\" with the patient's own words and pain score", "Vital signs and observed behavior are objective and timed", "Shows the timing of the last dose, what was offered, and who was told", "A reassessment time shows follow-through"] },
  { id: "b", title: "Provider not responding to instability", icon: "PhoneOff",
    bad: "Called Dr. Smith because patient is coding. Dr. Smith refused to come down to evaluate.",
    good: "02:15 BP decreased from 110/68 to 82/44 (MAP 56), HR 122 sinus tachycardia. Patient alert, oriented ×4, diaphoretic. No urine output in prior 2 hours. 02:18 SBAR given by phone to Dr. Smith; verbal order for 500 mL NS bolus, read back and confirmed. 02:45 post-bolus BP 80/42 (MAP 54). 02:46 paged Dr. Smith; no response by 02:58. 03:00 notified charge nurse and called rapid response team.",
    why: ["\"Coding\" was inaccurate — the patient was alert with a pulse", "Every call, page and silence has a time stamp", "Records the order and read-back, then the measured response", "Shows escalation up the chain of command instead of blame"] },
  { id: "c", title: "Patient leaving against medical advice", icon: "DoorOpen",
    bad: "Patient angry, noncompliant, ripped out their IV line, and stormed out AMA.",
    good: "16:30 Patient dressing in street clothes, stating: \"I am not staying in this hospital another minute.\" 16:32 Dr. Lee notified; at bedside 16:38 and discussed risks of leaving before completing IV antibiotics, including recurrent bacteremia, septic shock and death. Nurse reinforced these risks. Patient stated: \"I understand, but I am going.\" Left cephalic PIV removed intact, catheter tip intact, pressure dressing applied, no bleeding. AMA form presented; patient declined to sign: \"I'm not signing anything.\" Discharge instructions offered. 16:42 escorted by wheelchair to elevator lobby; stood and walked with steady gait.",
    why: ["Quotes show the decision was the patient's own, informed one", "Records that the provider was notified and explained the risks", "IV removal is described as a nursing action, not \"ripped out\"", "Ends with what the nurse actually observed, at a time"] },
];

export const RATES = [10, 12, 22, 24, 32, 35];

export const HEALTH_TERMS = [
  ["Premium", "What you pay every paycheck to have the plan, even if you never see a doctor."],
  ["Deductible", "What you pay for care each year before the plan starts sharing costs."],
  ["Copay / coinsurance", "Your share after the deductible: a flat fee (copay) or a percentage (coinsurance)."],
  ["Out-of-pocket max", "The most you pay for covered in-network care in a year. After that, the plan pays 100%."],
];

export const PLAN_FIELDS = [["prem", "Your premium $/mo"], ["ded", "Deductible $"], ["co", "Coinsurance %"], ["oop", "Out-of-pocket max $"], ["hsa", "Employer HSA $/yr"]];

export const INSURE_LIST = ["Know the date my health coverage starts", "Chose a health plan within the new-hire window", "Saved my insurance card and the plan's nurse line in my phone", "Added my spouse / children (or know the deadline to add them)", "Checked my employer group life amount and named beneficiaries", "Got a quote for individual term life insurance", "Enrolled in short- and long-term disability if offered", "Know how to report a work injury for workers' compensation", "Have car insurance above state minimums, with uninsured motorist coverage", "Have renters or homeowners insurance for where I live"];

export const AUTO_COVER = [
  ["Liability", "Required", "Pays for injuries and damage you cause to others. State minimums are often very low — many advisors suggest 100/300/100 ($100k per person, $300k per accident, $100k property).", "crit"],
  ["Uninsured / underinsured motorist", "Strongly advised", "Pays your costs when the other driver has no insurance or too little.", "warn"],
  ["Collision", "Required with a car loan", "Repairs your car after a crash, whoever is at fault.", "indigo"],
  ["Comprehensive", "Required with a car loan", "Theft, hail, flood, fire, hitting a deer.", "indigo"],
  ["PIP / MedPay", "Required in some states", "Medical bills for you and your passengers, regardless of fault.", "teal"],
  ["Gap insurance", "Consider for new cars", "Pays the difference if your car is totaled and you owe more on the loan than it's worth.", "teal"],
];

export const DRIVE_WHY = [
  ["Car", "Most commutes need a car", "Outside a few big cities, U.S. and Canadian public transit is limited. Hospitals sit far from affordable housing, and buses rarely run when a 7 a.m. shift starts or a 7 p.m. shift ends."],
  ["Users", "Family and friends are busy", "People in the diaspora usually work long hours or several jobs. Even willing relatives rarely have the time for weeks of lessons after you arrive."],
  ["ShieldAlert", "Lending a car carries risk", "In most places, insurance follows the car. If you crash someone's car, their insurance pays, their premiums can rise, and they can be sued. Many people are afraid to let a new driver practice in theirs."],
  ["TrafficCone", "The roads are fast and busy", "Six-lane highways, high speeds and heavy traffic are a hard place to learn from zero. Learning the basics at home first lets you focus on local rules once you arrive."],
  ["Moon", "Night shifts end when you're exhausted", "A tired drive home is not the moment to still be learning car control. Driving should be automatic before you face it after 12 hours on the floor."],
  ["Wallet", "Rides add up fast", "Paying for rideshare twice a day takes a big share of a new nurse's pay, while you're also paying rent and sending money home."],
];

export const DRIVE_PREP = [
  "Enroll in an accredited driving school in your home country",
  "Pass your test and get a full (not learner) driving license",
  "Practice highway, night and rain driving with an instructor",
  "Get an International Driving Permit (IDP) — it's only issued in the country that issued your license",
  "Request an official driving record or letter of experience from your licensing authority",
  "Get a certified English translation of your license and driving record if needed",
  "If your country drives on the left, practice right-side driving in a simulator or with an instructor",
  "Look up your destination state's or province's rules for foreign licenses",
];

export const AEIRP_LIST = "https://www.cgfnsalliance.org/certification_process/view-certified-recruiters/";

export const SPONSORS = [
  { name: "Connetics USA", parent: "AMN Healthcare", model: "Direct hire", since: 2015, loc: "San Diego, CA",
    phones: [["(844) 847-2412", ""]], emails: ["connetics.info@amnhealthcare.com"], site: "https://www.conneticsusa.com/", contact: "https://conneticsusa.com/contact-us/",
    blurb: "Places nurses directly with U.S. hospitals, which sponsor the EB-3 green card." },
  { name: "O'Grady Peyton International", parent: "AMN Healthcare", model: "Staffing agency", since: 2010, loc: "",
    phones: [["(877) 686-7230", "U.S. & Canada"], ["+1 (912) 352-0684, option 4", "Outside U.S. & Canada"]], emails: ["Info@ogradypeyton.com"], site: "https://www.ogradypeyton.com/", contact: "https://www.ogradypeyton.com/contact-us/",
    blurb: "Agency employer with multi-year assignments at partner facilities. Longest-certified recruiter on the list." },
  { name: "WorldWide HealthStaff Solutions", parent: "", model: "Direct hire", since: 2019, loc: "Charlotte, NC",
    phones: [["(704) 496-9398", ""]], emails: ["info@healthstaff.org"], site: "https://candidate.healthstaff.org/", contact: "https://candidate.healthstaff.org/contact-us",
    blurb: "Direct placement with U.S. healthcare facilities." },
  { name: "PRS Global", parent: "", model: "Direct hire", since: 2024, loc: "",
    phones: [["+1 (800) 708-1507", ""]], emails: [], site: "https://www.prsglobal.com/", contact: "https://prsglobal.com/contact-us",
    blurb: "Describes its model as direct hire with U.S. employers." },
  { name: "Global Nurse Partners", parent: "", model: "Direct hire", since: 2021, loc: "Salem, MA",
    phones: [], emails: [], site: "https://www.globalnursepartners.com/", contact: "https://www.globalnursepartners.com/contact-us/",
    blurb: "Direct hire into permanent positions. Reach them through the contact form on their site." },
  { name: "MedPro International", parent: "", model: "Not stated", since: 2021, loc: "Sunrise, FL",
    phones: [["(954) 739-4247", ""], ["(800) 886-8108", "Toll-free"], ["+63 919 098 2576", "Philippines"]], emails: ["intlrecruitment@medprostaffing.com"], site: "https://www.medprointernational.com/", contact: "https://medprointernational.com/about/contact/",
    blurb: "International recruitment arm of MedPro. Ask how employment is structured." },
  { name: "PassportUSA", parent: "Health Carousel", model: "Staffing agency", since: 2020, loc: "Cincinnati, OH",
    phones: [["+1 (800) 592-1745", "Inquiries"], ["+632 5322 7689", "Philippines"]], emails: ["ppusarecruiters@healthcarousel.com", "ph.recruiter@passportusa.com"], site: "https://www.passportusa.com/", contact: "https://www.passportusa.com/contact-us",
    blurb: "Staffing agency that sponsors and places nurses with partner facilities.",
    record: [["In 2024, Health Carousel paid $9.25 million to resolve federal visa-fraud and False Claims Act allegations, without admitting liability.", "https://www.justice.gov/usao-sdoh/pr/cincinnati-healthcare-staffing-company-agrees-pay-925-million-resolve-visa-fraud"],
      ["Nurses filed a class action over a $20,000 early-departure fee (Carmen v. Health Carousel, S.D. Ohio), which was later settled.", "https://news.bloomberglaw.com/litigation/stay-or-pay-suits-cast-light-on-immigrant-nurse-recruiting"]] },
  { name: "Avant Healthcare Professionals", parent: "Jackson Healthcare", model: "Staffing agency", since: 2023, loc: "Maitland, FL",
    phones: [["+1 (407) 681-2999", ""], ["+1 (888) 681-2999", "Toll-free"], ["+63 917 508 1085", "Philippines"]], emails: [], site: "https://avanthealthcare.com/", contact: "https://avanthealthcare.com/about/contact-us/",
    blurb: "Staffing agency that sponsors and places nurses with partner facilities.",
    record: [["Nurses filed a class action over early-departure fees (Byron v. Avant, M.D. Fla.). In 2024 a magistrate judge recommended that some claims go forward.", "https://news.bloombergtax.com/payroll/nurses-should-advance-some-quitting-fee-claims-magistrate-says"]] },
];

export const JPTS = [[48, 150], [160, 96], [272, 146], [384, 82], [496, 142], [608, 88], [716, 132]];

export const JLABELS = ["Home", "Credentials", "ATT", "NCLEX", "English", "VisaScreen", "U.S. bedside"];

export const DUR = { cred: 3, att: 2, nclex: 2, eng: 1, visa: 2 };
