// ## WRITTEN BY AI ##
import { randomUUID } from "node:crypto";

import { sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { hashPasscode } from "@/server/auth/passcode";
import {
  addPhotosToCollection,
  createCollection,
  getOrCreateFavorites,
  getPhotoInCollection,
  listCollectionPhotoIds,
  listCollections,
  removePhotosFromCollection,
  revokeGalleryShares,
  revokeMemberShares,
  setCollectionPasscode,
  togglePhotoInCollection,
  updateCollection,
} from "@/server/dal/collections";
import {
  archiveExpiredGalleries,
  createGallery,
  deleteGallery,
  getGalleryById,
  getGalleryBySlug,
  setGalleryPasscode,
  updateGallery,
} from "@/server/dal/galleries";
import {
  deletePhoto,
  getPhotoInGallery,
  insertPhoto,
  listAllPhotos,
  movePhoto,
  reorderPhotos,
} from "@/server/dal/photos";
import type { Db } from "@/server/db/client";
import { recordEvent, listRecentEvents } from "@/server/dal/events";
import {
  consumeAttempt,
  isRateLimited,
  recordHit,
  resetRateLimit,
  type RateLimitRule,
} from "@/server/rate-limit";

import { useTestDb } from "../setup/db";

let db: Db;

beforeAll(async () => {
  db = await useTestDb();
});

/** Inserts a photo row and returns its id. */
async function addPhoto(galleryId: string, name: string): Promise<string> {
  const id = randomUUID();
  await insertPhoto({
    id,
    galleryId,
    filename: `${name}.jpg`,
    storagePrefix: `galleries/${galleryId}/${id}`,
    originalExt: "jpg",
    contentHash: `hash-${galleryId}-${name}`,
    width: 300,
    height: 200,
    bytes: 1024,
    contentType: "image/jpeg",
    thumbhash: "",
  });
  return id;
}

describe("database schema", () => {
  it("enables row level security on every table", async () => {
    // postgres.js returns the rows themselves and PGlite wraps them in `rows`.
    const result: unknown = await db.execute(
      sql`select tablename, rowsecurity from pg_tables where schemaname = 'public'`,
    );
    const rows = (Array.isArray(result) ? result : (result as { rows: unknown[] }).rows) as {
      tablename: string;
      rowsecurity: boolean;
    }[];
    expect(rows.length).toBeGreaterThanOrEqual(8);
    expect(rows.filter((row) => !row.rowsecurity).map((row) => row.tablename)).toEqual([]);
  });
});

describe("galleries and photos", () => {
  it("creates a gallery, rejects a duplicate slug and orders photos", async () => {
    const gallery = await createGallery({ slug: "smith", title: "Smith", status: "published" });
    await expect(createGallery({ slug: "smith", title: "Again" })).rejects.toThrow();

    const first = await addPhoto(gallery.id, "a");
    const second = await addPhoto(gallery.id, "b");
    expect((await listAllPhotos(gallery.id)).map((photo) => photo.id)).toEqual([first, second]);

    await reorderPhotos(gallery.id, [second, first]);
    expect((await listAllPhotos(gallery.id)).map((photo) => photo.id)).toEqual([second, first]);
  });

  it("ignores a repeated upload of the same file", async () => {
    const gallery = await createGallery({ slug: "repeat", title: "Repeat" });
    await addPhoto(gallery.id, "same");
    await addPhoto(gallery.id, "same");
    expect(await listAllPhotos(gallery.id)).toHaveLength(1);
  });

  it("never returns a photo through another gallery", async () => {
    const mine = await createGallery({ slug: "mine", title: "Mine" });
    const theirs = await createGallery({ slug: "theirs", title: "Theirs" });
    const photo = await addPhoto(theirs.id, "secret");
    expect(await getPhotoInGallery(theirs.id, photo)).toBeDefined();
    expect(await getPhotoInGallery(mine.id, photo)).toBeUndefined();
  });

  it("moves a photo by swapping it with its neighbor", async () => {
    const gallery = await createGallery({ slug: "move", title: "Move" });
    const a = await addPhoto(gallery.id, "a");
    const b = await addPhoto(gallery.id, "b");
    const c = await addPhoto(gallery.id, "c");
    const order = async () => (await listAllPhotos(gallery.id)).map((photo) => photo.id);

    await movePhoto(gallery.id, c, "earlier");
    expect(await order()).toEqual([a, c, b]);
    await movePhoto(gallery.id, a, "later");
    expect(await order()).toEqual([c, a, b]);
    // Already at the edge: nothing changes.
    await movePhoto(gallery.id, c, "earlier");
    await movePhoto(gallery.id, b, "later");
    expect(await order()).toEqual([c, a, b]);
  });

  it("clears the cover when the cover photo is deleted", async () => {
    const gallery = await createGallery({ slug: "cover", title: "Cover" });
    const photo = await addPhoto(gallery.id, "a");
    expect(await updateGallery(gallery.id, { coverPhotoId: photo })).toBe(true);
    await deletePhoto(gallery.id, photo);
    expect((await getGalleryById(gallery.id))?.coverPhotoId).toBeNull();
    expect(await updateGallery(randomUUID(), { title: "Nobody" })).toBe(false);
  });

  it("keeps the access log when its gallery is deleted", async () => {
    const gallery = await createGallery({ slug: "audited", title: "Audited" });
    await recordEvent({
      kind: "download",
      galleryId: gallery.id,
      ipHash: "audit-test",
      userAgent: "",
    });
    await deleteGallery(gallery.id);
    const kept = (await listRecentEvents()).filter((event) => event.ipHash === "audit-test");
    expect(kept).toHaveLength(1);
    expect(kept[0]?.galleryTitle).toBeNull();
  });

  it("bumps the access version when the passcode changes", async () => {
    const gallery = await createGallery({ slug: "rotate", title: "Rotate" });
    await setGalleryPasscode(gallery.id, await hashPasscode("one-two-three-four"));
    await setGalleryPasscode(gallery.id, null);
    const after = await getGalleryById(gallery.id);
    expect(after?.accessVersion).toBe(gallery.accessVersion + 2);
    expect(after?.passcodeHash).toBeNull();
  });

  it("archives only published galleries whose expiry has passed", async () => {
    const now = new Date("2030-01-10T00:00:00Z");
    const past = new Date("2030-01-01T00:00:00Z");
    const future = new Date("2030-02-01T00:00:00Z");
    await createGallery({ slug: "expired", title: "E", status: "published", expiresAt: past });
    await createGallery({ slug: "current", title: "C", status: "published", expiresAt: future });
    await createGallery({ slug: "open-ended", title: "O", status: "published" });
    await createGallery({ slug: "draft-old", title: "D", status: "draft", expiresAt: past });

    expect(await archiveExpiredGalleries(now)).toBe(1);
    expect((await getGalleryBySlug("expired"))?.status).toBe("archived");
    expect((await getGalleryBySlug("current"))?.status).toBe("published");
    expect((await getGalleryBySlug("open-ended"))?.status).toBe("published");
    expect((await getGalleryBySlug("draft-old"))?.status).toBe("draft");
    expect(await archiveExpiredGalleries(now)).toBe(0);
  });
});

describe("collections", () => {
  it("holds only photos from its own gallery", async () => {
    const gallery = await createGallery({ slug: "col-a", title: "A" });
    const other = await createGallery({ slug: "col-b", title: "B" });
    const own = await addPhoto(gallery.id, "own");
    const foreign = await addPhoto(other.id, "foreign");
    const collection = await createCollection(gallery.id, { name: "Guest" }, { title: "Picks" });

    await addPhotosToCollection(collection, [own]);
    // The composite foreign key rejects the whole insert.
    await expect(addPhotosToCollection(collection, [foreign])).rejects.toThrow();
    // A forged gallery id fails too, because it no longer matches the collection.
    await expect(
      addPhotosToCollection({ id: collection.id, galleryId: other.id }, [foreign]),
    ).rejects.toThrow();

    expect(await listCollectionPhotoIds(collection.id)).toEqual([own]);
    expect(await getPhotoInCollection(collection.id, foreign)).toBeUndefined();
  });

  it("adds, skips duplicates and removes photos", async () => {
    const gallery = await createGallery({ slug: "col-c", title: "C" });
    const a = await addPhoto(gallery.id, "a");
    const b = await addPhoto(gallery.id, "b");
    const collection = await createCollection(gallery.id, { name: "Guest" }, { title: "Set" });

    await addPhotosToCollection(collection, [a]);
    await addPhotosToCollection(collection, [a, b]);
    expect(await listCollectionPhotoIds(collection.id)).toEqual([a, b]);

    await removePhotosFromCollection(collection.id, [a]);
    expect(await listCollectionPhotoIds(collection.id)).toEqual([b]);
  });

  it("creates one Favorites collection per visitor and counts its photos", async () => {
    const gallery = await createGallery({ slug: "col-d", title: "D" });
    const photo = await addPhoto(gallery.id, "a");
    const owner = { name: "Guest" };
    const favorites = await getOrCreateFavorites(gallery.id, owner);
    expect((await getOrCreateFavorites(gallery.id, owner)).id).toBe(favorites.id);

    await addPhotosToCollection(favorites, [photo]);
    const listed = await listCollections(gallery.id, owner);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.photoCount).toBe(1);
  });

  it("creates a single Favorites collection under concurrent first use", async () => {
    const gallery = await createGallery({ slug: "col-race", title: "Race" });
    const photo = await addPhoto(gallery.id, "a");
    const results = await Promise.all(
      Array.from({ length: 8 }, () => getOrCreateFavorites(gallery.id, {})),
    );
    expect(new Set(results.map((collection) => collection.id)).size).toBe(1);
    expect(await listCollections(gallery.id, {})).toHaveLength(1);

    // Toggling reports the new state and flips it each time.
    const favorites = results[0];
    if (!favorites) throw new Error("no favorites");
    expect(await togglePhotoInCollection(favorites, photo)).toBe(true);
    expect(await togglePhotoInCollection(favorites, photo)).toBe(false);
    expect(await listCollectionPhotoIds(favorites.id)).toEqual([]);
  });

  it("stops share links for a whole gallery or for one member", async () => {
    const gallery = await createGallery({ slug: "col-share", title: "Share" });
    const other = await createGallery({ slug: "col-share-other", title: "Other" });
    const member = randomUUID();
    const shared = async (galleryId: string, owner: { userId?: string }, token: string) => {
      const collection = await createCollection(galleryId, owner, { title: token });
      await updateCollection(collection.id, { shareTokenHash: `hash-${token}` });
      return collection;
    };
    await shared(gallery.id, {}, "guest");
    await shared(gallery.id, { userId: member }, "member");
    await shared(other.id, {}, "elsewhere");
    const live = async (galleryId: string, owner: { userId?: string }) =>
      (await listCollections(galleryId, owner)).filter((collection) => collection.shareTokenHash)
        .length;

    expect(await revokeMemberShares(gallery.id, member)).toBe(1);
    expect(await live(gallery.id, { userId: member })).toBe(0);
    expect(await live(gallery.id, {})).toBe(1);

    expect(await revokeGalleryShares(gallery.id)).toBe(1);
    expect(await live(gallery.id, {})).toBe(0);
    // Another gallery's links are untouched.
    expect(await live(other.id, {})).toBe(1);
  });

  it("revokes sessions when a collection passcode changes and cascades on delete", async () => {
    const gallery = await createGallery({ slug: "col-e", title: "E" });
    const photo = await addPhoto(gallery.id, "a");
    const collection = await createCollection(gallery.id, { name: "Guest" }, { title: "Set" });
    await addPhotosToCollection(collection, [photo]);

    await setCollectionPasscode(collection.id, await hashPasscode("five-six-seven-eight"));
    const [updated] = await listCollections(gallery.id, { name: "Guest" });
    expect(updated?.accessVersion).toBe(collection.accessVersion + 1);

    await deleteGallery(gallery.id);
    expect(await listCollectionPhotoIds(collection.id)).toEqual([]);
    expect(await listAllPhotos(gallery.id)).toEqual([]);
  });
});

