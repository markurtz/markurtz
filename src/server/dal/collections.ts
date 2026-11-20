import "server-only";

import { and, asc, count, desc, eq, inArray, isNotNull, isNull, max, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import {
  collectionPhotos,
  collections,
  photos,
  type Collection,
  type Photo,
} from "@/server/db/schema";

/**
 * Data access for client collections. Callers authorize first. Every function
 * that touches a collection takes the gallery id as well, so a collection id
 * from one gallery can never be used against another.
 */

export const FAVORITES_TITLE = "Favorites";

/** Who is acting: a signed-in client, or a passcode session (gallery-owned collections). */
export interface CollectionOwner {
  userId?: string;
  name?: string;
}

/** Collections this visitor can manage in a gallery, with photo counts. */
export async function listCollections(
  galleryId: string,
  owner: CollectionOwner,
): Promise<(Collection & { photoCount: number })[]> {
  const db = await getDb();
  const ownership = owner.userId
    ? eq(collections.createdByUser, owner.userId)
    : isNull(collections.createdByUser);
  const rows = await db
    .select({ collection: collections, photoCount: count(collectionPhotos.photoId) })
    .from(collections)
    .leftJoin(collectionPhotos, eq(collectionPhotos.collectionId, collections.id))
    .where(and(eq(collections.galleryId, galleryId), ownership))
    .groupBy(collections.id)
    .orderBy(desc(collections.isFavorites), asc(collections.createdAt));
  return rows.map((row) => ({ ...row.collection, photoCount: row.photoCount }));
}

/** Every collection in a gallery, for the admin's view of client selections. */
export async function listAllCollections(
  galleryId: string,
): Promise<(Collection & { photoCount: number })[]> {
  const db = await getDb();
  const rows = await db
    .select({ collection: collections, photoCount: count(collectionPhotos.photoId) })
    .from(collections)
    .leftJoin(collectionPhotos, eq(collectionPhotos.collectionId, collections.id))
    .where(eq(collections.galleryId, galleryId))
    .groupBy(collections.id)
    .orderBy(asc(collections.createdAt));
  return rows.map((row) => ({ ...row.collection, photoCount: row.photoCount }));
}

/** A collection the visitor may manage: it is in this gallery and they own it. */
export async function getManagedCollection(
  galleryId: string,
  collectionId: string,
  owner: CollectionOwner,
): Promise<Collection | undefined> {
  const db = await getDb();
  const [collection] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.galleryId, galleryId)))
    .limit(1);
  if (!collection) return undefined;
  const owned = owner.userId
    ? collection.createdByUser === owner.userId
    : collection.createdByUser === null;
  return owned ? collection : undefined;
}

/** A shared collection by the hash of its share token. */
export async function getCollectionByTokenHash(tokenHash: string): Promise<Collection | undefined> {
  const db = await getDb();
  const [collection] = await db
    .select()
    .from(collections)
    .where(eq(collections.shareTokenHash, tokenHash))
    .limit(1);
  return collection;
}

/** Creates a collection in a gallery. */
export async function createCollection(
  galleryId: string,
  owner: CollectionOwner,
  values: { title: string; description?: string; isFavorites?: boolean },
): Promise<Collection> {
  const db = await getDb();
  const [collection] = await db
    .insert(collections)
    .values({
      galleryId,
      title: values.title,
      description: values.description ?? "",
      isFavorites: values.isFavorites ?? false,
      createdByUser: owner.userId ?? null,
      createdByName: owner.name ?? null,
    })
    .returning();
  if (!collection) throw new Error("Collection was not created");
  return collection;
}

/**
 * The visitor's Favorites collection, created on first use. A unique index
 * allows one per owner, so a concurrent first use loses the insert quietly
 * and reads the winner's row instead.
 */
export async function getOrCreateFavorites(
  galleryId: string,
  owner: CollectionOwner,
): Promise<Collection> {
  const find = async () =>
    (await listCollections(galleryId, owner)).find((collection) => collection.isFavorites);
  const existing = await find();
  if (existing) return existing;
  const db = await getDb();
  await db
    .insert(collections)
    .values({
      galleryId,
      title: FAVORITES_TITLE,
      isFavorites: true,
      createdByUser: owner.userId ?? null,
      createdByName: owner.name ?? null,
    })
    .onConflictDoNothing();
  const created = await find();
  if (!created) throw new Error("Favorites collection was not created");
  return created;
}

/**
 * Flips a photo's membership of a collection and reports the new state. The
 * delete decides: only when nothing was removed is the photo added, so two
 * concurrent toggles cannot both add or both remove.
 */
export async function togglePhotoInCollection(
  collection: Pick<Collection, "id" | "galleryId">,
  photoId: string,
): Promise<boolean> {
  const db = await getDb();
  const removed = await db
    .delete(collectionPhotos)
    .where(
      and(eq(collectionPhotos.collectionId, collection.id), eq(collectionPhotos.photoId, photoId)),
    )
    .returning({ photoId: collectionPhotos.photoId });
  if (removed.length > 0) return false;
  await addPhotosToCollection(collection, [photoId]);
  return true;
}

/** Stops every share link in a gallery. Returns how many were active. */
export async function revokeGalleryShares(galleryId: string): Promise<number> {
  const db = await getDb();
  const rows = await db
    .update(collections)
    .set({ shareTokenHash: null })
    .where(and(eq(collections.galleryId, galleryId), isNotNull(collections.shareTokenHash)))
    .returning({ id: collections.id });
  return rows.length;
}

