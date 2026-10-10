// References & study resources shown in Settings → References & Study Resources.
// Citations follow APA 7th edition. Each citation is a list of parts; parts marked `i` are italic (titles).
// Web resources that are updated continuously use "(n.d.)" rather than a guessed year.
// Checked October 2026. When a book has a new edition, update the edition, year and publisher here.

export const REF_TABS = [
  { id: "standards", label: "Official Authorities & Standards", icon: "Landmark" },
  { id: "books", label: "Review Books", icon: "BookOpen" },
  { id: "sites", label: "Websites & Question Banks", icon: "Globe" },
  { id: "english", label: "English (OET / IELTS)", icon: "Languages" },
  { id: "regulators", label: "Regulators (US, CA, AU, NZ)", icon: "Scale" },
];

export const REF_NOTICE = "NurseBound is an independent study app. It is not sponsored by, endorsed by or affiliated with the National Council of State Boards of Nursing (NCSBN), Pearson VUE, Cambridge Boxhill Language Assessment (OET), the IELTS partners (British Council, IDP, Cambridge University Press & Assessment), Elsevier, Wolters Kluwer, or any nursing regulator or government agency. NCLEX®, NCLEX-RN®, OET® and IELTS® are registered trademarks of their owners. Books and websites are listed for study and reference only; NurseBound receives nothing for recommending them.";

export const REF_QUESTIONS_NOTE = "Every NurseBound question, rationale and case study is original, written for this app and reviewed against current U.S. practice guidance. The sources on this page are where you can check a rationale or read further. Clinical guidance changes, so always follow your facility's policy and the official sources.";

