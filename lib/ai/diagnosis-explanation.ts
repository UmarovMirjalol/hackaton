/**
 * Server-only: generate a concise explanation of an existing diagnosis.
 * Does not calculate matching, invent strengths, or choose universities.
 */

import {
  type DiagnosisExplanation,
  type DiagnosisExplanationContext,
  diagnosisExplanationCacheKey,
  fallbackDiagnosisExplanation,
  parseDiagnosisExplanationText,
} from "@/lib/ai/diagnosis-explanation-shared";
import { GenerateAIError, generateAIResponse, isGeminiConfigured } from "@/lib/ai/gemini";

export type DiagnosisExplanationResult = {
  explanation: DiagnosisExplanation;
  source: "gemini" | "fallback";
  reason?: string;
};

const SYSTEM_INSTRUCTION = `You explain an existing undergraduate admissions diagnosis for the product Route.

Your ONLY job:
- Explain the supplied diagnosis in natural, concise human language.
- Connect the supplied profile signals to the supplied strengths, constraints, and search priorities.
- Stay faithful to the facts provided.

You MUST NOT:
- Calculate matching scores or fit indices
- Choose, rank, or recommend universities
- Invent strengths, weaknesses, requirements, deadlines, statistics, scores, or financial-aid facts
- Make admission guarantees or odds
- Modify or contradict the deterministic diagnosis
- Pretend to know anything not supplied

If a detail is missing from the input, do not invent it.
Write for a high-school applicant: clear, calm, specific — not chatbot fluff.
Return ONLY valid JSON matching the schema.`;

const GEMINI_TIMEOUT_MS = 12_000;

/** Simple in-memory cache keyed by diagnosis/profile context. */
const cache = new Map<string, DiagnosisExplanationResult>();

export async function generateDiagnosisExplanation(
  context: DiagnosisExplanationContext,
): Promise<DiagnosisExplanationResult> {
  const key = diagnosisExplanationCacheKey(context);
  const cached = cache.get(key);
  if (cached) return cached;

  const fallback: DiagnosisExplanationResult = {
    explanation: fallbackDiagnosisExplanation(context),
    source: "fallback",
    reason: "deterministic_fallback",
  };

  if (!isGeminiConfigured()) {
    cache.set(key, { ...fallback, reason: "missing_api_key" });
    return cache.get(key)!;
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

    const parsed = parseDiagnosisExplanationText(result.text);
    if (!parsed) {
      const failed: DiagnosisExplanationResult = {
        ...fallback,
        reason: "malformed_response",
      };
      cache.set(key, failed);
      return failed;
    }

    const ok: DiagnosisExplanationResult = {
      explanation: parsed,
      source: "gemini",
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
    const failed: DiagnosisExplanationResult = { ...fallback, reason };
    cache.set(key, failed);
    return failed;
  }
}

function buildUserPrompt(context: DiagnosisExplanationContext): string {
  return `Explain this deterministic diagnosis. Use only these facts.

DIAGNOSIS (authoritative):
${JSON.stringify(context.diagnosis, null, 2)}

PROFILE SIGNALS (authoritative):
${JSON.stringify(
    {
      applicant: context.applicant,
      academic: context.academic,
      interests: context.interests,
      countries: context.countries,
      aidNeed: context.aidNeed,
      annualBudget: context.annualBudget,
      searchPriorities: context.searchPriorities,
    },
    null,
    2,
  )}

Respond with JSON only:
{
  "summary": "2-4 sentences explaining how the profile signals connect to this diagnosis title and constraints. No university names unless already in the input.",
  "whatMatters": [
    "one short point about what the search should respect",
    "another short point",
    "optional third short point"
  ]
}

Rules for whatMatters: 2-3 items, each one sentence, grounded only in supplied strengths/constraints/priorities.`;
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
