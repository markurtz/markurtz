"use server";

import { z } from "zod";

import { getEnv } from "@/lib/env";
import { contactReady, privateAreaReady } from "@/lib/features";
import { siteConfig } from "@/lib/site";
import { hashIp } from "@/server/auth/request";
import { CONTACT_RULE, isRateLimited, recordHit } from "@/server/rate-limit";

import { emailSchema, parseForm, type FormState } from "./shared";

/**
 * The contact form. Mail is sent through Resend's HTTP API with `fetch`, which
 * is a few lines and avoids a dependency. Spam is limited by a honeypot field
 * and a per-IP rate limit.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SENT: FormState = { message: "Thanks. Your message has been sent." };

// Fallback limiter for deployments without a database. It is per server
// instance, so it only slows abuse down; the database limiter is used when available.
const memoryHits = new Map<string, { windowStart: number; count: number }>();

function memoryLimited(key: string, now = Date.now()): boolean {
  const entry = memoryHits.get(key);
  if (!entry || now - entry.windowStart > CONTACT_RULE.windowMs) {
    memoryHits.set(key, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > CONTACT_RULE.limit;
}

async function limited(key: string): Promise<boolean> {
  if (!privateAreaReady()) return memoryLimited(key);
  if (await isRateLimited(key, CONTACT_RULE)) return true;
  await recordHit(key, CONTACT_RULE);
  return false;
}

/** Sends a contact message to `CONTACT_TO_EMAIL`. */
export async function sendContactMessage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const env = getEnv();
  if (!contactReady(env)) return { error: "The contact form is not available." };

  const parsed = parseForm(
    z.object({
      name: z.string().trim().min(1).max(120),
      email: emailSchema,
      message: z.string().trim().min(10).max(5000),
      // Hidden from people. Bots that fill every field reveal themselves.
      website: z.string().max(0).optional(),
    }),
    formData,
  );
  // A filled honeypot gets the success message so the bot learns nothing.
  if (formData.get("website")) return SENT;
  if (!parsed.ok)
    return {
      error: "Please fill in your name, a valid email and a message of at least 10 characters.",
    };

  const { headers } = await import("next/headers");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await limited(`contact:${hashIp(ip, env.IP_HASH_SALT ?? "contact")}`)) {
    return { error: "Too many messages. Please try again later." };
  }

  const { name, email, message } = parsed.data;
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL ?? `${siteConfig.name} <onboarding@resend.dev>`,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `Website message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });
  if (!response.ok) {
    console.error("Contact email failed", response.status);
    return { error: "The message could not be sent. Please try again later." };
  }
  return SENT;
}
