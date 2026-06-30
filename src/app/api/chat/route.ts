import { NextRequest, NextResponse } from "next/server";
import { CAREER_SYSTEM_PROMPT } from "@/lib/career-context";
import {
  callOpenRouter,
  CHAT_MODEL,
  CHAT_MODEL_FALLBACK,
  getOpenRouterApiKey,
} from "@/lib/openrouter";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  // Finding 1 — rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before asking again." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "API key missing. Add OPENROUTER_API_KEY to your .env file and restart the dev server.",
      },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[] };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Messages array is required." },
      { status: 400 },
    );
  }

  const sanitized = messages
    .filter(
      (m): m is ChatMessage =>
        m &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        (m.role === "user" || m.role === "assistant"),
    )
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 4000),
    }));

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from the user." },
      { status: 400 },
    );
  }

  const openRouterMessages = [
    { role: "system" as const, content: CAREER_SYSTEM_PROMPT }, // Finding 9 — pre-built constant
    ...sanitized,
  ];

  try {
    let result = await callOpenRouter(apiKey, CHAT_MODEL, openRouterMessages);

    // Finding 7 — include 403 in retry set; merge fallback error when both fail
    if (
      !result.ok &&
      (result.status >= 500 ||
        result.status === 429 ||
        result.status === 402 ||
        result.status === 403)
    ) {
      const fallback = await callOpenRouter(
        apiKey,
        CHAT_MODEL_FALLBACK,
        openRouterMessages,
      );
      if (fallback.ok) {
        result = fallback;
      } else {
        // Log both errors for debugging; surface a sanitised message to the client
        console.error(
          "[chat] Both models failed. Primary:",
          result.error,
          "| Fallback:",
          fallback.error,
        );
        return NextResponse.json(
          { error: "The AI assistant is temporarily unavailable. Please try again shortly." },
          { status: 502 },
        );
      }
    }

    if (!result.ok) {
      console.error("[chat] OpenRouter error:", result.error);
      return NextResponse.json(
        { error: "The AI assistant is temporarily unavailable. Please try again shortly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: result.content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chat] Unexpected error:", message);
    return NextResponse.json(
      { error: "The AI assistant is temporarily unavailable. Please try again shortly." },
      { status: 502 },
    );
  }
}
