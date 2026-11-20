// ## WRITTEN BY AI ##
import { describe, expect, it } from "vitest";

import {
  collectionCanDownload,
  evaluateCollectionAccess,
  evaluateGalleryAccess,
  evaluateGateAccess,
  hasValidGrant,
  isExpired,
} from "@/server/auth/access";
import {
  generatePasscode,
  generateToken,
  hashPasscode,
  hashToken,
  normalizePasscode,
  verifyPasscode,
} from "@/server/auth/passcode";
import { devUserId } from "@/server/auth/provider";
import { hashIp } from "@/server/auth/request";
import {
  activeGrants,
  grantCookieName,
  mergeGrant,
  newGrant,
  signGrants,
  verifyGrants,
  type Grant,
} from "@/server/auth/session";
import { WORDS } from "@/server/auth/wordlist";
import type { Collection, Gallery, Gate } from "@/server/db/schema";

const now = new Date("2026-06-01T12:00:00Z");
const nowSeconds = Math.floor(now.getTime() / 1000);
const past = new Date("2026-05-01T00:00:00Z");
const future = new Date("2026-07-01T00:00:00Z");
const secret = new TextEncoder().encode("unit-test-secret-0123456789abcdef");

const gallery = (overrides: Partial<Gallery> = {}): Gallery => ({
  id: "11111111-1111-4111-8111-111111111111",
  slug: "smith",
  title: "Smith",
  description: "",
  clientName: "",
  shootDate: null,
  coverPhotoId: null,
  status: "published",
  passcodeHash: "scrypt$hash",
  accessVersion: 3,
  allowDownloads: true,
  allowCollections: true,
  expiresAt: null,
  archiveKey: null,
  createdAt: past,
  updatedAt: past,
  ...overrides,
});

const collection = (overrides: Partial<Collection> = {}): Collection => ({
  id: "22222222-2222-4222-8222-222222222222",
  galleryId: gallery().id,
  title: "Picks",
  description: "",
  isFavorites: false,
  createdByUser: null,
  createdByName: null,
  shareTokenHash: "tokenhash",
  passcodeHash: null,
  accessVersion: 1,
  allowDownloads: true,
  expiresAt: null,
  createdAt: past,
  updatedAt: past,
  ...overrides,
});

const gate = (overrides: Partial<Gate> = {}): Gate => ({
  id: "33333333-3333-4333-8333-333333333333",
  key: "sample",
  label: "Sample",
  passcodeHash: "scrypt$hash",
  accessVersion: 1,
  expiresAt: null,
  createdAt: past,
  ...overrides,
});

const grant = (kind: Grant["kind"], id: string, v: number, exp = nowSeconds + 3600): Grant => ({
  kind,
  id,
  v,
  exp,
});

describe("passcodes", () => {
  it("verifies the right passcode and rejects the wrong one", async () => {
    const hash = await hashPasscode("maple-river-stone-lamp");
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(hash).not.toContain("maple");
    expect(await verifyPasscode("maple-river-stone-lamp", hash)).toBe(true);
    expect(await verifyPasscode("maple-river-stone-lamps", hash)).toBe(false);
  });

  it("ignores case and surrounding or inner whitespace", async () => {
    const hash = await hashPasscode("Maple River");
    expect(await verifyPasscode("  maple-river ", hash)).toBe(true);
    expect(normalizePasscode(" A  b ")).toBe("a-b");
  });

  it("salts every hash", async () => {
    expect(await hashPasscode("same")).not.toBe(await hashPasscode("same"));
  });

  it("never matches a missing or malformed hash", async () => {
    expect(await verifyPasscode("anything", null)).toBe(false);
    expect(await verifyPasscode("anything", undefined)).toBe(false);
    expect(await verifyPasscode("anything", "not-a-hash")).toBe(false);
    expect(await verifyPasscode("", null)).toBe(false);
  });

  it("generates four words from the list", () => {
    const words = generatePasscode().split("-");
    expect(words).toHaveLength(4);
    for (const word of words) expect(WORDS).toContain(word);
    expect(new Set(WORDS).size).toBe(256);
  });

  it("generates share tokens with at least 128 bits and stores only a hash", () => {
    const token = generateToken();
    expect(Buffer.from(token, "base64url").byteLength).toBeGreaterThanOrEqual(16);
    expect(generateToken()).not.toBe(token);
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).not.toContain(token);
  });
});

