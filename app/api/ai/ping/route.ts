import { NextResponse } from "next/server";
import {
  GenerateAIError,
  generateAIResponse,
  getGeminiModel,
  isGeminiConfigured,
} from "@/lib/ai/gemini";

export const runtime = "nodejs";

/**
 * Safe server-side ping for Gemini connectivity.
 * Does not use profile data. Does not expose the API key.
 *
 * POST { "prompt"?: string }  — optional tiny prompt (capped)
 * GET                         — uses a fixed health prompt
 */
async function handlePing(prompt: string) {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "missing_api_key",
        message: "Set GEMINI_API_KEY on the server to enable Gemini.",
        model: getGeminiModel(),
      },
      { status: 503 },
    );
  }

  try {
    const result = await generateAIResponse({ prompt });
    return NextResponse.json({
      ok: true,
      configured: true,
      model: result.model,
      text: result.text,
    });
  } catch (err) {
    if (err instanceof GenerateAIError) {
      const status = err.code === "missing_api_key" ? 503 : 502;
      return NextResponse.json(
        {
          ok: false,
          configured: isGeminiConfigured(),
          error: err.code,
          message: err.message,
          model: getGeminiModel(),
        },
        { status },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: "api_error",
        message: "Unexpected server error calling Gemini.",
        model: getGeminiModel(),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return handlePing("Reply with exactly: ok");
}

export async function POST(request: Request) {
  let prompt = "Reply with exactly: ok";
  try {
    const body = (await request.json()) as { prompt?: unknown };
    if (typeof body?.prompt === "string" && body.prompt.trim()) {
      // Cap length — this is a connectivity check only.
      prompt = body.prompt.trim().slice(0, 200);
    }
  } catch {
    // Empty / invalid JSON → default health prompt
  }
  return handlePing(prompt);
}
