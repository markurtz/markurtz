// ## WRITTEN BY AI ##
import { describe, expect, it } from "vitest";

import { assertSafeKey, galleryArchiveKey, galleryPhotoPrefix, photoKeys } from "@/server/storage";
import { signLocalUrl, verifyLocalUrl } from "@/server/storage/local";

const secret = "unit-test-secret-0123456789abcdef";
const now = new Date("2026-06-01T12:00:00Z");
const expires = Math.floor(now.getTime() / 1000) + 300;

describe("storage keys", () => {
  it("builds the keys for a client photo", () => {
    const storagePrefix = galleryPhotoPrefix("gallery-id", "photo-id");
    expect(photoKeys({ storagePrefix, originalExt: "jpg" })).toEqual({
      original: "galleries/gallery-id/photo-id/original.jpg",
      preview: "galleries/gallery-id/photo-id/preview.webp",
      thumb: "galleries/gallery-id/photo-id/thumb.webp",
    });
    expect(galleryArchiveKey("gallery-id")).toBe("galleries/gallery-id/archive.zip");
  });

  it("rejects keys that could escape the bucket", () => {
    for (const key of ["", "/etc/passwd", "a/../b", "../secret", "a//b", "a/./b"]) {
      expect(() => assertSafeKey(key), key).toThrow(/Unsafe storage key/);
    }
    expect(() => assertSafeKey("galleries/a/b/thumb.webp")).not.toThrow();
  });
});

describe("local signed URLs", () => {
  const key = "galleries/a/b/thumb.webp";

  it("accepts a valid signature before expiry", () => {
    const signature = signLocalUrl(key, expires, "", secret);
    expect(verifyLocalUrl({ key, expires, signature }, now, secret)).toBe(true);
  });

  it("rejects an expired URL", () => {
    const old = Math.floor(now.getTime() / 1000) - 1;
    expect(
      verifyLocalUrl(
        { key, expires: old, signature: signLocalUrl(key, old, "", secret) },
        now,
        secret,
      ),
    ).toBe(false);
  });

  it("rejects a signature moved to another key, expiry or filename", () => {
    const signature = signLocalUrl(key, expires, "", secret);
    expect(
      verifyLocalUrl({ key: "galleries/a/c/thumb.webp", expires, signature }, now, secret),
    ).toBe(false);
    expect(verifyLocalUrl({ key, expires: expires + 1000, signature }, now, secret)).toBe(false);
    expect(verifyLocalUrl({ key, expires, downloadAs: "x.jpg", signature }, now, secret)).toBe(
      false,
    );
  });

  it("rejects garbage and a signature made with another secret", () => {
    expect(verifyLocalUrl({ key, expires, signature: "" }, now, secret)).toBe(false);
    expect(verifyLocalUrl({ key, expires: Number.NaN, signature: "x" }, now, secret)).toBe(false);
    expect(
      verifyLocalUrl(
        { key, expires, signature: signLocalUrl(key, expires, "", "other-secret") },
        now,
        secret,
      ),
    ).toBe(false);
  });

  it("never serves when no real secret is configured", () => {
    const signature = signLocalUrl(key, expires, "", "unsigned");
    expect(verifyLocalUrl({ key, expires, signature }, now, "unsigned")).toBe(false);
  });
});
