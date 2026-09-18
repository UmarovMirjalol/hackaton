import { NextResponse } from "next/server";
import {
  generateRecommendationExplanation,
  generateRecommendationExplanations,
} from "@/lib/ai/recommendation-explanation";
import {
  type RecommendationExplanationContext,
  fallbackRecommendationExplanation,
} from "@/lib/ai/recommendation-explanation-shared";

export const runtime = "nodejs";

/**
 * POST { context } | { contexts: [...] }
 * Always returns usable explanation(s) (Gemini or deterministic fallback).
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
        explanation: fallbackRecommendationExplanation(minimalContext()),
      },
      { status: 200 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      {
        ok: true,
        source: "fallback",
        reason: "invalid_body",
        explanation: fallbackRecommendationExplanation(minimalContext()),
      },
      { status: 200 },
    );
  }

  const record = body as { context?: unknown; contexts?: unknown };

  if (Array.isArray(record.contexts)) {
    const raw = record.contexts.slice(0, 6);
    const parsed = raw.map((item) => extractContext({ context: item }));
    const valid = parsed.filter((c): c is RecommendationExplanationContext => Boolean(c));

    if (!valid.length) {
      return NextResponse.json(
        {
          ok: true,
          reason: "invalid_contexts",
          results: [],
        },
        { status: 200 },
      );
    }

    const generated = await generateRecommendationExplanations(valid);
    let cursor = 0;
    const results = parsed.map((context) => {
      if (!context) {
        return {
          source: "fallback" as const,
          reason: "invalid_context",
          explanation: fallbackRecommendationExplanation(minimalContext()),
          cacheKey: "invalid",
        };
      }
      const result = generated[cursor];
      cursor += 1;
      return result;
    });

    return NextResponse.json({
      ok: true,
      results: results.map((r) => ({
        source: r.source,
        reason: r.reason,
        explanation: r.explanation,
        cacheKey: r.cacheKey,
      })),
    });
  }

  const context = extractContext(body);
  if (!context) {
    return NextResponse.json(
      {
        ok: true,
        source: "fallback",
        reason: "invalid_context",
        explanation: fallbackRecommendationExplanation(minimalContext()),
      },
      { status: 200 },
    );
  }

  const result = await generateRecommendationExplanation(context);
  return NextResponse.json({
    ok: true,
    source: result.source,
    reason: result.reason,
    explanation: result.explanation,
    cacheKey: result.cacheKey,
  });
}

function extractContext(body: unknown): RecommendationExplanationContext | null {
  if (!body || typeof body !== "object") return null;
  const ctx = (body as { context?: unknown }).context;
  if (!ctx || typeof ctx !== "object") return null;
  const c = ctx as Record<string, unknown>;

  const university = c.university;
  const match = c.match;
  const profileSignals = c.profileSignals;
  if (!university || typeof university !== "object") return null;
  if (!match || typeof match !== "object") return null;
  if (!profileSignals || typeof profileSignals !== "object") return null;

  const u = university as Record<string, unknown>;
  const m = match as Record<string, unknown>;
  const p = profileSignals as Record<string, unknown>;

  if (typeof u.name !== "string" || typeof u.id !== "string") return null;
  if (typeof m.why !== "string" || !Array.isArray(m.factors)) return null;

  return {
    university: {
      id: String(u.id),
      name: String(u.name),
      shortName: typeof u.shortName === "string" ? u.shortName : String(u.name),
      city: typeof u.city === "string" ? u.city : "",
      country: typeof u.country === "string" ? u.country : "",
      aidSummary: typeof u.aidSummary === "string" ? u.aidSummary : "",
      research: typeof u.research === "string" ? u.research : "",
      selectivity: typeof u.selectivity === "string" ? u.selectivity : "",
      programs: Array.isArray(u.programs) ? u.programs.map(String) : [],
      notes: typeof u.notes === "string" ? u.notes : "",
      english: typeof u.english === "string" ? u.english : "",
    },
    match: {
      why: m.why,
      factors: (m.factors as unknown[]).map((factor) => {
        const f = (factor && typeof factor === "object" ? factor : {}) as Record<
          string,
          unknown
        >;
        return {
          label: typeof f.label === "string" ? f.label : "Factor",
          value: typeof f.value === "string" ? f.value : "",
          detail: typeof f.detail === "string" ? f.detail : "",
          tone: typeof f.tone === "string" ? f.tone : "mixed",
        };
      }),
    },
    profileSignals: {
      field: typeof p.field === "string" ? p.field : "Undeclared",
      interests: Array.isArray(p.interests) ? p.interests.map(String) : [],
      aidNeed: typeof p.aidNeed === "string" ? p.aidNeed : "unset",
      annualBudget: typeof p.annualBudget === "string" ? p.annualBudget : null,
      countries: Array.isArray(p.countries) ? p.countries.map(String) : [],
      satStatus: typeof p.satStatus === "string" ? p.satStatus : "planned",
      satMath: typeof p.satMath === "string" ? p.satMath : null,
      englishExam: typeof p.englishExam === "string" ? p.englishExam : "none",
      englishScore: typeof p.englishScore === "string" ? p.englishScore : null,
      researchExperience: Boolean(p.researchExperience),
    },
  };
}

function minimalContext(): RecommendationExplanationContext {
  return {
    university: {
      id: "unknown",
      name: "Campus",
      shortName: "Campus",
      city: "",
      country: "",
      aidSummary: "",
      research: "moderate",
      selectivity: "very",
      programs: [],
      notes: "",
      english: "",
    },
    match: {
      why: "This campus remains on the list based on the current profile filters.",
      factors: [],
    },
    profileSignals: {
      field: "Undeclared",
      interests: [],
      aidNeed: "unset",
      annualBudget: null,
      countries: [],
      satStatus: "planned",
      satMath: null,
      englishExam: "none",
      englishScore: null,
      researchExperience: false,
    },
  };
}