describe("session grants", () => {
  it("round-trips signed grants", async () => {
    const grants = [grant("gallery", "a", 1), grant("gate", "b", 2)];
    expect(await verifyGrants(await signGrants(grants, secret), secret, now)).toEqual(grants);
  });

  it("returns nothing for a missing, tampered or foreign token", async () => {
    const token = await signGrants([grant("gallery", "a", 1)], secret);
    const other = new TextEncoder().encode("another-secret-0123456789abcdefgh");
    expect(await verifyGrants(undefined, secret, now)).toEqual([]);
    expect(await verifyGrants("garbage", secret, now)).toEqual([]);
    expect(await verifyGrants(`${token.slice(0, -2)}xx`, secret, now)).toEqual([]);
    expect(await verifyGrants(token, other, now)).toEqual([]);
  });

  it("rejects unsigned tokens", async () => {
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const unsigned = `${encode({ alg: "none" })}.${encode({ grants: [grant("gallery", "a", 1)] })}.`;
    expect(await verifyGrants(unsigned, secret, now)).toEqual([]);
  });

  it("drops expired and malformed grants", async () => {
    const token = await signGrants(
      [grant("gallery", "old", 1, nowSeconds - 10), grant("gallery", "ok", 1)],
      secret,
    );
    expect((await verifyGrants(token, secret, now)).map((item) => item.id)).toEqual(["ok"]);
    expect(activeGrants([grant("gate", "x", 1, nowSeconds)], now)).toEqual([]);
  });

  it("replaces an earlier grant for the same resource and caps the list", () => {
    const merged = mergeGrant(
      [grant("gallery", "a", 1), grant("gate", "a", 1)],
      grant("gallery", "a", 2),
      now,
    );
    expect(merged).toEqual([grant("gate", "a", 1), grant("gallery", "a", 2)]);
    const many = Array.from({ length: 30 }, (_, index) => grant("gallery", String(index), 1));
    const capped = mergeGrant(many, grant("gallery", "new", 1), now);
    expect(capped).toHaveLength(20);
    expect(capped.at(-1)?.id).toBe("new");
  });

  it("creates grants that expire after the configured session length", () => {
    const created = newGrant("gallery", "a", 4, now);
    expect(created.v).toBe(4);
    expect(created.exp).toBeGreaterThan(nowSeconds);
  });

  it("uses the __Host- prefix only over HTTPS", () => {
    expect(grantCookieName("https://example.com")).toBe("__Host-grants");
    expect(grantCookieName("http://localhost:3000")).toBe("grants");
  });
});

describe("hasValidGrant", () => {
  const resource = { id: "a", accessVersion: 2 };

  it("needs the same kind, id and version, and an unexpired grant", () => {
    expect(hasValidGrant([grant("gallery", "a", 2)], "gallery", resource, now)).toBe(true);
    expect(hasValidGrant([grant("gallery", "a", 1)], "gallery", resource, now)).toBe(false);
    expect(hasValidGrant([grant("gate", "a", 2)], "gallery", resource, now)).toBe(false);
    expect(hasValidGrant([grant("gallery", "b", 2)], "gallery", resource, now)).toBe(false);
    expect(
      hasValidGrant([grant("gallery", "a", 2, nowSeconds - 1)], "gallery", resource, now),
    ).toBe(false);
    expect(hasValidGrant([], "gallery", resource, now)).toBe(false);
  });
});

describe("evaluateGalleryAccess", () => {
  const valid = [grant("gallery", gallery().id, 3)];

  it("allows a visitor holding a current grant", () => {
    expect(evaluateGalleryAccess({ gallery: gallery(), grants: valid, now })).toEqual({
      allowed: true,
    });
  });

  it("denies a missing gallery", () => {
    expect(evaluateGalleryAccess({ gallery: undefined, grants: valid, now })).toEqual({
      allowed: false,
      reason: "missing",
    });
  });

  it("denies without a grant", () => {
    expect(evaluateGalleryAccess({ gallery: gallery(), grants: [], now })).toEqual({
      allowed: false,
      reason: "locked",
    });
  });

  it("revokes sessions when the passcode changes", () => {
    const rotated = gallery({ accessVersion: 4 });
    expect(evaluateGalleryAccess({ gallery: rotated, grants: valid, now })).toEqual({
      allowed: false,
      reason: "locked",
    });
  });

  it("denies a grant for another gallery", () => {
    const other = [grant("gallery", "99999999-9999-4999-8999-999999999999", 3)];
    expect(evaluateGalleryAccess({ gallery: gallery(), grants: other, now }).allowed).toBe(false);
  });

  it("denies draft and archived galleries even with a grant", () => {
    for (const status of ["draft", "archived"] as const) {
      expect(evaluateGalleryAccess({ gallery: gallery({ status }), grants: valid, now })).toEqual({
        allowed: false,
        reason: "unavailable",
      });
    }
  });

  it("denies an expired gallery even with a grant or membership", () => {
    const expired = gallery({ expiresAt: past });
    expect(evaluateGalleryAccess({ gallery: expired, grants: valid, now })).toEqual({
      allowed: false,
      reason: "expired",
    });
    expect(
      evaluateGalleryAccess({ gallery: expired, grants: [], isMember: true, now }).allowed,
    ).toBe(false);
    expect(
      evaluateGalleryAccess({ gallery: gallery({ expiresAt: future }), grants: valid, now })
        .allowed,
    ).toBe(true);
  });

  it("ignores grants when no passcode is set", () => {
    expect(
      evaluateGalleryAccess({ gallery: gallery({ passcodeHash: null }), grants: valid, now })
        .allowed,
    ).toBe(false);
  });

  it("allows invited members without a grant", () => {
    expect(
      evaluateGalleryAccess({
        gallery: gallery({ passcodeHash: null }),
        grants: [],
        isMember: true,
        now,
      }).allowed,
    ).toBe(true);
  });

  it("lets the admin preview drafts and expired galleries", () => {
    expect(
      evaluateGalleryAccess({
        gallery: gallery({ status: "draft", expiresAt: past }),
        grants: [],
        isAdmin: true,
        now,
      }).allowed,
    ).toBe(true);
    expect(
      evaluateGalleryAccess({ gallery: undefined, grants: [], isAdmin: true, now }).allowed,
    ).toBe(false);
  });
});

