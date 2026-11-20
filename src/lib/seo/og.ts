import { createHmac, timingSafeEqual } from "node:crypto";

import { getEnv } from "@/lib/env";

/**
 * Signing for generated Open Graph image URLs. The image route renders only
 * text this site signed, so nobody can mint a card with their own words on
 * the site's domain or force an unbounded number of renders.
 *
 * The key is `OG_IMAGE_SECRET`, or the session secret when that is the only
 * one set. With neither, a fixed placeholder is used: the site still works,
 * but the signature can be forged, so set `OG_IMAGE_SECRET` in production.
 */

const PLACEHOLDER_KEY = "unsigned-open-graph";
const SIGNATURE_LENGTH = 22;

function signingKey(): string {
  const env = getEnv();
  return env.OG_IMAGE_SECRET ?? env.GALLERY_SESSION_SECRET ?? PLACEHOLDER_KEY;
}

/** The signature for a card's text. */
export function signOgText(title: string, subtitle = "", key: string = signingKey()): string {
  return createHmac("sha256", key)
    .update(`${title}\n${subtitle}`)
    .digest("base64url")
    .slice(0, SIGNATURE_LENGTH);
}

/** True when the signature matches the text. */
export function verifyOgText(
  title: string,
  subtitle: string,
  signature: string,
  key: string = signingKey(),
): boolean {
  const expected = Buffer.from(signOgText(title, subtitle, key));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
