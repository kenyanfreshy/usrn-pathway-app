// Bedside clinical transition curriculum: 6 lessons, the SBAR builder scenarios and "Chart this, not that" flip cards.
// Content reflects common U.S. hospital practice (Joint Commission, TeamSTEPPS, NCSBN/ANA delegation guidance,
// HIPAA). Facility policy and each state's Nurse Practice Act always have the final word.

export const LESSONS = [
  /* 1 ------------------------------------------------------------ */
  {
    id: "sbar", icon: "PhoneCall", mins: 9,
    title: "SBAR and Closed-Loop Escalation",
    why: "In U.S. hospitals, the bedside nurse is expected to spot deterioration and ask for a specific action, not just pass on numbers. The Joint Commission repeatedly finds communication failures among the leading causes of serious harm. In many countries, nurses are taught to wait for the doctor's direction. Here, staying quiet when a patient is getting worse is treated as a failure to rescue, and you can be held accountable for it.",
    sections: [
      ["The SBAR Structure",
        "Situation (about 10 seconds): your name, unit, the patient, and the problem in one sentence.\nBackground: only what matters for this problem (diagnosis, relevant history, code status, recent changes).\nAssessment: objective data and the trend (\"BP fell from 128/76 to 92/58 over 2 hours\"), then what you think is happening.\nRecommendation: exactly what you need, such as \"come to the bedside within 15 minutes,\" a specific order, or a transfer. Never end with \"What do you want me to do?\""],
      ["Closed-Loop Communication",
        "Take verbal and phone orders only when policy allows (usually urgent situations). Write the order down, then read it back: drug, dose, route, frequency. Wait for \"That's correct.\"\nSpell sound-alike drugs letter by letter: hydralazine (blood pressure) vs. hydroxyzine (anxiety, itching).\nSay numbers digit by digit (\"fifteen, one-five\") and spell out units. Never use a trailing zero (write 5 mg, not 5.0 mg)."],
      ["Speaking Up: CUS and the Two-Challenge Rule",
        "From TeamSTEPPS: if a concern is dismissed, state it clearly at least twice. If it is still ignored, take stronger action and use the chain of command. CUS phrases signal urgency: \"I am Concerned… I am Uncomfortable… This is a Safety issue.\" Speaking up is part of the job, not a lack of respect."],
      ["Chain of Command",
        "Bedside RN → charge nurse → house supervisor → attending physician of record → medical director or chief nursing officer, per your facility's policy.\nYou never need permission to call the Rapid Response Team. Any nurse can call it at any time when a patient meets criteria or you are worried. Call a code immediately for an arrest."],
    ],
    scripts: [
      ["Phone SBAR: respiratory decline", "\"Dr. Patel, this is Grace, RN on 4 West, calling about Mr. Ruiz in room 12. His oxygen has dropped to 88% on 4 liters, up from 2 liters at noon. He's post-op day 1 from a hip replacement, full code. Respiratory rate 30, new crackles in both bases, heart rate 112. I'm concerned about fluid overload or a PE. I'd like you to evaluate him within 15 minutes, and I'm requesting a chest X-ray and an ABG.\""],
      ["Read-back", "\"I have: furosemide, F-U-R-O-S-E-M-I-D-E, 40 milligrams IV push now, one time. Is that correct?\""],
    ],
    dos: ["Have the chart, latest vitals, labs, meds and code status in front of you before you call", "Give trends, not just single numbers", "End with a clear request and a time frame", "Document the call: time, who, what you reported and the response"],
    donts: ["Don't call without having assessed the patient yourself", "Don't accept \"keep monitoring\" when the patient meets rapid response criteria", "Don't use vague words like \"a bit off\" or \"not looking good\"", "Don't skip read-back because the provider is in a hurry"],
    check: [
      { q: "Post-op day 1: RR 28, SpO₂ 88% on 2 L, new crackles in both bases. Which is the best SBAR recommendation?",
        opts: [
          ["\"What would you like me to do?\"", "This hands the decision back without a request. In the U.S. you are expected to recommend an action."],
          ["\"I'm concerned about fluid overload. Please evaluate him within 15 minutes; I'm also requesting a chest X-ray and a diuretic order.\"", "Correct. It names your concern and makes a specific, time-bound request."],
          ["\"Just letting you know his sats are a bit low.\"", "Vague and passive, with no data trend and no request. Providers may not treat this as urgent."],
          ["\"I'll keep watching him and call if it gets worse.\"", "He already meets criteria for escalation. Waiting delays rescue."] ],
        a: 1 },
      { q: "The provider says on the phone: \"Give hydralazine 10 mg IV now.\" What is the correct read-back?",
        opts: [
          ["\"Okay, got it.\"", "No read-back means no check that you heard the order correctly."],
          ["\"Hydroxyzine 10 mg IV now, correct?\"", "Wrong drug. Hydroxyzine is a sound-alike, which is why spelling it out matters."],
          ["\"Hydralazine, H-Y-D-R-A-L-A-Z-I-N-E, ten milligrams IV now. Is that correct?\"", "Correct. Drug spelled out, dose, route and timing read back, and the order confirmed."],
          ["\"Will do. Please enter it when you can.\"", "The order still has to be read back before you act on it."] ],
        a: 2 },
      { q: "You have voiced concern twice. SBP is 82 and the provider says, \"Recheck it in the morning.\" What do you do next?",
        opts: [
          ["Wait until morning as instructed", "The patient is unstable. Following an unsafe instruction does not protect the patient or your license."],
          ["Chart \"Dr. refused to come\"", "Blaming language in the chart does not help the patient. Escalate instead, then chart facts."],
          ["Notify the charge nurse and call the Rapid Response Team", "Correct. After two challenges, use the chain of command and call the RRT, which you can do at any time."],
          ["Call the same provider again in one hour", "This delays rescue. The concern has already been dismissed twice."] ],
        a: 2 },
    ],
  },

  /* 2 ------------------------------------------------------------ */
  {
    id: "ehr", icon: "FileText", mins: 9,
    title: "Defensive Documentation in the EHR (Epic / Cerner)",
    why: "The U.S. medical record is a legal document. In lawsuits and Board of Nursing investigations, the rule is \"not documented, not done.\" Electronic records also keep an audit trail that time-stamps every entry and edit, so investigators can see exactly when you charted. Paper-based habits like charting everything at the end of the shift, or recording diagnoses instead of observations, weaken your defense.",
    sections: [
      ["Describe What You See, Not a Diagnosis",
        "Nurses chart observations. Instead of \"patient had a grand mal seizure,\" write \"sudden stiffening of all four limbs, followed by rhythmic jerking for 90 seconds; unresponsive during the event; oriented ×2 at 5 minutes after.\" Quote the patient's own words. Replace labels like \"drug-seeking\" or \"noncompliant\" with what the patient said and did."],
      ["Chart as You Go; Label Late Entries",
        "Chart assessments, medications and events close to when they happen. During a rapid response or code, a recorder keeps the timeline. If you must chart late, use the EHR's late-entry function, record the actual time care was given, and never backdate. Never change another person's entry or delete your own; correct it through the system so the original stays visible."],
      ["What Never Goes in the Chart",
        "Staffing shortages (\"meds late due to short staffing\"), conflict between staff, blame, or that an incident or safety report was filed. Those go through incident reporting, an Assignment Despite Objection form, or your manager. Chart only the facts of what happened to the patient and what you did."],
      ["The Danger of Copy-Forward",
        "Copying the last shift's assessment can carry forward findings that are no longer true, such as \"lungs clear\" in a patient who now has crackles. The audit trail shows the assessment took 4 seconds. Chart only what you assessed yourself, this shift."],
      ["Use Approved Abbreviations",
        "The Joint Commission's \"Do Not Use\" list includes U (write \"unit\"), IU, QD and QOD, trailing zeros (5.0 mg) and missing leading zeros (.5 mg; write 0.5 mg), and MS / MSO4 / MgSO4."],
    ],
    scripts: [
      ["Objective note", "\"14:05 Found patient on floor beside bed, alert, oriented ×4. States, 'I slipped trying to reach the bathroom.' No visible injury; denies pain; moves all extremities. BP 128/76, HR 88. Dr. Lee notified 14:10. Bed alarm on, call light within reach, nonskid socks on.\""],
    ],
    dos: ["Time-stamp entries and chart close to the event", "Quote the patient", "Record who you notified, when, and the response", "Chart your follow-up reassessment"],
    donts: ["Don't chart \"incident report filed\"", "Don't chart staffing or conflict", "Don't copy forward an assessment you didn't do", "Don't backdate or alter entries"],
    check: [
      { q: "Which note is the most legally defensible?",
        opts: [
          ["\"Pt had a grand mal seizure. Gave Ativan.\"", "A diagnosis label with no description, timing or response."],
          ["\"10:42 Sudden stiffening of all 4 limbs, then rhythmic jerking × 90 s; unresponsive. Lorazepam 2 mg IV given 10:44 per order. 10:50 drowsy, oriented ×2, SpO₂ 96% RA. Dr. Ahmed notified 10:45.\"", "Correct. It is objective and timed, and records the medication, the response and who was notified."],
          ["\"Pt seized again as expected, family upset as usual.\"", "Subjective and judgmental, with nothing measurable."],
          ["\"Seizure activity noted. See flowsheet.\"", "Too vague to show what happened or what you did."] ],
        a: 1 },
      { q: "You gave a 10:00 dressing change but forgot to chart it. It's now 15:00. What do you do?",
        opts: [
          ["Chart it with a 10:00 time and no note", "That is backdating. The audit trail will show the real entry time."],
          ["Skip it, since the care was done", "Undocumented care counts as care not given."],
          ["Enter a late entry labeled as late, with the actual 10:00 care time", "Correct. Late entries are allowed when clearly labeled."],
          ["Ask the next shift to chart it", "Never chart for someone else, or ask someone to chart for you."] ],
        a: 2 },
      { q: "Medications were 2 hours late because the unit was short-staffed. What belongs in the patient's chart?",
        opts: [
          ["\"Meds late due to short staffing\"", "Staffing belongs in incident reporting and with your manager, not the medical record."],
          ["The actual administration times, plus any patient effects and who was notified", "Correct. Chart facts about the patient; report staffing through the proper channel."],
          ["\"Incident report filed regarding late meds\"", "Never reference an incident report in the chart."],
          ["Nothing. Chart the scheduled time instead", "That falsifies the record."] ],
        a: 1 },
    ],
  },

  /* 3 ------------------------------------------------------------ */
  {
    id: "hipaa", icon: "ShieldCheck", mins: 8,
    title: "HIPAA, Social Media and Protecting Your License",
    why: "HIPAA is federal law, with fines and possible criminal penalties for willful violations. Hospitals audit who opens every chart, and privacy breaches are a common reason nurses are fired and reported to the Board of Nursing. For internationally educated nurses, the stakes are higher: losing your job or license can also put an employer-sponsored visa or green card process at risk.",
    sections: [
      ["HIPAA in Daily Practice",
        "Need to know: open only the records your job requires (hospitals audit this). For purposes other than treatment, share only the minimum necessary. Opening a chart out of curiosity, including a coworker's, a celebrity's or your own family's, is a violation even if you never tell anyone.\nIncidental disclosures (a visitor overhears part of a conversation despite reasonable care) are not violations. Carelessness is: hallway or elevator talk, unlocked screens, printouts left out.\nPhone calls: share information only as the patient has allowed and per facility process. Many hospitals use a patient privacy code or password for callers. If in doubt, take a number and check."],
      ["Social Media Traps",
        "Never photograph or record anything on the unit, including an \"empty\" room, a whiteboard, a monitor or the ambulance bay. Details in the background identify patients.\n\"Stories without names\" still identify people when the date, unit, age or an unusual condition can be pieced together.\nPrivate groups and disappearing messages are not private. Screenshots last forever. The NCSBN and the ANA both say: never post patient information in any form."],
      ["Texting and Messaging",
        "Use only the hospital's approved secure messaging (for example Epic Secure Chat or Vocera). Never send patient details over personal SMS, WhatsApp or group chats, even to colleagues."],
      ["Your Own Malpractice Coverage",
        "The hospital's lawyers defend the hospital. Employer insurance usually does not pay for your defense before the Board of Nursing. An individual RN policy (for example NSO or Proliability) can add license-defense coverage for a modest yearly premium. Compare policies in the License tab."],
    ],
    scripts: [
      ["Family phone call", "\"I want to help. To protect her privacy, can you give me the patient's privacy code? … Thank you. I can share that she's resting comfortably. For more detail, her husband is listed as the person to update.\""],
    ],
    dos: ["Lock your screen every time you step away", "Use secure messaging only", "Check the patient's privacy preferences before sharing information", "Report any breach you notice. Reporting it is protected; hiding it is not"],
    donts: ["Don't look up any chart you are not caring for", "Don't post about work, even without names", "Don't take photos on the unit", "Don't discuss patients in hallways, elevators or the cafeteria"],
    check: [
      { q: "A friend from your home country, now working on your unit, sends a patient update to your nurses' WhatsApp group. What should you do?",
        opts: [
          ["Reply with your own update so everyone is informed", "That adds a second breach."],
          ["Do nothing. It's a private group", "Private groups are not secure, and PHI is now outside hospital systems."],
          ["Ask them to delete it, don't share it further, and report it to your charge nurse or privacy officer per policy", "Correct. Contain it and report it through the proper channel."],
          ["Screenshot it as proof and post it on Facebook", "That spreads the breach further."] ],
        a: 2 },
      { q: "You want to post: \"Crazy night in the ER — a 19-year-old came in after swallowing a battery!\" No names. Is this acceptable?",
        opts: [
          ["Yes, no names are used", "Age, setting, timing and an unusual event can identify the patient. Boards discipline for this."],
          ["Yes, if your profile is private", "Privacy settings don't change HIPAA or Board rules."],
          ["No. It describes an identifiable patient event from your workplace", "Correct. Don't post about patients in any form."],
          ["Yes, if you post it a week later", "Delaying the post doesn't remove identifying details."] ],
        a: 2 },
      { q: "A caller says she is the patient's sister and asks for the diagnosis. The patient has a privacy code and has not listed her. What is the best response?",
        opts: [
          ["Give the diagnosis. Family has a right to know", "Family members have no automatic right to health information."],
          ["Ask for the privacy code. Without it, say you can't share information and offer to tell the patient she called", "Correct. Follow the patient's wishes and the facility's process."],
          ["Hang up immediately", "Unprofessional. Offer a respectful alternative."],
          ["Share only the lab results", "Still a disclosure without authorization."] ],
        a: 1 },
    ],
  },

  /* 4 ------------------------------------------------------------ */
  {
    id: "deleg", icon: "Users", mins: 8,
    title: "Safe Delegation: The 5 Rights",
    why: "In many countries, nurses provide every part of a patient's care themselves. In U.S. hospitals, the RN leads a team that includes LPN/LVNs and unlicensed assistive personnel (UAPs: nursing assistants, CNAs, patient care technicians). Delegating well is an expectation, not laziness. The RN stays accountable for the decision to delegate and for following up, and each state's Nurse Practice Act defines what may be delegated.",
    sections: [
      ["The 5 Rights of Delegation (NCSBN / ANA)",
        "Right task: routine, predictable, within the person's role.\nRight circumstance: the patient is stable and the outcome is predictable.\nRight person: trained and competent for this task.\nRight direction and communication: what, when, and what to report.\nRight supervision and evaluation: you follow up and evaluate the result."],
      ["What a UAP Can and Can't Do",
        "Usually can: hygiene and ADLs, feeding stable patients, ambulating and turning, routine vital signs on stable patients, intake and output, specimen collection such as urine and stool, glucose checks if trained per policy.\nNever delegate the \"EAT\" tasks: Evaluation, Assessment, Teaching, plus care planning, nursing judgment, care of unstable patients, and medication administration. In most acute-care hospitals, UAPs do not give medications; your state and facility policy decide."],
      ["Giving Clear Direction",
        "Vague: \"Can you check on room 5?\" Clear: \"Please take vital signs in room 5 at 14:00 and tell me right away if the systolic BP is under 100, the heart rate is over 110, or the SpO₂ is below 92%.\""],
      ["Closing the Loop",
        "Review the vital signs that assistants chart. If a CNA records a BP of 80/40 and doesn't tell you, you are still accountable once it is in the chart. Assess the patient first, then coach the CNA on what to report and when. Thank people for good catches; it builds a team that speaks up."],
    ],
    scripts: [
      ["Delegation script", "\"Maria, can you help Mr. Lee in 8 walk to the bathroom at 10:00? He's day 2 after knee surgery and can bear weight with a walker. Use the gait belt, and if he gets dizzy or his pain goes above 6, sit him down and call me right away.\""],
    ],
    dos: ["Know your state's rules and your facility's job descriptions", "Give the task, the time, the limits and when to report", "Follow up and evaluate", "Delegate early in the shift so care doesn't get missed"],
    donts: ["Don't delegate assessment, teaching or evaluation", "Don't delegate care of an unstable patient", "Don't assume a vital sign was normal because no one told you", "Don't do every task yourself; it leads to missed care"],
    check: [
      { q: "Which task can the RN delegate to a certified nursing assistant?",
        opts: [
          ["Teaching a client newly diagnosed with diabetes how to give insulin", "Teaching stays with the licensed nurse."],
          ["Assessing a client who reports new chest pain", "Assessment of a new problem is never delegated."],
          ["Walking a stable client on post-op day 2 to the bathroom", "Correct. Routine, predictable care for a stable client."],
          ["Giving scheduled oral medications", "In most acute-care hospitals, medication administration stays with licensed nurses."] ],
        a: 2 },
      { q: "Which instruction to a patient care technician is the clearest?",
        opts: [
          ["\"Keep an eye on room 12.\"", "No task, no time, no parameters."],
          ["\"Take vitals in 12 at 14:00 and tell me right away if SBP < 100 or HR > 110.\"", "Correct. Specific task, time and reporting limits."],
          ["\"Let me know if anything seems off.\"", "Too vague to act on."],
          ["\"Do whatever 12 needs.\"", "Hands over nursing judgment, which can't be delegated."] ],
        a: 1 },
      { q: "You find a BP of 80/40 that a CNA charted an hour ago without telling you. What do you do first?",
        opts: [
          ["Go assess the patient now", "Correct. The patient comes first. Then follow up with the CNA about what to report."],
          ["File a complaint about the CNA", "The patient's safety comes before any process."],
          ["Ask the CNA to recheck it", "The patient may be unstable and needs RN assessment, not another delegated vital sign."],
          ["Chart \"CNA failed to report\"", "Blame doesn't belong in the chart, and the patient still hasn't been assessed."] ],
        a: 0 },
    ],
  },

  /* 5 ------------------------------------------------------------ */
  {
    id: "code", icon: "Scale", mins: 9,
    title: "Patient Rights, Informed Consent and Code Status",
    why: "U.S. care is built on patient autonomy: adults with decision-making capacity choose their own treatment, even when family or staff disagree. In many cultures, families or doctors make these decisions. Here the nurse's role is to protect the patient's own choice, make sure consent is real, and act on the code status in the orders.",
    sections: [
      ["Informed Consent: Who Does What",
        "The provider who will do the procedure explains it, its risks, benefits and alternatives, and obtains consent. The RN often witnesses the signature, which confirms the patient's identity and that they signed voluntarily. As the patient's advocate, the RN also checks that they appear to have capacity and understand. If the patient has questions or can't explain what they're agreeing to, stop and call the provider. Use a qualified medical interpreter (in person, video or phone), never family, when language is a barrier. In a true emergency, care may proceed under implied consent per policy."],
      ["Code Status and Advance Directives",
        "Every patient is full code unless there is an order otherwise.\nDNR / DNAR: no CPR if the heart stops. DNI: no intubation. Comfort care: the focus moves to symptoms and comfort.\nAdvance directives (a living will, or a health care power of attorney who decides when the patient can't) state wishes. A POLST or MOLST (the name varies by state) is a portable medical order, and the admitting provider reviews it and writes the matching inpatient code-status order per policy."],
      ["When Family Disagrees",
        "A valid DNR order reflecting the patient's wishes stands, even if a family member demands CPR at the bedside. Stay calm and present, give comfort, call the provider and charge nurse, and involve the chaplain, palliative care or ethics team. Moral distress afterward is real. Use debriefing and support resources."],
      ["Leaving Against Medical Advice (AMA)",
        "An adult with capacity may leave. Make sure the provider assesses capacity and explains the risks. Remove IV lines safely per policy and offer prescriptions and follow-up. Ask the patient to sign the AMA form. If they refuse, document the refusal, the risks explained and who was present. Never restrain or block a competent adult from leaving."],
    ],
    scripts: [
      ["Family demanding CPR (valid DNR)", "\"I can see how much you love her. She made the decision not to have CPR, and her doctor wrote that order. We are going to keep her comfortable, and I'm calling her doctor and our chaplain to be with you now.\""],
    ],
    dos: ["Check the code status order at the start of every shift", "Use an interpreter for consent", "Stop and call the provider if the patient doesn't understand", "Document AMA discussions in full"],
    donts: ["Don't obtain consent yourself for a provider's procedure", "Don't let family members interpret consent", "Don't override a valid DNR because family insists", "Don't restrain a competent adult who wants to leave"],
    check: [
      { q: "A patient with a valid DNR order becomes pulseless. Her son arrives and shouts, \"Do CPR!\" What should the nurse do?",
        opts: [
          ["Start compressions to calm the family", "That violates the patient's documented decision and the provider's order."],
          ["Honor the DNR order, stay with the family, provide comfort, and notify the provider and chaplain", "Correct. The valid order reflects the patient's wishes. Support the family while you escalate."],
          ["Ask the son to sign a consent for CPR", "Family cannot override a valid DNR order made by or for the patient."],
          ["Call a code, then decide", "A valid DNR order means no CPR."] ],
        a: 1 },
      { q: "While witnessing a surgical consent, the patient asks, \"Wait, are they removing my whole leg?\" What do you do?",
        opts: [
          ["Explain the procedure yourself and have him sign", "Explaining the procedure and obtaining consent is the surgeon's job."],
          ["Witness the signature since the form is complete", "Consent isn't valid if the patient doesn't understand."],
          ["Stop, don't witness, and notify the surgeon to clarify with the patient", "Correct. The nurse confirms understanding and stops the process if it isn't there."],
          ["Ask his daughter to explain it", "Family can't take the provider's place in obtaining consent."] ],
        a: 2 },
      { q: "An alert patient with capacity is leaving AMA and refuses to sign the AMA form. What is the best action?",
        opts: [
          ["Prevent him from leaving until he signs", "That is false imprisonment. A competent adult may leave."],
          ["Notify the provider, remove the IV safely, and document the refusal to sign, the risks explained and who was present", "Correct. Respect his autonomy and document thoroughly."],
          ["Call security to hold him", "Security isn't used to stop a competent patient from leaving."],
          ["Let him leave with the IV in place", "An IV catheter left in place risks infection and misuse. Remove it per policy."] ],
        a: 1 },
    ],
  },

  /* 6 ------------------------------------------------------------ */
  {
    id: "workplace", icon: "Building2", mins: 8,
    title: "Workplace Dynamics, Safe Staffing and Advocacy",
    why: "U.S. nurses are expected to help shape practice, speak up about unsafe conditions and protect themselves from violence. Many IENs come from systems where questioning an assignment is risky. Here there are formal, protected ways to raise concerns. Knowing them protects your patients, your license and your job.",
    sections: [
      ["Shared Governance and Evidence-Based Practice",
        "Most hospitals, and every Magnet hospital, have unit practice councils where bedside nurses change policy. Examples: CLABSI bundles (hand hygiene, chlorhexidine bathing, daily review of whether a line is still needed) and CAUTI bundles (nurse-driven protocols to remove urinary catheters early). Joining one builds your career ladder file."],
      ["Workplace Violence and De-escalation",
        "Assaults on nurses are common, and the Joint Commission requires hospitals to have violence-prevention programs. Keep a clear exit and stay out of arm's reach. Use a calm, low voice and short sentences. Acknowledge feelings without arguing, and offer simple choices. Call security or your behavioral emergency team early. Report every incident; it's not \"part of the job.\""],
      ["Unsafe Assignments: Raise Concerns Before You Accept",
        "Talk to the charge nurse first and offer alternatives: fewer patients, help from a resource nurse, a lower-acuity mix. Escalate to the house supervisor if needed. If you are required to take the assignment, accept it under protest, give the safest care you can, and complete your facility's Assignment Despite Objection (ADO) form or your state's equivalent. Texas, for example, has Safe Harbor peer review. These processes document the risk without abandoning patients."],
      ["What Counts as Patient Abandonment",
        "In most states, abandonment means accepting an assignment, starting the nurse-patient relationship, and then leaving without handing off to another qualified nurse. Turning down an assignment before you accept it is usually not abandonment, though it may have employment consequences. Leaving at the end of your shift without giving report usually is. Check your state Board of Nursing's definition."],
    ],
    scripts: [
      ["Raising a staffing concern", "\"I'm concerned about taking a sixth patient. Two of mine are on insulin drips and one is a fresh post-op. Can we move the admission to Sam, or get the resource nurse to take two? If not, I'll take it, but I need to complete an ADO.\""],
    ],
    dos: ["Raise concerns before accepting an assignment", "Use the ADO / Safe Harbor process when required to accept", "Report every act of workplace violence", "Join a unit practice council"],
    donts: ["Don't leave without giving report to a qualified nurse", "Don't argue with an escalating patient or visitor", "Don't chart staffing complaints in the medical record", "Don't stay silent about an unsafe assignment"],
    check: [
      { q: "Your 12-hour shift has ended, and your relief nurse called in sick. Which action could be considered patient abandonment?",
        opts: [
          ["Telling the charge nurse and staying until patients are handed off", "This is the correct, safe action."],
          ["Leaving at shift end without giving report to another nurse", "Correct. Leaving accepted patients without a handoff to a qualified nurse is abandonment in most states."],
          ["Asking the house supervisor to find a replacement", "Appropriate escalation, not abandonment."],
          ["Giving report to the charge nurse, who accepts the patients", "A proper handoff ends your responsibility."] ],
        a: 1 },
      { q: "At the start of the shift you're given an assignment you believe is unsafe. What should you do first?",
        opts: [
          ["Refuse and go home", "Raise it before refusing outright, and know the employment risks."],
          ["Accept silently and do your best", "Silence leaves the risk undocumented and patients exposed."],
          ["Raise the concern with the charge nurse before accepting and suggest alternatives", "Correct. Negotiate first, then escalate and use an ADO if you must accept."],
          ["Post about it on social media", "This is unprofessional and may breach confidentiality."] ],
        a: 2 },
      { q: "A visitor is shouting and moving toward you in the hallway. What is the best first action?",
        opts: [
          ["Stand in the doorway and argue back firmly", "Arguing escalates, and blocking the doorway traps you both."],
          ["Keep a clear exit and safe distance, use a calm voice, and call security", "Correct. Protect yourself first, de-escalate, and get help early."],
          ["Turn your back and walk away without a word", "Never turn your back on an aggressive person, and get help."],
          ["Touch his arm to calm him", "Touch can be perceived as a threat and escalate the situation."] ],
        a: 1 },
    ],
  },
];

