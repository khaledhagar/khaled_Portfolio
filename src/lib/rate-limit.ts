// Sliding-window in-memory rate limiter.
// Suitable for a single-instance deployment (portfolio/hobby scale).
// For multi-instance / edge deployments, replace with Upstash Redis.

const store = new Map<string, number[]>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;  // per IP per window

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (store.get(ip) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  store.set(ip, timestamps);

  if (timestamps.length > MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfterMs = oldest + WINDOW_MS - now;
    return { allowed: false, retryAfterMs };
  }

  return { allowed: true, retryAfterMs: 0 };
}
