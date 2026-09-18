/**
 * Shared types + deterministic helpers for recommendation explanations.
 * Safe to import from Client Components (no Gemini SDK).
 */

import type { Factor, Profile, RankedUniversity } from "@/lib/types";
import { countryLabels, fieldLabels } from "@/lib/universities";

export type RecommendationExplanation = {
  whyItFits: string;
  keyReasons: string[];
};

/** Structured context sent to the server — never the full catalog or secrets. */
export type RecommendationExplanationContext = {
  university: {
    id: string;
    name: string;
    shortName: string;
    city: string;
    country: string;
    aidSummary: string;
    research: string;
    selectivity: string;
    programs: string[];
    notes: string;
    english: string;
  };
  match: {
    /** Deterministic narrative already computed by the matcher — authoritative. */
    why: string;
    factors: { label: string; value: string; detail: string; tone: string }[];
  };
  profileSignals: {
    field: string;
    interests: string[];
    aidNeed: string;
    annualBudget: string | null;
    countries: string[];
    satStatus: string;
    satMath: string | null;
    englishExam: string;
    englishScore: string | null;
    researchExperience: boolean;
  };
};

export function buildRecommendationExplanationContext(
  profile: Profile,
  row: RankedUniversity,
): RecommendationExplanationContext {
  const u = row.university;
  return {
    university: {
      id: u.id,
      name: u.name,
      shortName: u.shortName,
      city: u.city,
      country: u.country,
      aidSummary: u.aid.summary,
      research: u.research,
      selectivity: u.selectivity,
      programs: u.programs.map((p) => fieldLabels[p] ?? p),
      notes: u.notes,
      english: u.english,
    },
    match: {
      why: row.why,
      factors: row.factors.map((f: Factor) => ({
        label: f.label,
        value: f.value,
        detail: f.detail,
        tone: f.tone,
      })),
    },
    profileSignals: {
      field: profile.field ? fieldLabels[profile.field] : "Undeclared",
      interests: [...profile.interests],
      aidNeed: profile.aidNeed || "unset",
      annualBudget:
        profile.annualBudget.trim() && Number(profile.annualBudget) > 0
          ? profile.annualBudget.trim()
          : null,
      countries: profile.countries.map((c) => countryLabels[c] ?? c),
      satStatus: profile.satStatus,
      satMath: profile.satStatus === "done" && profile.satMath.trim() ? profile.satMath.trim() : null,
      englishExam: profile.englishExam,
      englishScore: profile.englishScore.trim() || null,
      researchExperience: profile.researchExperience,
    },
  };
}

export function recommendationExplanationCacheKey(
  context: RecommendationExplanationContext,
): string {
  return JSON.stringify(context);
}

export function validateRecommendationExplanation(
  raw: unknown,
): RecommendationExplanation | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.whyItFits !== "string") return null;
  const whyItFits = obj.whyItFits.trim();
  if (whyItFits.length < 24 || whyItFits.length > 700) return null;
  if (!Array.isArray(obj.keyReasons)) return null;

  const keyReasons = obj.keyReasons
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length >= 8 && item.length <= 180)
    .slice(0, 4);

  if (keyReasons.length < 1) return null;
  return { whyItFits, keyReasons };
}

export function parseRecommendationExplanationText(
  text: string,
): RecommendationExplanation | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();

  try {
    return validateRecommendationExplanation(JSON.parse(candidate));
  } catch {
    return null;
  }
}

/**
 * Deterministic narrative when Gemini is unavailable or invalid.
 * Built from match factors — not a verbatim copy of the match-reasons paragraph.
 */
export function fallbackRecommendationExplanation(
  context: RecommendationExplanationContext,
): RecommendationExplanation {
  const uni = context.university.shortName;
  const field = context.profileSignals.field;
  const aidNeed = context.profileSignals.aidNeed;
  const factors = context.match.factors;

  const academic = factors.find((f) => f.label === "Academic fit");
  const research = factors.find((f) => f.label === "Research");
  const financial = factors.find((f) => f.label === "Financial aid");
  const location = factors.find((f) => f.label === "Location");

  const clauses: string[] = [];
  if (academic?.value) {
    if (/^offers\s+/i.test(academic.value)) {
      clauses.push(`${academic.value.toLowerCase()} for your ${field} direction`);
    } else if (academic.tone === "good") {
      clauses.push(`academic fit is “${academic.value.toLowerCase()}” for ${field}`);
    } else {
      clauses.push(`academic overlap is limited (${academic.value.toLowerCase()})`);
    }
  }
  if (financial?.value) {
    clauses.push(
      `aid reads as “${financial.value.toLowerCase()}” against your ${aidNeed} priority`,
    );
  }
  if (
    research?.value &&
    (context.profileSignals.interests.includes("research") ||
      context.profileSignals.researchExperience)
  ) {
    clauses.push(research.value.toLowerCase());
  } else if (location?.value) {
    clauses.push(location.value.toLowerCase());
  }

  const joined =
    clauses.length === 0
      ? "it still passes the filters already applied to your profile"
      : clauses.length === 1
        ? clauses[0]
        : clauses.length === 2
          ? `${clauses[0]}, and ${clauses[1]}`
          : `${clauses.slice(0, -1).join(", ")}, and ${clauses[clauses.length - 1]}`;

  const whyItFits = `${uni} stays on this shortlist because ${joined}. This note restates the match factors above — it does not change the ranking.`;

  const keyReasons: string[] = [];
  for (const factor of factors) {
    if (keyReasons.length >= 3) break;
    if (factor.tone === "watch" && keyReasons.length > 0) continue;
    const line = `${factor.label}: ${factor.value}`;
    if (line.length >= 8) keyReasons.push(line);
  }
  if (keyReasons.length < 2) {
    for (const factor of factors) {
      if (keyReasons.length >= 3) break;
      const line = `${factor.label}: ${factor.value}`;
      if (!keyReasons.includes(line) && line.length >= 8) keyReasons.push(line);
    }
  }
  if (keyReasons.length < 1) {
    keyReasons.push(
      `${uni} stays on your list based on the current profile filters.`,
    );
  }

  return {
    whyItFits,
    keyReasons: keyReasons.slice(0, 3),
  };
}
