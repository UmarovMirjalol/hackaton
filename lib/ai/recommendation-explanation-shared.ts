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
 * Built only from matcher why-text and factor labels already on the card.
 */
export function fallbackRecommendationExplanation(
  context: RecommendationExplanationContext,
): RecommendationExplanation {
  const whyItFits = context.match.why.trim();
  const keyReasons: string[] = [];

  for (const factor of context.match.factors) {
    if (keyReasons.length >= 3) break;
    if (factor.tone === "watch" && keyReasons.length > 0) continue;
    const line = `${factor.label}: ${factor.value}`;
    if (line.length >= 8) keyReasons.push(line);
  }

  if (keyReasons.length < 2) {
    for (const factor of context.match.factors) {
      if (keyReasons.length >= 3) break;
      const line = `${factor.label}: ${factor.value}`;
      if (!keyReasons.includes(line) && line.length >= 8) keyReasons.push(line);
    }
  }

  if (keyReasons.length < 1) {
    keyReasons.push(`${context.university.shortName} stays on your list based on the current profile filters.`);
  }

  return {
    whyItFits:
      whyItFits ||
      `${context.university.name} remains on the list because it matches the constraints already computed for your profile.`,
    keyReasons: keyReasons.slice(0, 3),
  };
}
