import type { University } from "./types";

export const CATALOG_NOTE =
  "Figures below are a demo catalog compiled for this prototype (2025–26 cycle snapshot). Confirm every deadline, fee, and aid rule on the university site before you apply.";

export const FIT_METHODOLOGY =
  "Fit index is a 0–100 weighted score: academic overlap 30%, aid feasibility 25%, location 20%, research alignment 15%, testing/language 10%. It is not an admissions probability and does not predict a decision.";

export const universities: University[] = [
  {
    id: "nyuad",
    name: "NYU Abu Dhabi",
    shortName: "NYUAD",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    countryId: "ae",
    programs: ["cs", "engineering", "economics", "biology", "undecided"],
    research: "high",
    aid: {
      kind: "generous-need",
      summary:
        "Need-aware admissions with substantial need-based aid for admitted students, including internationals.",
    },
    tuitionIntlUsd: 62000,
    tuitionNote: "Sticker price is high; aid can cover a large share of demonstrated need.",
    selectivity: "extremely",
    application: "Common App",
    deadlines: [
      { label: "Early Decision I", date: "Nov 1" },
      { label: "Regular Decision", date: "Jan 5" },
    ],
    english: "TOEFL, IELTS, or Duolingo accepted if schooling was not in English.",
    notes:
      "Residential liberal-arts campus with funded undergraduate research and a global network.",
    sources: [
      {
        label: "NYUAD admissions",
        url: "https://nyuad.nyu.edu/en/admissions.html",
      },
      {
        label: "NYUAD financial aid",
        url: "https://nyuad.nyu.edu/en/admissions/financial-aid.html",
      },
    ],
  },
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    city: "Cambridge",
    country: "United States",
    countryId: "us",
    programs: ["cs", "engineering", "biology", "economics", "undecided"],
    research: "high",
    aid: {
      kind: "meets-full-need",
      summary:
        "Need-blind for all applicants, including internationals, and commits to meeting full demonstrated need.",
    },
    tuitionIntlUsd: 62000,
    tuitionNote: "Aid is need-based. International students are eligible.",
    selectivity: "extremely",
    application: "MIT application (not Common App)",
    deadlines: [
      { label: "Early Action", date: "Nov 1" },
      { label: "Regular Action", date: "Jan 6" },
    ],
    english: "English proficiency required if English is not the language of instruction.",
    notes:
      "Undergraduate research (UROP) is a core part of the academic culture.",
    sources: [
      { label: "MIT admissions", url: "https://mitadmissions.org/" },
      {
        label: "MIT student financial services",
        url: "https://sfs.mit.edu/",
      },
    ],
  },
  {
    id: "waterloo",
    name: "University of Waterloo",
    shortName: "Waterloo",
    city: "Waterloo",
    country: "Canada",
    countryId: "ca",
    programs: ["cs", "engineering", "biology", "undecided"],
    research: "high",
    aid: {
      kind: "limited-intl",
      summary:
        "International tuition is high; entrance awards exist, but full-need packages are uncommon.",
    },
    tuitionIntlUsd: 48000,
    tuitionNote: "Co-op earnings can offset cost; they are not a substitute for aid.",
    selectivity: "very",
    application: "OUAC 105",
    deadlines: [{ label: "Most programs", date: "Jan 15" }],
    english: "IELTS 6.5 typical minimum; higher for some programs.",
    notes: "Co-op is the distinctive feature, especially in computer science and engineering.",
    sources: [
      {
        label: "Waterloo undergraduate admissions",
        url: "https://uwaterloo.ca/undergraduate-admissions/",
      },
      {
        label: "Waterloo international fees",
        url: "https://uwaterloo.ca/student-financial-services/",
      },
    ],
  },
  {
    id: "toronto",
    name: "University of Toronto",
    shortName: "U of T",
    city: "Toronto",
    country: "Canada",
    countryId: "ca",
    programs: ["cs", "engineering", "economics", "biology", "undecided"],
    research: "high",
    aid: {
      kind: "limited-intl",
      summary:
        "Some international scholarships (including Lester B. Pearson) are available; most students pay international tuition.",
    },
    tuitionIntlUsd: 45000,
    tuitionNote: "Need-based aid for internationals is limited relative to U.S. private colleges.",
    selectivity: "very",
    application: "OUAC",
    deadlines: [{ label: "International applicants", date: "Jan 15" }],
    english: "IELTS / TOEFL accepted; program minima vary.",
    notes: "Large research university with strong CS, economics, and life sciences.",
    sources: [
      {
        label: "U of T future students",
        url: "https://future.utoronto.ca/",
      },
    ],
  },
  {
    id: "brown",
    name: "Brown University",
    shortName: "Brown",
    city: "Providence",
    country: "United States",
    countryId: "us",
    programs: ["cs", "economics", "biology", "undecided"],
    research: "high",
    aid: {
      kind: "need-aware-intl",
      summary:
        "Meets full demonstrated need for admitted students; international admissions are need-aware.",
    },
    tuitionIntlUsd: 68000,
    tuitionNote: "If admitted with need, Brown typically meets 100% of demonstrated need.",
    selectivity: "extremely",
    application: "Common App",
    deadlines: [
      { label: "Early Decision", date: "Nov 1" },
      { label: "Regular Decision", date: "Jan 5" },
    ],
    english: "Testing policy varies by year; confirm English-proficiency rules.",
    notes: "Open Curriculum. Strong if you want research without a rigid core.",
    sources: [
      { label: "Brown admission", url: "https://admission.brown.edu/" },
      {
        label: "Brown financial aid",
        url: "https://www.brown.edu/admission/undergraduate/apply/financial-aid",
      },
    ],
  },
  {
    id: "gatech",
    name: "Georgia Institute of Technology",
    shortName: "Georgia Tech",
    city: "Atlanta",
    country: "United States",
    countryId: "us",
    programs: ["cs", "engineering", "undecided"],
    research: "high",
    aid: {
      kind: "limited-intl",
      summary:
        "Public university; international students have limited access to institutional need-based aid.",
    },
    tuitionIntlUsd: 33000,
    tuitionNote: "Lower sticker than many private U.S. schools, but still a stretch without aid.",
    selectivity: "very",
    application: "Common App / Coalition",
    deadlines: [
      { label: "Early Action", date: "Nov 1" },
      { label: "Regular Decision", date: "Jan 4" },
    ],
    english: "TOEFL/IELTS required unless exempt.",
    notes: "Particularly strong for computing and engineering.",
    sources: [
      { label: "Georgia Tech admission", url: "https://admission.gatech.edu/" },
    ],
  },
  {
    id: "ucl",
    name: "University College London",
    shortName: "UCL",
    city: "London",
    country: "United Kingdom",
    countryId: "uk",
    programs: ["cs", "engineering", "economics", "biology", "undecided"],
    research: "high",
    aid: {
      kind: "limited-intl",
      summary:
        "A small number of international scholarships exist; most undergraduates pay overseas fees.",
    },
    tuitionIntlUsd: 38000,
    tuitionNote: "Fees vary by department. Scholarships are competitive, not need-guaranteed.",
    selectivity: "very",
    application: "UCAS",
    deadlines: [{ label: "UCAS equal consideration", date: "Jan 14" }],
    english: "IELTS Academic typically 6.5–7.5 depending on programme.",
    notes: "Broad research university in central London. Programme-specific entry requirements.",
    sources: [
      { label: "UCL undergraduate", url: "https://www.ucl.ac.uk/prospective-students/undergraduate" },
    ],
  },
  {
    id: "lse",
    name: "London School of Economics",
    shortName: "LSE",
    city: "London",
    country: "United Kingdom",
    countryId: "uk",
    programs: ["economics", "undecided"],
    research: "high",
    aid: {
      kind: "limited-intl",
      summary: "Scholarships exist but are competitive; full-need aid is not the default.",
    },
    tuitionIntlUsd: 35000,
    tuitionNote: "Overseas fees are programme-specific.",
    selectivity: "extremely",
    application: "UCAS",
    deadlines: [{ label: "UCAS equal consideration", date: "Jan 14" }],
    english: "IELTS usually 7.0 overall for undergraduate programmes.",
    notes: "Specialist social-science university. Weak fit if the only interest is systems CS.",
    sources: [
      { label: "LSE undergraduate", url: "https://www.lse.ac.uk/study-at-lse/Undergraduate" },
    ],
  },
  {
    id: "tudelft",
    name: "TU Delft",
    shortName: "TU Delft",
    city: "Delft",
    country: "Netherlands",
    countryId: "nl",
    programs: ["cs", "engineering"],
    research: "high",
    aid: {
      kind: "low-tuition",
      summary:
        "Statutory fees for EU; institutional fees for non-EU are far below U.S. private tuition.",
    },
    tuitionIntlUsd: 17000,
    tuitionNote: "Non-EU bachelor fees are typically in the mid-teens (USD), not full-need aid.",
    selectivity: "moderately",
    application: "Studielink / university portal",
    deadlines: [{ label: "Non-EU bachelor (typical)", date: "Jan 15" }],
    english: "IELTS/TOEFL required for English-taught programmes.",
    notes: "Engineering-first campus. Numerus fixus for some programmes.",
    sources: [
      { label: "TU Delft bachelor", url: "https://www.tudelft.nl/en/education/programmes/bachelors" },
    ],
  },
  {
    id: "tum",
    name: "Technical University of Munich",
    shortName: "TUM",
    city: "Munich",
    country: "Germany",
    countryId: "de",
    programs: ["cs", "engineering", "biology"],
    research: "high",
    aid: {
      kind: "low-tuition",
      summary: "Public tuition is low; living costs in Munich are the real budget item.",
    },
    tuitionIntlUsd: 3000,
    tuitionNote: "Bavaria may charge modest fees for non-EU students; still far below private U.S. costs.",
    selectivity: "moderately",
    application: "TUMonline / uni-assist (programme-dependent)",
    deadlines: [{ label: "Winter semester (typical)", date: "May 31" }],
    english: "Many bachelor programmes are German-taught; check language of instruction.",
    notes: "Excellent technical education; language of instruction is a real constraint.",
    sources: [
      { label: "TUM degree programs", url: "https://www.tum.de/en/studies" },
    ],
  },
  {
    id: "eth",
    name: "ETH Zurich",
    shortName: "ETH",
    city: "Zurich",
    country: "Switzerland",
    countryId: "ch",
    programs: ["cs", "engineering", "biology"],
    research: "high",
    aid: {
      kind: "low-tuition",
      summary: "Tuition is low by international standards; Zurich living costs are high.",
    },
    tuitionIntlUsd: 1600,
    tuitionNote: "Tuition is not the barrier; language (German at bachelor level) and living costs are.",
    selectivity: "very",
    application: "ETH application portal",
    deadlines: [{ label: "Bachelor autumn (typical)", date: "Apr 30" }],
    english: "Bachelor programmes are primarily German-taught.",
    notes: "World-class technical university. Language of instruction matters more than tuition.",
    sources: [
      { label: "ETH bachelor admission", url: "https://ethz.ch/en/studies/bachelor.html" },
    ],
  },
  {
    id: "minerva",
    name: "Minerva University",
    shortName: "Minerva",
    city: "Multiple cities",
    country: "United States (global rotation)",
    countryId: "us",
    programs: ["cs", "economics", "biology", "undecided"],
    research: "moderate",
    aid: {
      kind: "generous-need",
      summary: "Sticker tuition is below many privates; need-based aid is available for internationals.",
    },
    tuitionIntlUsd: 23500,
    tuitionNote: "Aid plus lower sticker can make this viable when full private U.S. aid is unlikely.",
    selectivity: "very",
    application: "Minerva application",
    deadlines: [{ label: "Round 1 (typical)", date: "Nov 1" }],
    english: "English is the language of instruction; proficiency is assessed in-app.",
    notes: "Not a traditional campus. Rotation across cities. Distinct pedagogy.",
    sources: [
      { label: "Minerva admissions", url: "https://www.minerva.edu/admissions/" },
    ],
  },
];

export const countryLabels: Record<string, string> = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  ae: "United Arab Emirates",
  nl: "Netherlands",
  de: "Germany",
  ch: "Switzerland",
};

export const fieldLabels: Record<string, string> = {
  cs: "Computer science",
  engineering: "Engineering",
  economics: "Economics",
  biology: "Biology / life sciences",
  undecided: "Undeclared / open",
};
