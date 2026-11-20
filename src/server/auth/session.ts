import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site";

import { isSecureRequest } from "./request";

/**
 * The passcode session: a signed cookie listing what this browser has unlocked.
 * A grant only says "the right passcode was entered at version v". Every
 * request re-checks it against the database (see access.ts), so changing a
 * passcode revokes outstanding grants immediately.
 */

export type GrantKind = "gallery" | "collection" | "gate";

/** Proof that a passcode was entered for a resource. */
export interface Grant {
  kind: GrantKind;
  id: string;
  /** The resource's `access_version` when the passcode was entered. */
  v: number;
  /** Expiry, in seconds since the epoch. */
  exp: number;
}

const ALGORITHM = "HS256";
const MAX_GRANTS = 20;
const DAY_SECONDS = 24 * 60 * 60;

/** `__Host-` requires HTTPS, so plain-HTTP development uses an unprefixed name. */
export function grantCookieName(secure: boolean): string {
  return secure ? "__Host-grants" : "grants";
}

/** The key that signs session cookies. */
export function sessionSecret(): Uint8Array {
  const secret = getEnv().GALLERY_SESSION_SECRET;
  if (!secret) throw new Error("GALLERY_SESSION_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

function isGrant(value: unknown): value is Grant {
  if (typeof value !== "object" || value === null) return false;
  const grant = value as Record<string, unknown>;
  return (
    (grant.kind === "gallery" || grant.kind === "collection" || grant.kind === "gate") &&
    typeof grant.id === "string" &&
    typeof grant.v === "number" &&
    typeof grant.exp === "number"
  );
}

/** Drops expired grants. */
export function activeGrants(grants: Grant[], now: Date = new Date()): Grant[] {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  return grants.filter((grant) => grant.exp > nowSeconds);
}

/** Adds a grant, replacing any earlier one for the same resource and capping the list. */
export function mergeGrant(grants: Grant[], grant: Grant, now: Date = new Date()): Grant[] {
  const others = activeGrants(grants, now).filter(
    (existing) => !(existing.kind === grant.kind && existing.id === grant.id),
  );
  return [...others, grant].slice(-MAX_GRANTS);
}

/** Signs a list of grants as a compact JWT. */
export async function signGrants(grants: Grant[], secret: Uint8Array): Promise<string> {
  const latest = Math.max(
    ...grants.map((grant) => grant.exp),
    Math.floor(Date.now() / 1000) + DAY_SECONDS,
  );
  return new SignJWT({ grants })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime(latest)
    .sign(secret);
}

/** Verifies a session token. Any invalid, tampered or expired token yields no grants. */
export async function verifyGrants(
  token: string | undefined,
  secret: Uint8Array,
  now: Date = new Date(),
): Promise<Grant[]> {
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
      currentDate: now,
    });
    const grants = Array.isArray(payload.grants) ? payload.grants.filter(isGrant) : [];
    return activeGrants(grants, now);
  } catch {
    return [];
  }
}

/** A new grant that lasts for the configured session length. */
export function newGrant(
  kind: GrantKind,
  id: string,
  version: number,
  now: Date = new Date(),
): Grant {
  return {
    kind,
    id,
    v: version,
    exp: Math.floor(now.getTime() / 1000) + siteConfig.clientArea.sessionDays * DAY_SECONDS,
  };
}

/** The grants in the current request's session cookie. */
export async function readGrants(): Promise<Grant[]> {
  const store = await cookies();
  const name = grantCookieName(await isSecureRequest());
  return verifyGrants(store.get(name)?.value, sessionSecret());
}

/** Adds a grant to the session cookie. Call from a server action or route handler. */
export async function addGrant(grant: Grant): Promise<void> {
  const store = await cookies();
  const secure = await isSecureRequest();
  const name = grantCookieName(secure);
  const grants = mergeGrant(await verifyGrants(store.get(name)?.value, sessionSecret()), grant);
  store.set(name, await signGrants(grants, sessionSecret()), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: siteConfig.clientArea.sessionDays * DAY_SECONDS,
  });
}

/** Clears the passcode session. */
export async function clearGrants(): Promise<void> {
  (await cookies()).delete(grantCookieName(await isSecureRequest()));
}