describe("evaluateCollectionAccess", () => {
  it("allows an open shared collection", () => {
    expect(
      evaluateCollectionAccess({ collection: collection(), gallery: gallery(), grants: [], now }),
    ).toEqual({ allowed: true });
  });

  it("denies a collection that is not shared or does not exist", () => {
    expect(
      evaluateCollectionAccess({
        collection: collection({ shareTokenHash: null }),
        gallery: gallery(),
        grants: [],
        now,
      }).allowed,
    ).toBe(false);
    expect(
      evaluateCollectionAccess({ collection: undefined, gallery: undefined, grants: [], now }),
    ).toEqual({ allowed: false, reason: "missing" });
  });

  it("follows the parent gallery's status and expiry", () => {
    expect(
      evaluateCollectionAccess({
        collection: collection(),
        gallery: gallery({ status: "archived" }),
        grants: [],
        now,
      }),
    ).toEqual({ allowed: false, reason: "unavailable" });
    expect(
      evaluateCollectionAccess({
        collection: collection(),
        gallery: gallery({ expiresAt: past }),
        grants: [],
        now,
      }),
    ).toEqual({ allowed: false, reason: "expired" });
  });

  it("denies after the collection's own expiry", () => {
    expect(
      evaluateCollectionAccess({
        collection: collection({ expiresAt: past }),
        gallery: gallery(),
        grants: [],
        now,
      }),
    ).toEqual({ allowed: false, reason: "expired" });
  });

  it("needs a current grant when the collection has a passcode", () => {
    const locked = collection({ passcodeHash: "scrypt$hash", accessVersion: 2 });
    expect(
      evaluateCollectionAccess({ collection: locked, gallery: gallery(), grants: [], now }),
    ).toEqual({ allowed: false, reason: "locked" });
    expect(
      evaluateCollectionAccess({
        collection: locked,
        gallery: gallery(),
        grants: [grant("collection", locked.id, 1)],
        now,
      }).allowed,
    ).toBe(false);
    expect(
      evaluateCollectionAccess({
        collection: locked,
        gallery: gallery(),
        grants: [grant("collection", locked.id, 2)],
        now,
      }).allowed,
    ).toBe(true);
  });

  it("does not accept a gallery grant in place of a collection grant", () => {
    const locked = collection({ passcodeHash: "scrypt$hash" });
    expect(
      evaluateCollectionAccess({
        collection: locked,
        gallery: gallery(),
        grants: [grant("gallery", gallery().id, 3)],
        now,
      }).allowed,
    ).toBe(false);
  });

  it("never allows downloads beyond the gallery's setting", () => {
    expect(
      collectionCanDownload(
        collection({ allowDownloads: true }),
        gallery({ allowDownloads: false }),
      ),
    ).toBe(false);
    expect(
      collectionCanDownload(
        collection({ allowDownloads: false }),
        gallery({ allowDownloads: true }),
      ),
    ).toBe(false);
    expect(
      collectionCanDownload(
        collection({ allowDownloads: true }),
        gallery({ allowDownloads: true }),
      ),
    ).toBe(true);
  });
});

describe("evaluateGateAccess", () => {
  it("allows only with a current grant on an unexpired gate", () => {
    const valid = [grant("gate", gate().id, 1)];
    expect(evaluateGateAccess({ gate: gate(), grants: valid, now }).allowed).toBe(true);
    expect(evaluateGateAccess({ gate: gate(), grants: [], now })).toEqual({
      allowed: false,
      reason: "locked",
    });
    expect(
      evaluateGateAccess({ gate: gate({ accessVersion: 2 }), grants: valid, now }).allowed,
    ).toBe(false);
    expect(evaluateGateAccess({ gate: gate({ expiresAt: past }), grants: valid, now })).toEqual({
      allowed: false,
      reason: "expired",
    });
    expect(evaluateGateAccess({ gate: undefined, grants: valid, now })).toEqual({
      allowed: false,
      reason: "missing",
    });
  });
});

describe("misc", () => {
  it("treats the expiry instant itself as expired", () => {
    expect(isExpired(now, now)).toBe(true);
    expect(isExpired(future, now)).toBe(false);
    expect(isExpired(null, now)).toBe(false);
  });

  it("hashes IPs with the salt and never returns the address", () => {
    const hash = hashIp("203.0.113.7", "salt-a");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("203.0.113.7");
    expect(hashIp("203.0.113.7", "salt-b")).not.toBe(hash);
  });

  it("derives a stable UUID for development users", () => {
    expect(devUserId("A@Example.com")).toBe(devUserId("a@example.com"));
    expect(devUserId("a@example.com")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
