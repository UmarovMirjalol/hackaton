/**
 * Shared types + deterministic helpers for diagnosis explanations.
 * Safe to import from Client Components (no Gemini SDK).
 */

import type { Diagnosis, Profile } from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";

export type DiagnosisExplanation = {
  summary: string;
  whatMatters: string[];
};

/** Structured context sent to the server — never the full catalog or secrets. */
export type DiagnosisExplanationContext = {
  applicant: {
    firstName: string;
    gradYear: number;
    homeCountry: string;
  };
  academic: {
    field: string;
    curriculum: string;
    gpa: string | null;
    gpaScale: string;
    satStatus: string;
    satMath: string | null;
    satEbrw: string | null;
    englishExam: string;
    englishScore: string | null;
  };
  interests: string[];
  countries: string[];
  aidNeed: string;
  annualBudget: string | null;
  diagnosis: {
    title: string;
    summary: string;
    strengths: string[];
    constraints: string[];
    goals: string[];
    gaps: string[];
  };
  searchPriorities: string[];
};

export function buildDiagnosisExplanationContext(
  profile: Profile,
  diagnosis: Diagnosis,
  searchPriorities: string[],
): DiagnosisExplanationContext {
  return {
    applicant: {
      firstName: profile.firstName.trim() || "Applicant",
      gradYear: profile.gradYear,
      homeCountry: profile.homeCountry.trim() || "unspecified",
    },
    academic: {
      field: profile.field ? fieldLabels[profile.field] : "Undeclared",
      curriculum: profile.curriculum.toUpperCase(),
      gpa: profile.gpa.trim() || null,
      gpaScale: profile.gpaScale,
      satStatus: profile.satStatus,
      satMath: profile.satStatus === "done" && profile.satMath.trim() ? profile.satMath.trim() : null,
      satEbrw: profile.satStatus === "done" && profile.satEbrw.trim() ? profile.satEbrw.trim() : null,
      englishExam: profile.englishExam,
      englishScore: profile.englishScore.trim() || null,
    },
    interests: [...profile.interests],
    countries: profile.countries.map((c) => countryLabels[c] ?? c),
    aidNeed: profile.aidNeed || "unset",
    annualBudget:
      profile.annualBudget.trim() && Number(profile.annualBudget) > 0
        ? profile.annualBudget.trim()
        : null,
    diagnosis: {
      title: diagnosis.title,
      summary: diagnosis.summary,
      strengths: diagnosis.strengths.map((s) => s.label),
      constraints: diagnosis.constraints.map((c) => c.label),
      goals: diagnosis.goals.map((g) => g.label),
      gaps: [...diagnosis.gaps],
    },
    searchPriorities: searchPriorities.slice(0, 5),
  };
}

/** Stable cache key from the relevant diagnosis/profile slice only. */
export function diagnosisExplanationCacheKey(context: DiagnosisExplanationContext): string {
  return JSON.stringify(context);
}

export function validateDiagnosisExplanation(raw: unknown): DiagnosisExplanation | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.summary !== "string") return null;
  const summary = obj.summary.trim();
  if (summary.length < 24 || summary.length > 900) return null;
  if (!Array.isArray(obj.whatMatters)) return null;

  const whatMatters = obj.whatMatters
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length >= 8 && item.length <= 220)
    .slice(0, 4);

  if (whatMatters.length < 1) return null;
  return { summary, whatMatters };
}

/** Parse model text that should be JSON (tolerates optional markdown fences). */
export function parseDiagnosisExplanationText(text: string): DiagnosisExplanation | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();

  try {
    return validateDiagnosisExplanation(JSON.parse(candidate));
  } catch {
    return null;
  }
}

/**
 * Deterministic narrative when Gemini is unavailable or invalid.
 * Uses only supplied diagnosis facts — never invents universities or odds.
 */
export function fallbackDiagnosisExplanation(
  context: DiagnosisExplanationContext,
): DiagnosisExplanation {
  const name = context.applicant.firstName;
  const strengths = context.diagnosis.strengths;
  const constraints = context.diagnosis.constraints;
  const priorities = context.searchPriorities;

  const strengthClause =
    strengths.length > 0
      ? `The diagnosis highlights ${joinList(strengths.slice(0, 3))} as signals already on file`
      : "Academic signals are still thin, so the search leans more on your stated preferences";

  const constraintClause =
    constraints.length > 0
      ? `while ${joinList(constraints.slice(0, 2))} shape what Route will filter for`
      : "without hard constraints forcing an unusually narrow filter yet";

  const priorityClause =
    priorities.length > 0
      ? ` Search priority starts with ${priorities[0].toLowerCase()}.`
      : "";

  const summary = `${name}'s route reads as “${context.diagnosis.title}.” ${strengthClause}, ${constraintClause}.${priorityClause} This explanation restates the diagnosis above — it does not change the ranking rules.`;

  const whatMatters: string[] = [];
  if (strengths[0]) {
    whatMatters.push(`${strengths[0]} is treated as a primary academic signal for the next step.`);
  }
  if (constraints[0]) {
    whatMatters.push(`${constraints[0]} is a search rule, not a weakness to hide.`);
  } else if (context.diagnosis.gaps[0]) {
    whatMatters.push(context.diagnosis.gaps[0]);
  }
  if (priorities[0]) {
    whatMatters.push(`${priorities[0]} leads how campuses will be ordered when you explore.`);
  }
  if (whatMatters.length < 2 && context.academic.field) {
    whatMatters.push(`Intended field on file: ${context.academic.field}.`);
  }
  if (whatMatters.length < 1) {
    whatMatters.push("Route will rank the catalog against the facts already saved in your profile.");
  }

  return { summary, whatMatters: whatMatters.slice(0, 3) };
}

function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