export const REFS = {
  standards: [
    {
      cite: [["National Council of State Boards of Nursing. (2026). "], ["2026 NCLEX-RN® test plan", "i"], [". https://www.nclex.com"]],
      url: "https://www.nclex.com",
      note: "The official exam blueprint. NurseBound tags every question with the test plan's eight Client Needs categories, which power your category heatmap and benchmark breakdowns. Effective April 2026.",
    },
    {
      cite: [["National Council of State Boards of Nursing & American Nurses Association. (2019). "], ["National guidelines for nursing delegation", "i"], [". https://www.ncsbn.org"]],
      url: "https://www.ncsbn.org",
      note: "The joint U.S. framework behind delegation and assignment questions (RN, LPN/LVN and assistive personnel).",
    },
    {
      cite: [["National Library of Medicine. (n.d.). "], ["DailyMed", "i"], [". U.S. Department of Health and Human Services. https://dailymed.nlm.nih.gov"]],
      url: "https://dailymed.nlm.nih.gov",
      note: "Current FDA-approved drug labels. The reference for pharmacology rationales: indications, boxed warnings, dosing and adverse effects.",
    },
    {
      cite: [["Siegel, J. D., Rhinehart, E., Jackson, M., Chiarello, L., & Healthcare Infection Control Practices Advisory Committee. (2007). "], ["2007 guideline for isolation precautions: Preventing transmission of infectious agents in healthcare settings", "i"], [". Centers for Disease Control and Prevention. https://www.cdc.gov/infection-control"]],
      url: "https://www.cdc.gov/infection-control",
      note: "Standard, contact, droplet and airborne precautions, used in infection-control questions.",
    },
    {
      cite: [["Institute for Safe Medication Practices. (n.d.). "], ["ISMP list of error-prone abbreviations, symbols, and dose designations", "i"], [". https://www.ismp.org"]],
      url: "https://www.ismp.org",
      note: "Why questions write \"units\" instead of \"U,\" use leading zeros (0.5 mg) and never trailing zeros (1 mg, not 1.0 mg).",
    },
  ],
  books: [
    {
      cite: [["Silvestri, L. A., & Silvestri, A. E. (2023). "], ["Saunders comprehensive review for the NCLEX-RN® examination", "i"], [" (9th ed.). Elsevier."]],
      url: "https://www.us.elsevierhealth.com/saunders-comprehensive-review-for-the-nclex-rn-examination-9780323795302.html",
      note: "A complete content review organized by body system and Client Needs, with test-taking strategies and practice questions.",
    },
    {
      cite: [["LaCharity, L. A., Kumagai, C. K., & Hosler, S. M. (2025). "], ["Prioritization, delegation, and assignment: Practice exercises for the NCLEX-RN® examination", "i"], [" (6th ed.). Elsevier."]],
      url: "https://shop.elsevier.com/books/prioritization-delegation-and-assignment/lacharity/978-0-443-11263-8",
      note: "Focused practice on Management of Care: who to see first, what to delegate and when to escalate.",
    },
    {
      cite: [["Billings, D. M., & Hensel, D. (2023). "], ["Lippincott® Q&A review for NCLEX-RN®", "i"], [" (14th ed.). Wolters Kluwer."]],
      url: "https://shop.lww.com/p/9781975182281",
      note: "A large question book with rationales for every answer choice across the Client Needs categories.",
    },
    {
      cite: [["Ernstmeyer, K., & Christman, E. (Eds.). (2021). "], ["Nursing fundamentals", "i"], [". Chippewa Valley Technical College. https://wtcs.pressbooks.pub/nursingfundamentals/"]],
      url: "https://wtcs.pressbooks.pub/nursingfundamentals/",
      note: "Free, peer-reviewed open textbook from Open RN (CC BY 4.0). Good for refreshing fundamentals and the nursing process.",
    },
    {
      cite: [["Ernstmeyer, K., & Christman, E. (Eds.). (2023). "], ["Nursing pharmacology", "i"], [" (2nd ed.). WisTech Open. https://wtcs.pressbooks.pub/pharmacology2e/"]],
      url: "https://wtcs.pressbooks.pub/pharmacology2e/",
      note: "Free open pharmacology textbook from Open RN (CC BY 4.0), organized by body system like the NurseBound pharmacology questions.",
    },
  ],
  sites: [
    {
      cite: [["National Council of State Boards of Nursing. (n.d.). "], ["NCLEX & other exams", "i"], [". https://www.nclex.com"]],
      url: "https://www.nclex.com",
      note: "The official candidate site: test plans, the Candidate Bulletin, Next Generation NCLEX item types and exam-day rules.",
    },
    {
      cite: [["Pearson VUE. (n.d.). "], ["NCLEX examination", "i"], [". https://home.pearsonvue.com/nclex"]],
      url: "https://home.pearsonvue.com/nclex",
      note: "Where you register, pay, receive your Authorization to Test (ATT) and book a test center, including international sites.",
    },
    {
      cite: [["National Council of State Boards of Nursing. (n.d.). "], ["NCSBN Learning Extension", "i"], [". https://www.learningext.com"]],
      url: "https://www.learningext.com",
      note: "NCSBN's own paid NCLEX review courses and practice exams, written to the official test plan.",
    },
    {
      cite: [["Open Resources for Nursing. (n.d.). "], ["Open RN textbooks", "i"], [". WisTech Open. https://wtcs.pressbooks.pub"]],
      url: "https://wtcs.pressbooks.pub",
      note: "Free nursing textbooks with case studies and practice questions (fundamentals, skills, pharmacology, mental health, management).",
    },
  ],
  english: [
    {
      cite: [["Cambridge Boxhill Language Assessment Trust. (n.d.). "], ["OET for nurses", "i"], [". https://oet.com"]],
      url: "https://oet.com",
      note: "The official OET site: test format, the Listening, Reading, Writing and Speaking criteria, sample tests and score requirements by country.",
    },
    {
      cite: [["IELTS. (n.d.). "], ["IELTS Academic", "i"], [". British Council, IDP: IELTS Australia, & Cambridge University Press & Assessment. https://ielts.org"]],
      url: "https://ielts.org",
      note: "The official IELTS site: Academic test format, band descriptors for Writing and Speaking, and free practice materials.",
    },
  ],
  regulators: [
    {
      group: "🇺🇸 United States",
      cite: [["CGFNS International. (n.d.). "], ["VisaScreen®: Visa credentials assessment", "i"], [". https://www.cgfns.org"]],
      url: "https://www.cgfns.org",
      note: "Credentials evaluation and the VisaScreen certificate most foreign-educated nurses need for a U.S. work visa.",
    },
    {
      group: "🇺🇸 United States",
      cite: [["U.S. Department of State, Bureau of Consular Affairs. (n.d.). "], ["Visa bulletin", "i"], [". https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"]],
      url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
      note: "The monthly priority-date cutoffs behind the app's EB-3 visa bulletin monitor.",
    },
    {
      group: "🇨🇦 Canada",
      cite: [["National Nursing Assessment Service. (n.d.). "], ["Internationally educated nurses", "i"], [". https://www.nnas.ca"]],
      url: "https://www.nnas.ca",
      note: "Document verification used by several provinces. Each province's college decides registration: Ontario (College of Nurses of Ontario, cno.org), British Columbia (BCCNM, bccnm.ca) and Alberta (CRNA, nurses.ab.ca).",
    },
    {
      group: "🇨🇦 Canada",
      cite: [["Immigration, Refugees and Citizenship Canada. (n.d.). "], ["Express Entry rounds of invitations", "i"], [". Government of Canada. https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html"]],
      url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
      note: "Source for the healthcare draws shown in the app's Canada migration monitor.",
    },
    {
      group: "🇦🇺 Australia",
      cite: [["Nursing and Midwifery Board of Australia. (n.d.). "], ["Internationally qualified nurses and midwives", "i"], [". Australian Health Practitioner Regulation Agency. https://www.nursingmidwiferyboard.gov.au"]],
      url: "https://www.nursingmidwiferyboard.gov.au",
      note: "Registration pathways for nurses educated overseas, including the outcomes-based assessment (which uses the NCLEX-RN and an OSCE) and the fast track for some countries.",
    },
    {
      group: "🇳🇿 New Zealand",
      cite: [["Te Kaunihera Tapuhi o Aotearoa | Nursing Council of New Zealand. (n.d.). "], ["Internationally qualified nurses", "i"], [". https://www.nursingcouncil.org.nz"]],
      url: "https://www.nursingcouncil.org.nz",
      note: "New Zealand registration for internationally qualified nurses. New Zealand uses its own theory exam and OSCE, not the NCLEX-RN.",
    },
  ],
};

/** Plain-text APA citation for copying (titles lose italics in plain text). */
export const citeText = (r) => r.cite.map((p) => p[0]).join("");
