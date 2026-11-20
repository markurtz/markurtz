import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import { getEnv } from "@/lib/env";

import { assertSafeKey, type Bucket, type MediaStorage } from "./index";

/**
 * Local-disk storage for development, tests and CI.
 *
 * - The public bucket is `public/media`, which Next.js serves at `/media`.
 * - The private bucket is `.data/media` (git-ignored), served only by
 *   `/api/media/[...key]` after the HMAC signature and expiry check out.
 */

export const LOCAL_MEDIA_ROUTE = "/api/media";
const PUBLIC_DIR = path.join(process.cwd(), "public", "media");
const PRIVATE_DIR = path.join(process.cwd(), ".data", "media");
// Used only when no session secret is set, for example a CLI run that only
// writes public album files. The media route refuses to serve without a real secret.
const UNSIGNED = "unsigned";

function signingSecret(): string {
  return getEnv().GALLERY_SESSION_SECRET ?? UNSIGNED;
}

/** HMAC over everything that must not be tampered with in a local media URL. */
export function signLocalUrl(
  key: string,
  expires: number,
  downloadAs = "",
  secret = signingSecret(),
): string {
  return createHmac("sha256", secret)
    .update(`${key}\n${expires}\n${downloadAs}`)
    .digest("base64url");
}

/** Checks the signature and expiry of a local media URL. */
export function verifyLocalUrl(
  input: { key: string; expires: number; downloadAs?: string; signature: string },
  now: Date = new Date(),
  secret = signingSecret(),
): boolean {
  if (secret === UNSIGNED) return false;
  if (!Number.isFinite(input.expires) || input.expires * 1000 <= now.getTime()) return false;
  const expected = Buffer.from(
    signLocalUrl(input.key, input.expires, input.downloadAs ?? "", secret),
  );
  const actual = Buffer.from(input.signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function resolvePath(root: string, key: string): string {
  assertSafeKey(key);
  return path.join(root, key);
}

/** Reads a private object. Only the signed media route calls this. */
export async function readLocalPrivate(key: string): Promise<Buffer> {
  return readFile(resolvePath(PRIVATE_DIR, key));
}

export function createLocalStorage(bucket: Bucket): MediaStorage {
  const root = bucket === "public" ? PUBLIC_DIR : PRIVATE_DIR;

  return {
    async put(key, body) {
      const target = resolvePath(root, key);
      await mkdir(path.dirname(target), { recursive: true });
      if (Buffer.isBuffer(body)) await writeFile(target, body);
      else await pipeline(body, createWriteStream(target));
    },
    async signedGetUrl(key, options) {
      assertSafeKey(key);
      if (bucket === "public") return `/media/${key}`;
      const expires = Math.floor(Date.now() / 1000) + options.expiresIn;
      const params = new URLSearchParams({
        e: String(expires),
        s: signLocalUrl(key, expires, options.downloadAs),
      });
      if (options.downloadAs) params.set("dl", options.downloadAs);
      return `${LOCAL_MEDIA_ROUTE}/${key}?${params.toString()}`;
    },
    async delete(keys) {
      await Promise.all(keys.map((key) => rm(resolvePath(root, key), { force: true })));
    },
    async exists(key) {
      try {
        await stat(resolvePath(root, key));
        return true;
      } catch {
        return false;
      }
    },
  };
}
