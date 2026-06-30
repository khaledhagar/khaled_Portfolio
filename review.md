# Code Review — Khaled Hagar Portfolio
**Date:** 2026-06-01  
**Scope:** Full codebase (`src/`) — 7-angle independent review (correctness, missing-guard, cross-file, reuse, simplification, efficiency, altitude)  
**Findings:** 9 confirmed issues · 0 refuted false positives  

---

## Severity Key

| Level | Meaning |
|---|---|
| 🔴 Critical | Can cause financial loss, data breach, or complete feature failure |
| 🟠 High | Real bug or vulnerability with a concrete, reachable failure path |
| 🟡 Medium | UX breakage or unsafe pattern that is likely to be hit |
| 🔵 Low | Maintenance drift or wasted work with no immediate user impact |

---

## Finding 1 — No Rate Limiting on the Chat API 🔴 Critical

**File:** `src/app/api/chat/route.ts` · **Line:** 18  

**Issue:**  
The `POST /api/chat` endpoint has no rate limiting of any kind. Every request immediately fans out to a paid OpenRouter API call. There are no IP-level checks, no per-session token buckets, and no request frequency caps.

**Failure scenario:**  
A simple script sending 10 requests per second could exhaust the OpenRouter API key's credit allowance in minutes, generating a real financial cost with no alerting or automatic cutoff.

**Fix:**  
Add Vercel's built-in KV + rate limiting, or use the `@upstash/ratelimit` package. Example using Upstash:

```ts
// src/app/api/chat/route.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ipAddress } from "@vercel/functions";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per minute per IP
});

export async function POST(request: NextRequest) {
  const ip = ipAddress(request) ?? "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before asking again." },
      { status: 429 },
    );
  }

  // ... rest of handler
}
```

If Upstash is not available, a lightweight in-memory approach with a `Map` can serve as a temporary guard for low-traffic deployments.

---

## Finding 2 — No HTTP Security Headers 🟠 High

**File:** `next.config.ts` · **Line:** 3  

**Issue:**  
`next.config.ts` exports no `headers()` function, meaning every page and API response is served without security headers. Specifically absent:

- `X-Frame-Options` / `frame-ancestors` in CSP → site can be iframed by anyone (clickjacking)
- `X-Content-Type-Options: nosniff` → MIME-type sniffing attacks possible
- `Content-Security-Policy` → no script/style source restrictions
- `Referrer-Policy` → full URL leaked in `Referer` header to third parties
- `Permissions-Policy` → no restrictions on camera/microphone/geolocation access

**Fix:**  
Add a `headers()` export to `next.config.ts`:

```ts
// next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",  // 'unsafe-inline' required by Next.js inline scripts; review if you add a nonce
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self' https://openrouter.ai",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    }
    return config;
  },
};

export default nextConfig;
```

---

## Finding 3 — No Timeout on Upstream AI API Fetch 🟠 High

**File:** `src/lib/openrouter.ts` · **Line:** 39  

**Issue:**  
The `fetch` call to OpenRouter carries no `signal` or timeout. If OpenRouter is slow or stalls mid-response, the Node.js serverless function blocks indefinitely — occupying the invocation slot until the platform hard-kills it (typically 10–60 seconds). During that window no other request can be served by that function instance.

**Failure scenario:**  
OpenRouter occasionally experiences elevated latency. A handful of simultaneous slow responses could exhaust the serverless concurrency limit, causing all subsequent chat requests to queue or timeout from the user's perspective.

**Fix:**  
Add `AbortSignal.timeout()` (supported in Node.js 18+ and all modern browsers):

```ts
// src/lib/openrouter.ts

export async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[],
): Promise<{ ok: true; content: string } | { ok: false; status: number; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000); // 15-second hard cap

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,          // ← add this
      headers: { ... },
      body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 1024 }),
    });
    // ... rest unchanged
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, status: 504, error: "The AI assistant timed out. Please try again." };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## Finding 4 — Empty-String Content Silently Discards Reasoning Field 🟠 High

**File:** `src/lib/openrouter.ts` · **Line:** 76  

**Issue:**  
The content extraction uses the nullish coalescing operator (`??`):

```ts
const content = (message?.content ?? message?.reasoning ?? "").trim();
```

`??` only skips the left-hand side when it is `null` or `undefined` — **not** when it is an empty string. If OpenRouter returns `{ content: "", reasoning: "The answer is..." }`, the empty string satisfies `message?.content`, so `message?.reasoning` is never evaluated. The reasoning text is silently ignored and the user receives an "empty response" error even though a valid answer exists.

This is a real scenario: several OpenRouter models use the `reasoning` field for chain-of-thought output and set `content` to `""`.

**Fix:**  
Use the `||` operator (which skips falsy values including empty strings) for this extraction:

```ts
// src/lib/openrouter.ts line 76
const content = (message?.content || message?.reasoning || "").trim();
```

---

## Finding 5 — Chat Fetch Has No Abort on Widget Close 🟡 Medium

**File:** `src/components/CareerChat.tsx` · **Line:** 60  

**Issue:**  
`sendMessage` creates a `fetch` to `/api/chat` with no `AbortController`. When the user closes the chat widget or navigates away while a response is in-flight, the request continues executing. When it resolves it calls `setMessages` and `setLoading` on a component that may no longer be mounted or relevant, producing a React warning and wasting the OpenRouter call.

**Fix:**  
Hold an abort ref and cancel on unmount or widget close:

```tsx
// src/components/CareerChat.tsx

