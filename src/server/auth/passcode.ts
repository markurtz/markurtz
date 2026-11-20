import "server-only";

import { createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { WORDS } from "./wordlist";

/**
 * Passcodes and share tokens. Passcodes are stored only as salted scrypt
 * hashes; share tokens only as SHA-256 hashes (they are random, so a fast hash
 * is enough). All comparisons are constant time.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const SCRYPT = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const TOKEN_BYTES = 32;
const PASSCODE_WORDS = 4;
const SCHEME = "scrypt";

/** Passcodes are compared case-insensitively with surrounding space removed. */
export function normalizePasscode(passcode: string): string {
  return passcode.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Hashes a passcode as `scrypt$N$r$p$salt$hash`. */
export async function hashPasscode(passcode: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await scryptAsync(normalizePasscode(passcode), salt, KEY_LENGTH, SCRYPT);
  return [
    SCHEME,
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

// Compared against when there is no stored hash, so a missing resource costs
// the same time as a wrong passcode and cannot be told apart by timing.
const DUMMY_HASH = hashPasscode(randomBytes(16).toString("hex"));

/** Checks a passcode against a stored hash. A null hash never matches. */
export async function verifyPasscode(
  passcode: string,
  stored: string | null | undefined,
): Promise<boolean> {
  const [scheme, n, r, p, saltText, hashText] = (stored ?? (await DUMMY_HASH)).split("$");
  if (scheme !== SCHEME || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, "base64url");
  const actual = await scryptAsync(
    normalizePasscode(passcode),
    Buffer.from(saltText, "base64url"),
    expected.length,
    {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    },
  );
  return timingSafeEqual(actual, expected) && Boolean(stored);
}

/** A passcode of four random words, such as `maple-river-stone-lamp`. */
export function generatePasscode(): string {
  return Array.from({ length: PASSCODE_WORDS }, () => WORDS[randomInt(WORDS.length)]).join("-");
}

/** A share token with 256 bits of randomness. Show it once; store only its hash. */
export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

/** SHA-256 of a share token, as stored in the database. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
