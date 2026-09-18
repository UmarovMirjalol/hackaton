import { NextResponse } from "next/server";
import { generateDiagnosisExplanation } from "@/lib/ai/diagnosis-explanation";
import {
  type DiagnosisExplanationContext,
  fallbackDiagnosisExplanation,
} from "@/lib/ai/diagnosis-explanation-shared";

export const runtime = "nodejs";

/**
 * POST { context: DiagnosisExplanationContext }
 * Always returns a usable explanation (Gemini or deterministic fallback).
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
        explanation: fallbackDiagnosisExplanation(minimalContext()),
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
        explanation: fallbackDiagnosisExplanation(minimalContext()),
      },
      { status: 200 },
    );
  }

  const result = await generateDiagnosisExplanation(context);
  return NextResponse.json({
    ok: true,
    source: result.source,
    reason: result.reason,
    explanation: result.explanation,
  });
}

function extractContext(body: unknown): DiagnosisExplanationContext | null {
  if (!body || typeof body !== "object") return null;
  const ctx = (body as { context?: unknown }).context;
  if (!ctx || typeof ctx !== "object") return null;
  const c = ctx as Record<string, unknown>;

  const diagnosis = c.diagnosis;
  if (!diagnosis || typeof diagnosis !== "object") return null;
  const d = diagnosis as Record<string, unknown>;
  if (typeof d.title !== "string" || typeof d.summary !== "string") return null;
  if (!Array.isArray(d.strengths) || !Array.isArray(d.constraints)) return null;

  const applicant = c.applicant;
  if (!applicant || typeof applicant !== "object") return null;
  const a = applicant as Record<string, unknown>;
  if (typeof a.firstName !== "string") return null;

  const academic = c.academic;
  if (!academic || typeof academic !== "object") return null;
  const ac = academic as Record<string, unknown>;

  return {
    applicant: {
      firstName: String(a.firstName),
      gradYear: typeof a.gradYear === "number" ? a.gradYear : 2027,
      homeCountry: typeof a.homeCountry === "string" ? a.homeCountry : "unspecified",
    },
    academic: {
      field: typeof ac.field === "string" ? ac.field : "Undeclared",
      curriculum: typeof ac.curriculum === "string" ? ac.curriculum : "IB",
      gpa: typeof ac.gpa === "string" ? ac.gpa : null,
      gpaScale: typeof ac.gpaScale === "string" ? ac.gpaScale : "4.0",
      satStatus: typeof ac.satStatus === "string" ? ac.satStatus : "planned",
      satMath: typeof ac.satMath === "string" ? ac.satMath : null,
      satEbrw: typeof ac.satEbrw === "string" ? ac.satEbrw : null,
      englishExam: typeof ac.englishExam === "string" ? ac.englishExam : "none",
      englishScore: typeof ac.englishScore === "string" ? ac.englishScore : null,
    },
    interests: Array.isArray(c.interests) ? c.interests.map(String) : [],
    countries: Array.isArray(c.countries) ? c.countries.map(String) : [],
    aidNeed: typeof c.aidNeed === "string" ? c.aidNeed : "unset",
    annualBudget: typeof c.annualBudget === "string" ? c.annualBudget : null,
    diagnosis: {
      title: d.title,
      summary: d.summary,
      strengths: (d.strengths as unknown[]).map(String),
      constraints: (d.constraints as unknown[]).map(String),
      goals: Array.isArray(d.goals) ? (d.goals as unknown[]).map(String) : [],
      gaps: Array.isArray(d.gaps) ? (d.gaps as unknown[]).map(String) : [],
    },
    searchPriorities: Array.isArray(c.searchPriorities)
      ? c.searchPriorities.map(String)
      : [],
  };
}

function minimalContext(): DiagnosisExplanationContext {
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
    interests: [],
    countries: [],
    aidNeed: "unset",
    annualBudget: null,
    diagnosis: {
      title: "Focused undergraduate applicant",
      summary: "Diagnosis is based on the profile on file.",
      strengths: [],
      constraints: [],
      goals: [],
      gaps: [],
    },
    searchPriorities: ["Strong academic fit"],
  };
}