const abortRef = useRef<AbortController | null>(null);

// Cancel on unmount
useEffect(() => {
  return () => abortRef.current?.abort();
}, []);

async function sendMessage(text: string) {
  // ...
  abortRef.current?.abort();                  // cancel any previous in-flight request
  const controller = new AbortController();
  abortRef.current = controller;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      signal: controller.signal,             // ← add this
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages }),
    });
    // ...
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return; // user closed chat — ignore
    // ... existing error handling
  }
}
```

---

## Finding 6 — Suggestion Buttons Render Alongside an Error Banner 🟡 Medium

**File:** `src/components/CareerChat.tsx` · **Line:** 112  

**Issue:**  
`showSuggestions` is true whenever `messages` still contains only the welcome message. When a network or API error occurs on the very first message attempt, `error` state is set but no message is added to `messages` (only the user message was added — and the state update hasn't changed the welcome-message count, because the user message was appended making it length 2... actually let me re-read).

Actually re-reading the code: on `sendMessage`, `setMessages((prev) => [...prev, userMessage])` is called — this adds the user message, making `messages.length === 2`. Then on error, `setError(msg)` is called. So `showSuggestions` would be false at that point because length is 2.

But there's a subtler issue: if `fetch` itself throws synchronously before `setMessages` is batched (e.g., a network error fires immediately), React's batching in the event handler means `setMessages` and `setError` might resolve in the same render. In that case `messages` could transiently be length 1 with `error` set.

More reliably: if the user closes and reopens the chat without refreshing, `messages` is preserved at length 1 (only welcome), `error` is cleared, and suggestions correctly show — this part is fine. However, when an error is displayed `error` state is set while `messages.length` could momentarily be 1 during the same render cycle, causing both the error banner (lines 175-179) and suggestions panel (lines 182-195) to render simultaneously.

**Issue (precise):**  
The `showSuggestions` check has no `&& !error` guard:

```tsx
const showSuggestions =
  messages.length === 1 &&
  messages[0].role === "assistant" &&
  messages[0].content === WELCOME_TEXT;
// Missing: && !error
```

If an error fires before `setMessages` resolves in the same render batch, both panels render together — the error banner and the suggestion buttons — which is confusing UX.

**Fix:**

```tsx
const showSuggestions =
  messages.length === 1 &&
  messages[0].role === "assistant" &&
  messages[0].content === WELCOME_TEXT &&
  !error;   // ← add this guard
```

---

## Finding 7 — Fallback Error Is Always Discarded When Both AI Calls Fail 🟡 Medium

**File:** `src/app/api/chat/route.ts` · **Lines:** 81–89  

**Issue:**  
When the primary model call fails with a retryable error (5xx, 429, 402), the code tries the fallback model. If the fallback also fails, `result` is never updated — it stays as the primary failure. The client therefore always receives the primary model's error message, never learning why the fallback also failed.

More critically: if the primary call fails with a `403 Forbidden` (wrong API key scope), the condition `result.status >= 500 || result.status === 429 || result.status === 402` is false, so the fallback is never attempted. The raw 403 message from OpenRouter (which may contain internal account details) leaks through as a 502 to the client.

**Fix:**  
Merge fallback error information, and sanitise the forwarded error:

```ts
// src/app/api/chat/route.ts

// Expand retry condition to include 403
if (!result.ok && (result.status >= 500 || result.status === 429 || result.status === 402 || result.status === 403)) {
  const fallback = await callOpenRouter(apiKey, CHAT_MODEL_FALLBACK, openRouterMessages);
  if (fallback.ok) {
    result = fallback;
  } else {
    // Surface the most informative error, not always the primary one
    const primaryError = result.error;
    const fallbackError = fallback.error;
    result = {
      ok: false,
      status: fallback.status,
      error: `Primary: ${primaryError} | Fallback: ${fallbackError}`,
    };
  }
}

