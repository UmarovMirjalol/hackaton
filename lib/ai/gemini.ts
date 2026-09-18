/**
 * Server-side Gemini client for Route.
 * Import only from Server Components, Route Handlers, or other server modules.
 * Never import from Client Components.
 */

import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";

export type GenerateAIResult = {
  text: string;
  model: string;
};

export type GenerateAIErrorCode =
  | "missing_api_key"
  | "empty_prompt"
  | "api_error"
  | "empty_response";

export class GenerateAIError extends Error {
  readonly code: GenerateAIErrorCode;

  constructor(code: GenerateAIErrorCode, message: string) {
    super(message);
    this.name = "GenerateAIError";
    this.code = code;
  }
}

function getApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function isGeminiConfigured(): boolean {
  return Boolean(getApiKey());
}

/**
 * Minimal text generation against Gemini.
 * Does not log or return the API key.
 */
export async function generateAIResponse(input: {
  prompt: string;
  model?: string;
  /** Narrow system role — never include secrets or full catalogs. */
  systemInstruction?: string;
  /** Ask Gemini for JSON (application/json MIME). Caller must validate. */
  json?: boolean;
}): Promise<GenerateAIResult> {
  const prompt = input.prompt?.trim();
  if (!prompt) {
    throw new GenerateAIError("empty_prompt", "Prompt must not be empty.");
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new GenerateAIError(
      "missing_api_key",
      "GEMINI_API_KEY is not configured on the server.",
    );
  }

  const model = input.model?.trim() || getGeminiModel();
  const systemInstruction = input.systemInstruction?.trim();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(input.json ? { responseMimeType: "application/json" } : {}),
      },
    });

    const text = response.text?.trim() ?? "";
    if (!text) {
      throw new GenerateAIError(
        "empty_response",
        "Gemini returned an empty response.",
      );
    }

    return { text, model };
  } catch (err) {
    if (err instanceof GenerateAIError) throw err;
    const message = err instanceof Error ? err.message : "Unknown Gemini API error.";
    throw new GenerateAIError("api_error", message);
  }
}
