import "server-only";

import { createHash } from "node:crypto";

import { headers } from "next/headers";

import { getEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site";

/** Facts about the caller for logging and rate limiting. The raw IP never leaves this module. */
export interface RequestInfo {
  ipHash: string;
  userAgent: string;
}

/** Salted SHA-256 of an IP address. */
export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

const first = (value: string | null): string | undefined =>
  value?.split(",")[0]?.trim() || undefined;

/**
 * The caller's IP address. The header is chosen in order of how far it can be
 * trusted:
 *
 * 1. `CLIENT_IP_HEADER`, when the deployment names the header its own edge
 *    sets (for example `cf-connecting-ip` when Cloudflare proxies the site).
 * 2. `x-vercel-forwarded-for`, which Vercel sets and clients cannot.
 * 3. `x-forwarded-for`, which is only trustworthy when the host overwrites it.
 *
 * Without any of them every caller shares one bucket, which fails closed.
 */
export function clientIp(headerList: Pick<Headers, "get">, trustedHeader?: string): string {
  return (
    (trustedHeader ? first(headerList.get(trustedHeader)) : undefined) ??
    first(headerList.get("x-vercel-forwarded-for")) ??
    first(headerList.get("x-forwarded-for")) ??
    first(headerList.get("x-real-ip")) ??
    "unknown"
  );
}

/**
 * Whether this request arrived over HTTPS, which decides the `Secure` flag
 * and the `__Host-` prefix of session cookies. It comes from the request, with
 * the configured site URL only as a fallback, so a deployment that forgot
 * `NEXT_PUBLIC_SITE_URL` still gets secure cookies.
 */
export async function isSecureRequest(): Promise<boolean> {
  const proto = first((await headers()).get("x-forwarded-proto"));
  if (proto) return proto === "https";
  return siteConfig.url.startsWith("https://");
}

/** The caller's hashed IP and user agent. */
export async function getRequestInfo(): Promise<RequestInfo> {
  const headerList = await headers();
  const ip = clientIp(headerList, getEnv().CLIENT_IP_HEADER);
  const salt = getEnv().IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set.");
  return { ipHash: hashIp(ip, salt), userAgent: headerList.get("user-agent") ?? "" };
}
