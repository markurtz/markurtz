import "server-only";

import type { Readable } from "node:stream";

import { getEnv } from "@/lib/env";

/**
 * Media storage behind one small interface, so the client area and the photos
 * CLI do not care where files live.
 *
 * - `r2`: Cloudflare R2 through the S3 API. Zero egress fees.
 * - `local`: the local disk, for development, tests and CI. Private files are
 *   served by a route that checks an HMAC signature (`/api/media/...`).
 *
 * There are two buckets: `public` holds public album derivatives; `private`
 * holds client gallery files and is reachable only through signed URLs.
 */

export type Bucket = "public" | "private";

export interface PutOptions {
  contentType: string;
  cacheControl?: string;
  /** Required by S3-compatible stores when the body is a stream. */
  contentLength?: number;
}

export interface SignedUrlOptions {
  /** Seconds until the URL stops working. */
  expiresIn: number;
  /** When set, the browser saves the file under this name instead of showing it. */
  downloadAs?: string;
  /**
   * The moment the URL counts as signed (default: now). Passing the start of
   * a time bucket makes every URL signed within that bucket identical, so the
   * browser can reuse cached images instead of fetching them again.
   */
  signedAt?: Date;
}

/**
 * A `Content-Disposition: attachment` value that is valid for any file name:
 * an ASCII fallback plus the RFC 5987 form that carries the real name.
 */
export function attachmentDisposition(filename: string): string {
  const clean = filename.replace(/[\r\n]/g, " ");
  const ascii = clean
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/["\\]/g, "_")
    .trim();
  const encoded = encodeURIComponent(clean).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename="${ascii || "download"}"; filename*=UTF-8''${encoded}`;
}

export interface MediaStorage {
  put(key: string, body: Buffer | Readable, options: PutOptions): Promise<void>;
  /** A short-lived URL for one object. Signing is local: no network call. */
  signedGetUrl(key: string, options: SignedUrlOptions): Promise<string>;
  delete(keys: string[]): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/** Keys are built by this application, but reject anything that could escape the bucket anyway. */
export function assertSafeKey(key: string): void {
  if (
    !key ||
    key.startsWith("/") ||
    key.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    throw new Error(`Unsafe storage key: ${key}`);
  }
}

const instances = new Map<Bucket, Promise<MediaStorage>>();

/** The storage driver for a bucket, chosen by `STORAGE_DRIVER`. */
export function getStorage(bucket: Bucket): Promise<MediaStorage> {
  let instance = instances.get(bucket);
  if (!instance) {
    instance =
      getEnv().STORAGE_DRIVER === "local"
        ? import("./local").then((module) => module.createLocalStorage(bucket))
        : import("./r2").then((module) => module.createR2Storage(bucket));
    instances.set(bucket, instance);
  }
  return instance;
}

// ── Keys ────────────────────────────────────────────────────────────────────

/** Cache policy for private previews and thumbnails: the visitor's own browser only. */
export const PRIVATE_IMAGE_CACHE = "private, max-age=3600";

/** Long edge, in pixels, of the derivatives made for client galleries. */
export const PRIVATE_DERIVATIVES = { preview: 2560, thumb: 640 } as const;

/** Folder holding one client photo's files. Photo ids are random UUIDs. */
export function galleryPhotoPrefix(galleryId: string, photoId: string): string {
  return `galleries/${galleryId}/${photoId}`;
}

/** Key of a gallery's prebuilt zip of all originals. */
export function galleryArchiveKey(galleryId: string): string {
  return `galleries/${galleryId}/archive.zip`;
}

/** The keys of every file stored for one client photo. */
export function photoKeys(photo: { storagePrefix: string; originalExt: string }) {
  return {
    original: `${photo.storagePrefix}/original.${photo.originalExt}`,
    preview: `${photo.storagePrefix}/preview.webp`,
    thumb: `${photo.storagePrefix}/thumb.webp`,
  };
}
