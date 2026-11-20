import "server-only";

import { and, eq, lt, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";

/**
 * A fixed-window rate limiter stored in Postgres, so limits hold across
 * serverless instances. A fixed window allows a short burst across a window
 * boundary (up to twice the limit), which is acceptable for passcode guessing
 * at these limits.
 */

/** A limit: at most `limit` hits per `windowMs`. */
export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

/** Five failed passcode attempts per fifteen minutes, per IP and resource. */
export const UNLOCK_RULE: RateLimitRule = { limit: 5, windowMs: 15 * 60 * 1000 };
/** Sign-in code requests per IP. */
export const SIGN_IN_RULE: RateLimitRule = { limit: 5, windowMs: 15 * 60 * 1000 };
/** Contact form messages per IP. */
export const CONTACT_RULE: RateLimitRule = { limit: 3, windowMs: 60 * 60 * 1000 };

const RETENTION_MS = 24 * 60 * 60 * 1000;

function windowStart(rule: RateLimitRule, now: Date): Date {
  return new Date(Math.floor(now.getTime() / rule.windowMs) * rule.windowMs);
}

/** True when the key has used up its allowance in the current window. */
export async function isRateLimited(
  key: string,
  rule: RateLimitRule,
  now: Date = new Date(),
): Promise<boolean> {
  const db = await getDb();
  const [row] = await db
    .select({ count: rateLimits.count })
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), eq(rateLimits.windowStart, windowStart(rule, now))))
    .limit(1);
  return (row?.count ?? 0) >= rule.limit;
}

/** Counts one hit against the key and returns the total in the current window. */
export async function recordHit(
  key: string,
  rule: RateLimitRule,
  now: Date = new Date(),
): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart: windowStart(rule, now), count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.key, rateLimits.windowStart],
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });
  // Opportunistic cleanup keeps the table small without a scheduled job.
  await db
    .delete(rateLimits)
    .where(lt(rateLimits.windowStart, new Date(now.getTime() - RETENTION_MS)));
  return row?.count ?? 1;
}

/** Clears the key's counter, for example after a successful unlock. */
export async function resetRateLimit(key: string): Promise<void> {
  const db = await getDb();
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
}
