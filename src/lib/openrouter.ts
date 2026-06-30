const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const CHAT_MODEL = "openai/gpt-oss-120b";
export const CHAT_MODEL_FALLBACK = "openai/gpt-oss-120b:free";

// Finding 3 — hard cap on each upstream call (ms)
const FETCH_TIMEOUT_MS = 15_000;

export function getOpenRouterApiKey(): string | undefined {
  const raw =
    process.env.OPENROUTER_API_KEY ??
    process.env.OPEN_ROUTER_API_KEY ??
    process.env.OPEN_Router_API_KEY;

  const key = raw?.trim().replace(/^["']|["']$/g, "");
  return key && key.length > 0 ? key : undefined;
}

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices?: {
    message?: {
      content?: string | null;
      reasoning?: string | null;
    };
  }[];
  error?: {
    message?: string;
    code?: number | string;
  };
};

export async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[],
): Promise<{ ok: true; content: string } | { ok: false; status: number; error: string }> {
  // Finding 3 — abort after FETCH_TIMEOUT_MS so the serverless slot is never held indefinitely
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "Khaled Hagar Portfolio",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      return {
        ok: false,
        status: 504,
        error: "The AI assistant timed out. Please try again.",
      };
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text();
  let data: OpenRouterResponse = {};

  try {
    data = raw ? (JSON.parse(raw) as OpenRouterResponse) : {};
  } catch {
    return {
      ok: false,
      status: 502,
      error: `OpenRouter returned invalid JSON (HTTP ${response.status}).`,
    };
  }

  if (!response.ok) {
    const message =
      data.error?.message ?? `OpenRouter request failed (HTTP ${response.status}).`;
    return { ok: false, status: response.status, error: message };
  }

  const message = data.choices?.[0]?.message;
  // Finding 4 — use || not ?? so an empty-string content falls through to reasoning
  const content = (message?.content || message?.reasoning || "").trim();

  if (!content) {
    return {
      ok: false,
      status: 502,
      error: "The model returned an empty response. Please try again.",
    };
  }

  return { ok: true, content };
}
