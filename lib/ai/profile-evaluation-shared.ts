/**
 * Shared types + deterministic helpers for AI profile evaluation.
 * Safe to import from Client Components (no Gemini SDK).
 *
 * Evaluates profile quality / readiness only.
 * Does not change matching, invent admissions odds, or pick universities.
 */

import { isSubstantiveProfileText } from "@/lib/diagnosis";
import type { Profile } from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";

export type ProfileReadiness = "thin" | "usable" | "strong";

export type ProfileEvaluation = {
  readiness: ProfileReadiness;
  headline: string;
  summary: string;
  credibleSignals: string[];
  weakOrMissing: string[];
  nextImprovements: string[];
};

/** Structured context sent to the server — never the full catalog or secrets. */
export type ProfileEvaluationContext = {
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
  preferences: {
    countries: string[];
    aidNeed: string;
    annualBudget: string | null;
    interests: string[];
    researchExperience: boolean;
  };
  freeText: {
    activities: string | null;
    achievements: string | null;
    activitiesLookSubstantive: boolean;
    achievementsLookSubstantive: boolean;
  };
};

export function buildProfileEvaluationContext(profile: Profile): ProfileEvaluationContext {
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
    preferences: {
      countries: profile.countries.map((c) => countryLabels[c] ?? c),
      aidNeed: profile.aidNeed || "unset",
      annualBudget:
        profile.annualBudget.trim() && Number(profile.annualBudget) > 0
          ? profile.annualBudget.trim()
          : null,
      interests: [...profile.interests],
      researchExperience: profile.researchExperience,
    },
    freeText: {
      activities: profile.activities.trim() || null,
      achievements: profile.achievements.trim() || null,
      activitiesLookSubstantive: isSubstantiveProfileText(profile.activities),
      achievementsLookSubstantive: isSubstantiveProfileText(profile.achievements),
    },
  };
}

export function profileEvaluationCacheKey(context: ProfileEvaluationContext): string {
  return JSON.stringify(context);
}

function asStringList(raw: unknown, minLen: number, maxLen: number, maxItems: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length >= minLen && item.length <= maxLen)
    .slice(0, maxItems);
}

export function validateProfileEvaluation(raw: unknown): ProfileEvaluation | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const readiness = obj.readiness;
  if (readiness !== "thin" && readiness !== "usable" && readiness !== "strong") return null;

  if (typeof obj.headline !== "string" || typeof obj.summary !== "string") return null;
  const headline = obj.headline.trim();
  const summary = obj.summary.trim();
  if (headline.length < 8 || headline.length > 120) return null;
  if (summary.length < 24 || summary.length > 900) return null;

  const credibleSignals = asStringList(obj.credibleSignals, 8, 180, 5);
  const weakOrMissing = asStringList(obj.weakOrMissing, 8, 180, 5);
  const nextImprovements = asStringList(obj.nextImprovements, 8, 180, 4);

  if (credibleSignals.length < 1 && weakOrMissing.length < 1) return null;
  if (nextImprovements.length < 1) return null;

  return {
    readiness,
    headline,
    summary,
    credibleSignals,
    weakOrMissing,
    nextImprovements,
  };
}

export function parseProfileEvaluationText(text: string): ProfileEvaluation | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    return validateProfileEvaluation(JSON.parse(candidate));
  } catch {
    return null;
  }
}

function gpaLooksValid(context: ProfileEvaluationContext): boolean {
  const raw = context.academic.gpa;
  if (!raw) return false;
  const n = Number(raw);
  if (!Number.isFinite(n)) return false;
  if (context.academic.gpaScale === "4.0") return n >= 0 && n <= 4.33;
  if (context.academic.gpaScale === "100") return n >= 0 && n <= 100;
  if (context.academic.gpaScale === "ib") return n >= 0 && n <= 45;
  return false;
}

function satLooksValid(context: ProfileEvaluationContext): boolean {
  if (context.academic.satStatus !== "done" || !context.academic.satMath) return false;
  const n = Number(context.academic.satMath);
  return Number.isFinite(n) && n >= 200 && n <= 800;
}

/**
 * Deterministic evaluation when Gemini is unavailable.
 * Honest about placeholders; never invents odds or campuses.
 */
