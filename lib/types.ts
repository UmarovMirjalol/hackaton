export type AidNeed = "none" | "some" | "substantial" | "full";
export type Field = "cs" | "engineering" | "economics" | "biology" | "undecided";
export type EnglishExam = "none" | "ielts" | "toefl" | "duolingo";
export type Curriculum = "ib" | "ap" | "alevel" | "national";
export type GradYear = 2026 | 2027 | 2028;
export type Interest = "research" | "building" | "policy" | "arts" | "entrepreneurship";

export type CountryId =
  | "us"
  | "ca"
  | "uk"
  | "ae"
  | "nl"
  | "de"
  | "ch";

export type Profile = {
  firstName: string;
  lastName: string;
  gradYear: GradYear;
  homeCountry: string;
  gpa: string;
  gpaScale: "4.0" | "100" | "ib";
  curriculum: Curriculum;
  satMath: string;
  satEbrw: string;
  satStatus: "done" | "planned" | "skip";
  englishExam: EnglishExam;
  englishScore: string;
  countries: CountryId[];
  /** Empty string = unanswered */
  aidNeed: AidNeed | "";
  annualBudget: string;
  /** Empty string = unanswered */
  field: Field | "";
  interests: Interest[];
  researchExperience: boolean;
  recLettersStarted: boolean;
  /** Free-text activities summary (optional) */
  activities: string;
  /** Free-text achievements (optional) */
  achievements: string;
};

export type University = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  countryId: CountryId;
  programs: Field[];
  research: "high" | "moderate";
  aid: {
    kind:
      | "meets-full-need"
      | "need-aware-intl"
      | "limited-intl"
      | "low-tuition"
      | "generous-need";
    summary: string;
  };
  tuitionIntlUsd: number;
  tuitionNote: string;
  selectivity: "extremely" | "very" | "moderately";
  application: string;
  deadlines: { label: string; date: string }[];
  english: string;
  notes: string;
  sources: { label: string; url: string }[];
};

export type FactorKey =
  | "aid"
  | "research"
  | "academic"
  | "location"
  | "selectivity";

export type Factor = {
  key: FactorKey;
  label: string;
  value: string;
  detail: string;
  tone: "good" | "mixed" | "watch";
};

export type RankedUniversity = {
  university: University;
  fitIndex: number;
  why: string;
  factors: Factor[];
  scores: Record<FactorKey, number>;
};

export type TaskStatus = "todo" | "started" | "done";

export type RoadmapTask = {
  id: string;
  month: string;
  title: string;
  reason: string;
  deadline: string;
  effort: string;
  source?: { label: string; url: string };
  universityIds?: string[];
};

export type Diagnosis = {
  title: string;
  summary: string;
  strengths: { label: string; evidence: string }[];
  constraints: { label: string; evidence: string }[];
  goals: { label: string; evidence: string }[];
  gaps: string[];
};

export const defaultProfile: Profile = {
  firstName: "",
  lastName: "",
  gradYear: 2027,
  homeCountry: "",
  gpa: "",
  gpaScale: "4.0",
  curriculum: "ib",
  satMath: "",
  satEbrw: "",
  satStatus: "planned",
  englishExam: "none",
  englishScore: "",
  countries: [],
  aidNeed: "",
  annualBudget: "0",
  field: "",
  interests: [],
  researchExperience: false,
  recLettersStarted: false,
  activities: "",
  achievements: "",
};

export const demoProfile: Profile = {
  firstName: "Amira",
  lastName: "Hassan",
  gradYear: 2027,
  homeCountry: "Kenya",
  gpa: "3.86",
  gpaScale: "4.0",
  curriculum: "ib",
  satMath: "760",
  satEbrw: "710",
  satStatus: "done",
  englishExam: "ielts",
  englishScore: "7.5",
  countries: ["us", "ca", "ae"],
  aidNeed: "full",
  annualBudget: "8000",
  field: "cs",
  interests: ["research", "building"],
  researchExperience: true,
  recLettersStarted: false,
  activities:
    "Robotics captain · Math circle mentor · Built a scholarship-finder web app for classmates",
  achievements: "National olympiad shortlist · School research fair winner (ML for crop disease)",
};
