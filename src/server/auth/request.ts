import "server-only";

import { createHash } from "node:crypto";

import { headers } from "next/headers";

import { getEnv } from "@/lib/env";

/** Facts about the caller for logging and rate limiting. The raw IP never leaves this module. */
export interface RequestInfo {
  ipHash: string;
  userAgent: string;
}

/** Salted SHA-256 of an IP address. */
export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/** The caller's hashed IP and user agent, from the proxy headers Vercel sets. */
export async function getRequestInfo(): Promise<RequestInfo> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerList.get("x-real-ip") || "unknown";
  const salt = getEnv().IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set.");
  return { ipHash: hashIp(ip, salt), userAgent: headerList.get("user-agent") ?? "" };
}