export function fallbackProfileEvaluation(context: ProfileEvaluationContext): ProfileEvaluation {
  const credibleSignals: string[] = [];
  const weakOrMissing: string[] = [];
  const nextImprovements: string[] = [];

  if (context.academic.field && context.academic.field !== "Undeclared") {
    credibleSignals.push(`Intended field is set to ${context.academic.field}.`);
  } else {
    weakOrMissing.push("Intended field is still undeclared or missing.");
  }

  if (context.preferences.countries.length) {
    credibleSignals.push(
      `Country preferences are set (${context.preferences.countries.slice(0, 3).join(", ")}).`,
    );
  } else {
    weakOrMissing.push("No target countries selected yet.");
  }

  if (context.preferences.aidNeed && context.preferences.aidNeed !== "unset") {
    credibleSignals.push(`Aid need is recorded as “${context.preferences.aidNeed}.”`);
  } else {
    weakOrMissing.push("Aid need is unset, so financial filters stay vague.");
  }

  if (gpaLooksValid(context)) {
    credibleSignals.push(
      `GPA ${context.academic.gpa} on a ${context.academic.gpaScale} scale looks usable.`,
    );
  } else if (context.academic.gpa) {
    weakOrMissing.push("GPA is present but does not match the selected scale.");
    nextImprovements.push("Enter a GPA that fits the scale you selected (for example 0–4.0).");
  } else {
    weakOrMissing.push("No GPA on file yet.");
    nextImprovements.push("Add a GPA so academic strength is not guessed from preferences alone.");
  }

  if (satLooksValid(context)) {
    credibleSignals.push(`SAT Math ${context.academic.satMath} is in a valid score range.`);
  } else if (context.academic.satStatus === "done" && context.academic.satMath) {
    weakOrMissing.push("SAT Math is outside the normal 200–800 range.");
    nextImprovements.push("Correct SAT Math to a real section score between 200 and 800.");
  } else if (context.academic.satStatus === "planned") {
    weakOrMissing.push("SAT is planned, not yet scored.");
  }

  if (context.freeText.activitiesLookSubstantive && context.freeText.activities) {
    credibleSignals.push("Activities text looks like a real description.");
  } else if (context.freeText.activities) {
    weakOrMissing.push("Activities text looks like a placeholder, not a real description.");
    nextImprovements.push("Rewrite activities with roles, projects, or clubs — not random digits.");
  } else {
    weakOrMissing.push("No activities text yet.");
  }

  if (context.freeText.achievementsLookSubstantive && context.freeText.achievements) {
    credibleSignals.push("Achievements text looks usable.");
  } else if (context.freeText.achievements) {
    weakOrMissing.push("Achievements text looks like a placeholder.");
    nextImprovements.push("Replace placeholder achievements with awards, olympiads, or concrete wins.");
  }

  if (context.preferences.researchExperience) {
    credibleSignals.push("Prior research experience is marked.");
  }

  if (context.preferences.interests.length) {
    credibleSignals.push(
      `Interests include ${context.preferences.interests.slice(0, 3).join(", ")}.`,
    );
  }

  let readiness: ProfileReadiness = "thin";
  if (credibleSignals.length >= 5 && weakOrMissing.length <= 2) readiness = "strong";
  else if (credibleSignals.length >= 3) readiness = "usable";

  if (nextImprovements.length < 1) {
    nextImprovements.push(
      readiness === "strong"
        ? "Keep scores and activities specific; Route already has enough to rank campuses."
        : "Fill missing academics and rewrite thin free-text so the diagnosis can trust those signals.",
    );
  }

  const headline =
    readiness === "strong"
      ? "Profile looks ready to explore"
      : readiness === "usable"
        ? "Profile is usable, with a few weak spots"
        : "Profile is still thin";

  const summary = `${context.applicant.firstName}'s profile has ${credibleSignals.length} credible signal${
    credibleSignals.length === 1 ? "" : "s"
  } and ${weakOrMissing.length} weak or missing item${weakOrMissing.length === 1 ? "" : "s"}. This evaluation judges profile quality for Route — it does not estimate admission chances or change campus ranking.`;

  return {
    readiness,
    headline,
    summary,
    credibleSignals: credibleSignals.slice(0, 5),
    weakOrMissing: weakOrMissing.slice(0, 5),
    nextImprovements: nextImprovements.slice(0, 4),
  };
}
