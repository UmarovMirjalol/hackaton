/**
 * Server-only: evaluate profile quality / readiness with Gemini.
 * Does not calculate matching, invent admissions odds, or choose universities.
 */

import {
  type ProfileEvaluation,
  type ProfileEvaluationContext,
  fallbackProfileEvaluation,
  parseProfileEvaluationText,
  profileEvaluationCacheKey,
} from "@/lib/ai/profile-evaluation-shared";
import { GenerateAIError, generateAIResponse, isGeminiConfigured } from "@/lib/ai/gemini";

export type ProfileEvaluationResult = {
  evaluation: ProfileEvaluation;
  source: "gemini" | "fallback";
  reason?: string;
};

const SYSTEM_INSTRUCTION = `You evaluate an undergraduate applicant PROFILE for the product Route (LOCUS).

Your ONLY job:
- Judge whether the supplied profile fields look complete, credible, and useful for a deterministic college search.
- Flag placeholder / nonsense free text (e.g. "123123", keyboard spam, empty claims).
- Flag scores that are missing or outside normal ranges when the numbers are supplied.
- Tell the student what to improve next in plain language.

You MUST NOT:
- Estimate admission chances, odds, rankings, or "how competitive" someone is
- Choose, rank, or recommend universities
- Invent GPA, test scores, awards, activities, aid facts, or research experience
- Contradict the supplied facts
- Change or invent matching rules

Readiness meaning:
- "thin": too little credible information to trust many signals
- "usable": enough real preferences/academics to run a useful search, with gaps
- "strong": several credible academic + preference signals; free text is real when present

Write for a high-school applicant: clear, calm, specific — not chatbot fluff.
Return ONLY valid JSON matching the schema.`;

const GEMINI_TIMEOUT_MS = 12_000;

const cache = new Map<string, ProfileEvaluationResult>();

export async function generateProfileEvaluation(
  context: ProfileEvaluationContext,
): Promise<ProfileEvaluationResult> {
  const key = profileEvaluationCacheKey(context);
  const cached = cache.get(key);
  if (cached) return cached;

  const fallback: ProfileEvaluationResult = {
    evaluation: fallbackProfileEvaluation(context),
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

    const parsed = parseProfileEvaluationText(result.text);
    if (!parsed) {
      const failed: ProfileEvaluationResult = {
        ...fallback,
        reason: "malformed_response",
      };
      cache.set(key, failed);
      return failed;
    }

    const ok: ProfileEvaluationResult = {
      evaluation: parsed,
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
    const failed: ProfileEvaluationResult = { ...fallback, reason };
    cache.set(key, failed);
    return failed;
  }
}

function buildUserPrompt(context: ProfileEvaluationContext): string {
  return `Evaluate this applicant profile for quality and readiness. Use only these facts.

PROFILE (authoritative):
${JSON.stringify(context, null, 2)}

Hints already computed locally (you may agree or disagree, but do not invent new facts):
- activitiesLookSubstantive=${context.freeText.activitiesLookSubstantive}
- achievementsLookSubstantive=${context.freeText.achievementsLookSubstantive}

Respond with JSON only:
{
  "readiness": "thin" | "usable" | "strong",
  "headline": "short verdict, max ~12 words",
  "summary": "2-4 sentences on what is credible vs weak. No university names. No admissions odds.",
  "credibleSignals": ["one concrete credible signal", "another"],
  "weakOrMissing": ["one weak or missing item", "another"],
  "nextImprovements": ["one concrete next edit", "another"]
}

Rules:
- credibleSignals: 1-5 items, grounded only in supplied fields
- weakOrMissing: 1-5 items; call out placeholders like digit spam when present
- nextImprovements: 1-4 actionable edits the student can make in the profile
- Never invent scores, awards, or research that are not in the input`;
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