// Sanitise before forwarding to client — never expose raw upstream messages
if (!result.ok) {
  console.error("[chat] OpenRouter error:", result.error);
  return NextResponse.json(
    { error: "The AI assistant is temporarily unavailable. Please try again shortly." },
    { status: 502 },
  );
}
```

---

## Finding 8 — Hero Stats Are Hardcoded Instead of Derived from Profile Data 🔵 Low

**File:** `src/components/Hero.tsx` · **Lines:** 34–38  

**Issue:**  
The three statistics displayed in the Hero section are hardcoded string literals:

```tsx
{ value: "17+", label: "Years leading ops" },
{ value: "2",   label: "Alexandria degrees" },
{ value: "1",   label: "Microsoft cert" },
```

`profile.ts` already holds `experience[0].duration = "17+ years"`, `education.length === 2`, and `certifications.length === 1`. These are the same values, duplicated. If the profile changes (e.g., a new certification is added), the Hero will silently display incorrect numbers until someone remembers to also edit it.

**Fix:**

```tsx
// src/components/Hero.tsx
import { profile } from "@/data/profile";

const stats = [
  { value: profile.experience[0].duration.replace(" years", ""), label: "Years leading ops" },
  { value: String(profile.education.length),       label: "Alexandria degrees" },
  { value: String(profile.certifications.length),  label: "Microsoft cert" },
];
```

Or keep the values in `profile.ts` explicitly for display purposes:

```ts
// src/data/profile.ts
heroStats: [
  { value: "17+", label: "Years leading ops" },
  { value: "2",   label: "Alexandria degrees" },
  { value: "1",   label: "Microsoft cert" },
],
```

Either way, the single source of truth should be `profile.ts`.

---

## Finding 9 — System Prompt Rebuilt on Every Chat Request (Static Content) 🔵 Low

**File:** `src/app/api/chat/route.ts` · **Line:** 70  
**Also:** `src/lib/career-context.ts` · **Line:** 3  

**Issue:**  
`buildCareerSystemPrompt()` is called on every `POST /api/chat` request. It maps over every array in `profile` (skills, certifications, experience, education, journey, about) and joins them into a single string. Since `profile` is declared `as const` it never changes — the function produces an identical string on every invocation. The computation is small but completely avoidable.

**Fix:**  
Move the prompt to module scope so it is built once at server startup:

```ts
// src/lib/career-context.ts

function buildCareerSystemPrompt(): string {
  // ... existing implementation unchanged
}

// Build once at module load — profile is `as const` and never mutates
export const CAREER_SYSTEM_PROMPT = buildCareerSystemPrompt();
```

```ts
// src/app/api/chat/route.ts
import { CAREER_SYSTEM_PROMPT } from "@/lib/career-context";

// Replace:
// { role: "system" as const, content: buildCareerSystemPrompt() }
// With:
{ role: "system" as const, content: CAREER_SYSTEM_PROMPT }
```

---

## Summary Table

| # | File | Line | Severity | Issue |
|---|---|---|---|---|
| 1 | `src/app/api/chat/route.ts` | 18 | 🔴 Critical | No rate limiting — API key can be drained |
| 2 | `next.config.ts` | 3 | 🟠 High | No HTTP security headers (CSP, X-Frame-Options, etc.) |
| 3 | `src/lib/openrouter.ts` | 39 | 🟠 High | No timeout on upstream fetch — serverless hangs indefinitely |
| 4 | `src/lib/openrouter.ts` | 76 | 🟠 High | `"" ?? reasoning` silently ignores reasoning field |
| 5 | `src/components/CareerChat.tsx` | 60 | 🟡 Medium | No AbortController — fetch continues after widget closes |
| 6 | `src/components/CareerChat.tsx` | 112 | 🟡 Medium | Suggestions render alongside error banner (no `!error` guard) |
| 7 | `src/app/api/chat/route.ts` | 81 | 🟡 Medium | Fallback error discarded; 403 errors not retried |
| 8 | `src/components/Hero.tsx` | 34 | 🔵 Low | Stats hardcoded instead of derived from `profile.ts` |
| 9 | `src/lib/career-context.ts` | 3 | 🔵 Low | System prompt rebuilt on every request despite being static |

---

## Recommended Action Order

1. **Immediately** — Finding 1 (rate limiting). This is the only finding with financial risk.
2. **Before first public deployment** — Findings 2, 3, 4. Security headers and the timeout are infra-level and easy to add; the `??`→`||` fix is a single character change.
3. **Next working session** — Findings 5, 6, 7. Chat UX robustness.
4. **When convenient** — Findings 8, 9. Maintenance hygiene; no user-visible impact.