/** Stops the share links of one member's collections in a gallery. */
export async function revokeMemberShares(galleryId: string, userId: string): Promise<number> {
  const db = await getDb();
  const rows = await db
    .update(collections)
    .set({ shareTokenHash: null })
    .where(
      and(
        eq(collections.galleryId, galleryId),
        eq(collections.createdByUser, userId),
        isNotNull(collections.shareTokenHash),
      ),
    )
    .returning({ id: collections.id });
  return rows.length;
}

/** One collection of a gallery, whoever made it. For the admin only. */
export async function getCollectionInGallery(
  galleryId: string,
  collectionId: string,
): Promise<Collection | undefined> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, collectionId), eq(collections.galleryId, galleryId)))
    .limit(1);
  return row;
}

/** Fields the creator can edit on a collection. */
export type CollectionUpdate = Partial<
  Pick<Collection, "title" | "description" | "allowDownloads" | "expiresAt" | "shareTokenHash">
>;

/** Updates editable fields on a collection. */
export async function updateCollection(
  collectionId: string,
  values: CollectionUpdate,
): Promise<void> {
  const db = await getDb();
  await db.update(collections).set(values).where(eq(collections.id, collectionId));
}

/** Sets or clears a collection's passcode and revokes sessions unlocked with the old one. */
export async function setCollectionPasscode(
  collectionId: string,
  passcodeHash: string | null,
): Promise<void> {
  const db = await getDb();
  await db
    .update(collections)
    .set({ passcodeHash, accessVersion: sql`${collections.accessVersion} + 1` })
    .where(eq(collections.id, collectionId));
}

/** Deletes a collection. */
export async function deleteCollection(collectionId: string): Promise<void> {
  const db = await getDb();
  await db.delete(collections).where(eq(collections.id, collectionId));
}

/**
 * Adds photos to the end of a collection. Photos already present are skipped.
 * The composite foreign keys reject any photo from another gallery, so the
 * whole insert fails rather than leaking a photo across galleries.
 */
export async function addPhotosToCollection(
  collection: Pick<Collection, "id" | "galleryId">,
  photoIds: string[],
): Promise<void> {
  if (photoIds.length === 0) return;
  const db = await getDb();
  const [row] = await db
    .select({ value: max(collectionPhotos.sortOrder) })
    .from(collectionPhotos)
    .where(eq(collectionPhotos.collectionId, collection.id));
  const start = (row?.value ?? -1) + 1;
  await db
    .insert(collectionPhotos)
    .values(
      photoIds.map((photoId, index) => ({
        collectionId: collection.id,
        galleryId: collection.galleryId,
        photoId,
        sortOrder: start + index,
      })),
    )
    .onConflictDoNothing({ target: [collectionPhotos.collectionId, collectionPhotos.photoId] });
}

/** Removes photos from a collection. */
export async function removePhotosFromCollection(
  collectionId: string,
  photoIds: string[],
): Promise<void> {
  if (photoIds.length === 0) return;
  const db = await getDb();
  await db
    .delete(collectionPhotos)
    .where(
      and(
        eq(collectionPhotos.collectionId, collectionId),
        inArray(collectionPhotos.photoId, photoIds),
      ),
    );
}

/** Rewrites a collection's order to match the given list of photo ids, in one statement. */
export async function reorderCollection(collectionId: string, orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;
  const db = await getDb();
  const order = sql.join(
    orderedIds.map((id, index) => sql`(${id}::uuid, ${index}::integer)`),
    sql`, `,
  );
  await db.execute(sql`
    update ${collectionPhotos} set sort_order = ordering.position
    from (values ${order}) as ordering(photo_id, position)
    where ${collectionPhotos.photoId} = ordering.photo_id
      and ${collectionPhotos.collectionId} = ${collectionId}
  `);
}

/** The photos in a collection, in collection order. */
export async function listCollectionPhotos(collectionId: string): Promise<Photo[]> {
  const db = await getDb();
  const rows = await db
    .select({ photo: photos })
    .from(collectionPhotos)
    .innerJoin(photos, eq(photos.id, collectionPhotos.photoId))
    .where(eq(collectionPhotos.collectionId, collectionId))
    .orderBy(asc(collectionPhotos.sortOrder));
  return rows.map((row) => row.photo);
}

/** Ids of the photos in a collection. */
export async function listCollectionPhotoIds(collectionId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .select({ photoId: collectionPhotos.photoId })
    .from(collectionPhotos)
    .where(eq(collectionPhotos.collectionId, collectionId))
    .orderBy(asc(collectionPhotos.sortOrder));
  return rows.map((row) => row.photoId);
}

/** One photo, only if it is in the collection. */
export async function getPhotoInCollection(
  collectionId: string,
  photoId: string,
): Promise<Photo | undefined> {
  const db = await getDb();
  const [row] = await db
    .select({ photo: photos })
    .from(collectionPhotos)
    .innerJoin(photos, eq(photos.id, collectionPhotos.photoId))
    .where(
      and(eq(collectionPhotos.collectionId, collectionId), eq(collectionPhotos.photoId, photoId)),
    )
    .limit(1);
  return row?.photo;
}