export const PASS_MARK = 2;   // correct answers needed (out of 3) to complete a lesson

/* ---------------- SBAR builder ---------------- */
// Each part offers 3 versions; "best" marks the strongest one, and "tip" explains why.
export const SBAR_SCENARIOS = [
  {
    id: "stemi", title: "Acute STEMI", icon: "HeartPulse",
    chart: "58-year-old man on telemetry, admitted for diabetic foot cellulitis. 07:15: crushing chest pain 8/10 radiating to the jaw, diaphoretic, nauseated. BP 104/66, HR 112, RR 22, SpO₂ 94% RA. 12-lead ECG: ST elevation in leads II, III and aVF. History: type 2 diabetes, hypertension; no prior cardiac history. Full code. Allergic to penicillin.",
    parts: {
      S: [["I'm calling about room 14, Mr. Owusu. He has new crushing chest pain 8/10 with ST elevation in II, III and aVF on his 12-lead.", true], ["Room 14 isn't feeling well this morning.", false], ["Mr. Owusu has chest pain, and I thought you should know.", false]],
      B: [["He's 58, admitted 2 days ago for foot cellulitis, has diabetes and hypertension, full code, allergic to penicillin. No prior cardiac history.", true], ["He was admitted 2 days ago. He's been here a while and has a lot going on.", false], ["He has diabetes, his foot looks better, he ate breakfast, and his son visited yesterday.", false]],
      A: [["BP 104/66, HR 112, diaphoretic and nauseated. With ST elevation in the inferior leads, I'm concerned this is an inferior STEMI.", true], ["His vitals are a little off.", false], ["I think he's anxious about his foot.", false]],
      R: [["Please come to the bedside now. I'm requesting a STEMI alert / cath lab activation and orders for aspirin and anticoagulation per ACS protocol.", true], ["What do you want me to do?", false], ["I'll recheck him in an hour.", false]],
    },
    order: "Aspirin 324 milligrams, chew now. Heparin bolus and drip per the ACS protocol. I'm activating the cath lab.",
    readBack: [
      ["\"Aspirin three-two-four milligrams, chewed now; heparin bolus and infusion per ACS protocol; cath lab activated. Is that correct?\"", true, "Correct. Drug, dose, route and timing, then confirmation."],
      ["\"Aspirin 81 milligrams and heparin, got it.\"", false, "Wrong dose and no confirmation. The ACS loading dose is 162–325 mg chewed (usually 324 mg)."],
      ["\"Okay, I'll give everything now.\"", false, "No read-back, so a misheard order would go undetected."] ],
  },
  {
    id: "sepsis", title: "Impending Sepsis", icon: "Activity",
    chart: "70-year-old woman, post-op day 3 after a bowel resection. 02:00: new confusion, T 38.8 °C, HR 118, BP 84/50 (MAP 61), baseline 128/72; RR 24, SpO₂ 93% RA. Urine 60 mL in 4 hours. Lactate not yet drawn. Weight 70 kg. No known allergies. Full code.",
    parts: {
      S: [["I'm calling about Mrs. Kim in room 8. She screens positive for sepsis: new confusion, fever and a falling blood pressure.", true], ["Mrs. Kim has a fever.", false], ["Sorry to wake you, it's probably nothing.", false]],
      B: [["She's 70, post-op day 3 from a bowel resection, full code, no known allergies. She was alert and oriented at 20:00.", true], ["She had surgery recently.", false], ["She's been a difficult patient and her family calls a lot.", false]],
      A: [["T 38.8, HR 118, BP 84/50 down from 128/72, RR 24, urine 60 mL in 4 hours. I'm concerned about sepsis, possibly from an anastomotic leak.", true], ["She seems a bit warm.", false], ["I think she's just tired.", false]],
      R: [["I'd like you to evaluate her now. Can I start the sepsis protocol: lactate, blood cultures × 2, a 30 mL/kg fluid bolus and antibiotics?", true], ["Should I give Tylenol?", false], ["I'll let the day team know.", false]],
    },
    order: "Lactated Ringer's 30 mL per kg, that's 2,100 mL, IV bolus now. Blood cultures times two and a lactate before antibiotics, then cefepime 2 grams IV and metronidazole 500 milligrams IV.",
    readBack: [
      ["\"Lactated Ringer's two-thousand-one-hundred mL IV bolus now; blood cultures × 2 and lactate first; then cefepime, C-E-F-E-P-I-M-E, two grams IV, and metronidazole five hundred milligrams IV. Is that correct?\"", true, "Correct. Volume, sequence and the spelled drug name are all confirmed."],
      ["\"LR bolus and an antibiotic, got it.\"", false, "Missing the volume, the drug name and the culture-first sequence."],
      ["\"Cefazolin two grams after the fluids, right?\"", false, "Wrong drug (a sound-alike). Spelling the name out would catch this."] ],
  },
  {
    id: "hemorrhage", title: "Uncontrolled Hemorrhage", icon: "Droplets",
    chart: "62-year-old man, 4 hours after open abdominal surgery. Dressing saturated twice in 30 minutes; surgical drain 400 mL bright red blood in the last hour. HR 128, BP 86/50, RR 26, cool and clammy, restless. Hgb 7.9 g/dL (was 11.2 pre-op). Full code. No anticoagulants. Pressure applied to the dressing.",
    parts: {
      S: [["I'm calling about Mr. Novak in room 3, 4 hours post-op. He's actively bleeding: 400 mL bright red from the drain in an hour, and he's hypotensive.", true], ["Room 3's dressing needs changing.", false], ["Mr. Novak has some drainage.", false]],
      B: [["He's 62, had open abdominal surgery this afternoon, full code. Pre-op Hgb was 11.2. He's on no anticoagulants.", true], ["He had surgery today.", false], ["He's a nice man, and his wife is here.", false]],
      A: [["HR 128, BP 86/50, cool and clammy, Hgb now 7.9. I believe he's hemorrhaging and in early hypovolemic shock.", true], ["He looks pale.", false], ["The drain is just doing its job.", false]],
      R: [["I need you at the bedside now. Please order 2 units of blood, type and crossmatch, and notify the surgeon about returning to the OR; I'll call the rapid response team.", true], ["Should I just reinforce the dressing?", false], ["Can you look at him in the morning?", false]],
    },
    order: "Transfuse two units of packed red blood cells now. Type and crossmatch for four more. Lactated Ringer's one liter bolus while blood is prepared. I'm calling the surgeon about returning to the OR.",
    readBack: [
      ["\"Two units packed red blood cells now; type and crossmatch for four more units; lactated Ringer's one liter bolus while blood is prepared; surgeon being notified for return to the OR. Is that correct?\"", true, "Correct. Every order and number is read back and confirmed."],
      ["\"Blood and fluids, okay.\"", false, "Too vague. The number of units and the volume aren't confirmed."],
      ["\"Four units now and two crossmatched, right?\"", false, "Numbers reversed. Read-back exists to catch exactly this."] ],
  },
];