describe("rate limiter", () => {
  const rule: RateLimitRule = { limit: 3, windowMs: 60_000 };
  const now = new Date("2030-01-01T00:00:10Z");

  it("locks a key after the limit and frees it in the next window", async () => {
    expect(await isRateLimited("unlock:a", rule, now)).toBe(false);
    for (let hit = 1; hit <= rule.limit; hit += 1) {
      expect(await recordHit("unlock:a", rule, now)).toBe(hit);
    }
    expect(await isRateLimited("unlock:a", rule, now)).toBe(true);
    expect(await isRateLimited("unlock:b", rule, now)).toBe(false);
    expect(await isRateLimited("unlock:a", rule, new Date(now.getTime() + rule.windowMs))).toBe(
      false,
    );
  });

  it("lets through exactly the limit when attempts arrive at the same time", async () => {
    const attempts = await Promise.all(
      Array.from({ length: 25 }, () => consumeAttempt("unlock:parallel", rule, now)),
    );
    expect(attempts.filter(Boolean)).toHaveLength(rule.limit);
    // Counting happens with the decision, so the key is locked afterwards.
    expect(await consumeAttempt("unlock:parallel", rule, now)).toBe(false);
    expect(await isRateLimited("unlock:parallel", rule, now)).toBe(true);
  });

  it("clears a key on reset", async () => {
    for (let hit = 0; hit < rule.limit; hit += 1) await recordHit("unlock:c", rule, now);
    await resetRateLimit("unlock:c");
    expect(await isRateLimited("unlock:c", rule, now)).toBe(false);
  });
});
