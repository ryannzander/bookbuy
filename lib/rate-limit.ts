/**
 * Sliding-window rate limiter using in-memory Map.
 * Each key (IP or userId) tracks request timestamps within the window.
 * Stale entries are garbage-collected on every check.
 *
 * For production at scale, swap the Map for Upstash Redis
 * (`@upstash/ratelimit`) — same interface, distributed state.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60_000;

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  cleanup(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetMs: oldest + windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: windowMs,
  };
}

// ─── Preset configurations ──────────────────────────────────────

/** Auth routes: 30 requests per 15 minutes per IP (page loads + retries) */
export function authRateLimit(ip: string) {
  return rateLimit(`auth:${ip}`, 30, 15 * 60 * 1000);
}

/** API queries: 200 requests per minute per key */
export function queryRateLimit(key: string) {
  return rateLimit(`query:${key}`, 200, 60 * 1000);
}

/** API mutations: 60 requests per minute per key */
export function mutationRateLimit(key: string) {
  return rateLimit(`mutation:${key}`, 60, 60 * 1000);
}

/** Sensitive mutations (purchase, report, delete): 25 per 5 minutes */
export function sensitiveRateLimit(key: string) {
  return rateLimit(`sensitive:${key}`, 25, 5 * 60 * 1000);
}

/** Search/autocomplete: 60 requests per minute per key */
export function searchRateLimit(key: string) {
  return rateLimit(`search:${key}`, 60, 60 * 1000);
}