/* ---------------- "Chart this, not that" flip cards ---------------- */
export const CHART_CARDS = [
  { topic: "Pain", risky: "Patient is drug-seeking and always wants Dilaudid.", objective: "10:10 Patient states pain 9/10, sharp, mid-epigastric: \"I need something stronger.\" BP 132/78, HR 96. Grimacing on palpation. Last hydromorphone 08:30; next dose available 11:30. Dr. Ito notified 10:15." },
  { topic: "Fall", risky: "Patient fell because he wouldn't use the call light.", objective: "03:20 Found patient sitting on floor beside bed. States, \"I tried to go to the bathroom.\" Alert, oriented ×4, no visible injury, moves all extremities. BP 124/78, HR 84. Dr. Shah notified 03:25. Bed alarm on, call light in reach." },
  { topic: "Seizure", risky: "Patient had a grand mal seizure.", objective: "10:42 Sudden stiffening of all 4 limbs, then rhythmic jerking × 90 s; unresponsive. Lorazepam 2 mg IV given 10:44 per order. 10:50 drowsy, oriented ×2, SpO₂ 96% RA." },
  { topic: "Behavior", risky: "Patient is noncompliant and rude.", objective: "Patient declined 09:00 metoprolol, stating, \"It makes me dizzy.\" Explained purpose and risks of skipping. BP 158/94. Dr. Lee notified 09:15; order to recheck BP in 1 hour." },
  { topic: "Intoxication", risky: "Patient is drunk.", objective: "Smell of alcohol on breath, slurred speech, unsteady gait. States he drank \"a few beers\" at 18:00. Oriented ×3. Blood alcohol level sent per order." },
  { topic: "Provider call", risky: "Dr. Smith refused to come and see the patient.", objective: "02:18 SBAR given by phone to Dr. Smith re: BP 84/46. Order for 500 mL NS bolus, read back and confirmed. 02:50 BP 88/50. 02:55 Charge RN notified; RRT called 02:57." },
  { topic: "Wound", risky: "Wound looks bad.", objective: "Sacral wound 4 cm × 3 cm × 0.5 cm, 30% yellow slough, moderate serous drainage, no odor; periwound skin intact. Dressing changed per order." },
  { topic: "Staffing", risky: "Meds late due to short staffing.", objective: "Metoprolol 25 mg PO given 10:45 (scheduled 09:00). BP 132/80, HR 76 before dose. [Report the staffing concern through an incident report or ADO, not the chart.]" },
  { topic: "Incident", risky: "Wrong dose given, incident report filed.", objective: "14:00 Heparin 7,500 units subcut given; ordered dose 5,000 units. Dr. Park notified 14:05. aPTT ordered and drawn 14:20. No bleeding noted; site without hematoma. [Never mention the incident report in the chart.]" },
  { topic: "Copy-forward", risky: "Lungs clear (copied from last shift).", objective: "20:00 Fine crackles in both lung bases, RR 22, SpO₂ 92% on 2 L, up from 96% at 16:00. Dr. Ali notified 20:05." },
];
