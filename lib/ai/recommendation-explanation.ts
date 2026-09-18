/**
 * Server-only: explain an already-ranked recommendation.
 * Does not choose universities, calculate scores, or invent campus facts.
 */

import {
  type RecommendationExplanation,
  type RecommendationExplanationContext,
  fallbackRecommendationExplanation,
  parseRecommendationExplanationText,
  recommendationExplanationCacheKey,
} from "@/lib/ai/recommendation-explanation-shared";
import { GenerateAIError, generateAIResponse, isGeminiConfigured } from "@/lib/ai/gemini";

export type RecommendationExplanationResult = {
  explanation: RecommendationExplanation;
  source: "gemini" | "fallback";
  reason?: string;
  cacheKey: string;
};

const SYSTEM_INSTRUCTION = `You explain an existing university recommendation for the product Route.

Your ONLY job:
- Explain why THIS already-selected campus fits the supplied profile signals.
- Ground every claim in the supplied match reasons, factors, and university metadata.
- Write like a thoughtful admissions advisor: calm, specific, concise.

You MUST NOT:
- Choose, rank, add, or remove universities
- Calculate or invent match scores, fit indices, or admission probabilities
- Invent programs, scholarships, deadlines, requirements, or statistics
- Claim guaranteed admission or “perfect fit”
- Contradict or modify the deterministic match reasons
- Use chatbot phrases (“As an AI…”) or marketing hype

If a detail is missing from the input, do not invent it.
Return ONLY valid JSON matching the schema.`;

const GEMINI_TIMEOUT_MS = 12_000;
const MAX_CONCURRENT = 2;

/** Simple in-memory cache keyed by recommendation/profile context. */
const cache = new Map<string, RecommendationExplanationResult>();

export async function generateRecommendationExplanation(
  context: RecommendationExplanationContext,
): Promise<RecommendationExplanationResult> {
  const key = recommendationExplanationCacheKey(context);
  const cached = cache.get(key);
  if (cached) return cached;

  const fallback: RecommendationExplanationResult = {
    explanation: fallbackRecommendationExplanation(context),
    source: "fallback",
    reason: "deterministic_fallback",
    cacheKey: key,
  };

  if (!isGeminiConfigured()) {
    const result = { ...fallback, reason: "missing_api_key" };
    cache.set(key, result);
    return result;
  }

  try {
    const result = await withTimeout(
      generateAIResponse({
        systemInstruction: SYSTEM_INSTRUCTION,
        json: true,
        prompt: buildUserPrompt(context),
      }),
      GEMINI_TIMEOUT_MS,
    );

    const parsed = parseRecommendationExplanationText(result.text);
    if (!parsed) {
      const failed: RecommendationExplanationResult = {
        ...fallback,
        reason: "malformed_response",
      };
      cache.set(key, failed);
      return failed;
    }

    const ok: RecommendationExplanationResult = {
      explanation: parsed,
      source: "gemini",
      cacheKey: key,
    };
    cache.set(key, ok);
    return ok;
  } catch (err) {
    let reason = "api_error";
    if (err instanceof GenerateAIError) {
      reason = err.code;
    } else if (err instanceof Error && err.message === "timeout") {
      reason = "timeout";
    }
    // Never log profile payloads or full model responses.
    const failed: RecommendationExplanationResult = { ...fallback, reason };
    cache.set(key, failed);
    return failed;
  }
}

/**
 * Process several recommendation contexts with a small concurrency limit.
 * Order of results matches the input order.
 */
export async function generateRecommendationExplanations(
  contexts: RecommendationExplanationContext[],
): Promise<RecommendationExplanationResult[]> {
  const capped = contexts.slice(0, 6);
  const results: RecommendationExplanationResult[] = new Array(capped.length);
  let next = 0;

  async function worker() {
    while (next < capped.length) {
      const index = next;
      next += 1;
      results[index] = await generateRecommendationExplanation(capped[index]);
    }
  }

  const workers = Array.from({ length: Math.min(MAX_CONCURRENT, capped.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}

function buildUserPrompt(context: RecommendationExplanationContext): string {
  return `Explain this deterministic recommendation. Use only these facts.

UNIVERSITY (catalog metadata on file):
${JSON.stringify(context.university, null, 2)}

DETERMINISTIC MATCH (authoritative — do not contradict):
${JSON.stringify(context.match, null, 2)}

PROFILE SIGNALS relevant to this recommendation:
${JSON.stringify(context.profileSignals, null, 2)}

Respond with JSON only:
{
  "whyItFits": "2-3 sentences connecting the profile signals to this campus using only supplied facts. No admission odds.",
  "keyReasons": [
    "one short grounded reason",
    "another short grounded reason",
    "optional third short grounded reason"
  ]
}

Rules for keyReasons: 2-3 items, each one sentence, drawn from supplied match factors or university metadata. Do not invent aid, deadlines, or programs.`;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
