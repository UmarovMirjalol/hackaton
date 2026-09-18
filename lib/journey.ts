import type { Profile } from "./types";
import { profileReady } from "./onboarding";

/**
 * Product journey stages (hackathon core path).
 * Conceptual: Profile → Understand → Explore → Decide → Act
 */
export const JOURNEY = [
  {
    href: "/onboarding",
    id: "profile",
    label: "Profile",
    stage: "Profile",
    purpose: "Build the admissions dossier",
  },
  {
    href: "/analyze",
    id: "analyze",
    label: "Understand",
    stage: "Understand",
    purpose: "Run transparent analysis",
  },
  {
    href: "/results",
    id: "results",
    label: "Explore",
    stage: "Explore",
    purpose: "See why campuses fit",
  },
  {
    href: "/compare",
    id: "compare",
    label: "Decide",
    stage: "Decide",
    purpose: "Trade off shortlist options",
  },
  {
    href: "/roadmap",
    id: "route",
    label: "Act",
    stage: "Act",
    purpose: "Follow the monthly plan",
  },
] as const;

export type JourneyStepId = (typeof JOURNEY)[number]["id"];

export { profileReady };

/** Demo / catalog transparency — never present as verified partnership data. */
export const DEMO_DATA_NOTICE =
  "University catalog entries are demo data for this hackathon. Deadlines and requirements must be verified on each campus site.";

/**
 * Profile completeness from answered fields (0–100).
 * Used in shell journey chrome — not a fake score.
 */
export function profileCompleteness(p: Profile) {
  const meaningful: boolean[] = [
    Boolean(p.firstName.trim()),
    Boolean(p.homeCountry.trim()),
    Boolean(p.gpa.trim()),
    p.satStatus === "done" ? Boolean(p.satMath.trim()) : p.satStatus === "skip" || p.satStatus === "planned",
    p.englishExam === "none" ? true : Boolean(p.englishScore.trim()),
    Boolean(p.field),
    p.interests.length > 0,
    p.countries.length > 0,
    Boolean(p.aidNeed),
    Number(p.annualBudget || 0) > 0 ||
      p.aidNeed === "full" ||
      p.aidNeed === "none" ||
      p.aidNeed === "some" ||
      p.aidNeed === "substantial",
  ];
  const filled = meaningful.filter(Boolean).length;
  return Math.round((filled / meaningful.length) * 100);
}

export function journeyIndex(pathname: string) {
  if (pathname.startsWith("/profile")) return 0;
  if (pathname.startsWith("/diagnosis") || pathname.startsWith("/universities")) return 2;
  if (pathname === "/" ) return -1;
  const i = JOURNEY.findIndex((s) => pathname.startsWith(s.href));
  return i === -1 ? 0 : i;
}

export function stepComplete(id: string, pathname: string, profile: Profile) {
  const idx = journeyIndex(pathname);
  const stepIdx = JOURNEY.findIndex((s) => s.id === id);
  if (stepIdx < 0) return false;
  if (stepIdx < idx) return true;
  if (id === "profile") return profileReady(profile);
  return false;
}

export function journeyState(
  id: string,
  pathname: string,
  profile: Profile,
): "done" | "current" | "upcoming" | "locked" {
  const idx = journeyIndex(pathname);
  const stepIdx = JOURNEY.findIndex((s) => s.id === id);
  if (stepIdx < 0) return "upcoming";
  const ready = profileReady(profile);
  if (stepIdx > 0 && !ready && id !== "profile") return "locked";
  if (stepIdx === idx) return "current";
  if (stepIdx < idx) return "done";
  return "upcoming";
}
