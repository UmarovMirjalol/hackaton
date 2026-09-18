import type { Profile } from "./types";

/**
 * Profile fields that feed diagnosis, matching, roadmap, and AI explanation context.
 * Used to invalidate shortlist/compare/task state when the route inputs change.
 */
export const ROUTE_INPUT_KEYS = [
  "field",
  "interests",
  "countries",
  "aidNeed",
  "annualBudget",
  "satStatus",
  "satMath",
  "satEbrw",
  "englishExam",
  "englishScore",
  "researchExperience",
  "gpa",
  "gpaScale",
  "curriculum",
  "gradYear",
  "activities",
  "achievements",
  "homeCountry",
  "recLettersStarted",
] as const satisfies readonly (keyof Profile)[];

export type RouteInputKey = (typeof ROUTE_INPUT_KEYS)[number];

/** Stable fingerprint of matching/diagnosis-relevant profile inputs. */
export function routeInputFingerprint(profile: Profile): string {
  return JSON.stringify({
    field: profile.field,
    interests: profile.interests,
    countries: profile.countries,
    aidNeed: profile.aidNeed,
    annualBudget: profile.annualBudget,
    satStatus: profile.satStatus,
    satMath: profile.satMath,
    satEbrw: profile.satEbrw,
    englishExam: profile.englishExam,
    englishScore: profile.englishScore,
    researchExperience: profile.researchExperience,
    gpa: profile.gpa,
    gpaScale: profile.gpaScale,
    curriculum: profile.curriculum,
    gradYear: profile.gradYear,
    activities: profile.activities,
    achievements: profile.achievements,
    homeCountry: profile.homeCountry,
    recLettersStarted: profile.recLettersStarted,
  });
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return false;
}

/** True when a profile patch changes any route-input field. */
export function routeInputsChanged(
  previous: Profile,
  patch: Partial<Profile>,
): boolean {
  for (const key of ROUTE_INPUT_KEYS) {
    if (!(key in patch)) continue;
    if (!valuesEqual(previous[key], patch[key])) return true;
  }
  return false;
}
