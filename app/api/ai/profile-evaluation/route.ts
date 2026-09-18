import { NextResponse } from "next/server";
import { generateProfileEvaluation } from "@/lib/ai/profile-evaluation";
import {
  type ProfileEvaluationContext,
  fallbackProfileEvaluation,
} from "@/lib/ai/profile-evaluation-shared";

export const runtime = "nodejs";

/**
 * POST { context: ProfileEvaluationContext }
 * Always returns a usable evaluation (Gemini or deterministic fallback).
 * Never exposes GEMINI_API_KEY. Does not log profile payloads.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: true,
        source: "fallback",
        reason: "invalid_json",
        evaluation: fallbackProfileEvaluation(minimalContext()),
      },
      { status: 200 },
    );
  }

  const context = extractContext(body);
  if (!context) {
    return NextResponse.json(
      {
        ok: true,
        source: "fallback",
        reason: "invalid_context",
        evaluation: fallbackProfileEvaluation(minimalContext()),
      },
      { status: 200 },
    );
  }

  const result = await generateProfileEvaluation(context);
  return NextResponse.json({
    ok: true,
    source: result.source,
    reason: result.reason,
    evaluation: result.evaluation,
  });
}

function extractContext(body: unknown): ProfileEvaluationContext | null {
  if (!body || typeof body !== "object") return null;
  const ctx = (body as { context?: unknown }).context;
  if (!ctx || typeof ctx !== "object") return null;
  const c = ctx as Record<string, unknown>;

  const applicant = c.applicant;
  const academic = c.academic;
  const preferences = c.preferences;
  const freeText = c.freeText;
  if (!applicant || typeof applicant !== "object") return null;
  if (!academic || typeof academic !== "object") return null;
  if (!preferences || typeof preferences !== "object") return null;
  if (!freeText || typeof freeText !== "object") return null;

  const a = applicant as Record<string, unknown>;
  const ac = academic as Record<string, unknown>;
  const p = preferences as Record<string, unknown>;
  const f = freeText as Record<string, unknown>;

  if (typeof a.firstName !== "string") return null;
  if (typeof ac.field !== "string" || typeof ac.curriculum !== "string") return null;
  if (typeof ac.gpaScale !== "string" || typeof ac.satStatus !== "string") return null;
  if (typeof ac.englishExam !== "string") return null;
  if (!Array.isArray(p.countries) || !Array.isArray(p.interests)) return null;
  if (typeof p.aidNeed !== "string" || typeof p.researchExperience !== "boolean") return null;
  if (typeof f.activitiesLookSubstantive !== "boolean") return null;
  if (typeof f.achievementsLookSubstantive !== "boolean") return null;

  return {
    applicant: {
      firstName: String(a.firstName),
      gradYear: typeof a.gradYear === "number" ? a.gradYear : 2027,
      homeCountry: typeof a.homeCountry === "string" ? a.homeCountry : "unspecified",
    },
    academic: {
      field: String(ac.field),
      curriculum: String(ac.curriculum),
      gpa: typeof ac.gpa === "string" ? ac.gpa : ac.gpa === null ? null : null,
      gpaScale: String(ac.gpaScale),
      satStatus: String(ac.satStatus),
      satMath: typeof ac.satMath === "string" ? ac.satMath : null,
      satEbrw: typeof ac.satEbrw === "string" ? ac.satEbrw : null,
      englishExam: String(ac.englishExam),
      englishScore: typeof ac.englishScore === "string" ? ac.englishScore : null,
    },
    preferences: {
      countries: p.countries.map(String),
      aidNeed: String(p.aidNeed),
      annualBudget: typeof p.annualBudget === "string" ? p.annualBudget : null,
      interests: p.interests.map(String),
      researchExperience: Boolean(p.researchExperience),
    },
    freeText: {
      activities: typeof f.activities === "string" ? f.activities : null,
      achievements: typeof f.achievements === "string" ? f.achievements : null,
      activitiesLookSubstantive: Boolean(f.activitiesLookSubstantive),
      achievementsLookSubstantive: Boolean(f.achievementsLookSubstantive),
    },
  };
}

function minimalContext(): ProfileEvaluationContext {
  return {
    applicant: { firstName: "Applicant", gradYear: 2027, homeCountry: "unspecified" },
    academic: {
      field: "Undeclared",
      curriculum: "IB",
      gpa: null,
      gpaScale: "4.0",
      satStatus: "planned",
      satMath: null,
      satEbrw: null,
      englishExam: "none",
      englishScore: null,
    },
    preferences: {
      countries: [],
      aidNeed: "unset",
      annualBudget: null,
      interests: [],
      researchExperience: false,
    },
    freeText: {
      activities: null,
      achievements: null,
      activitiesLookSubstantive: false,
      achievementsLookSubstantive: false,
    },
  };
}
