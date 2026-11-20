import "server-only";

import { and, asc, count, desc, eq, inArray, isNull, max, sql } from "drizzle-orm";

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

/** The visitor's Favorites collection, created on first use. */
export async function getOrCreateFavorites(
  galleryId: string,
  owner: CollectionOwner,
): Promise<Collection> {
  const existing = (await listCollections(galleryId, owner)).find(
    (collection) => collection.isFavorites,
  );
  return (
    existing ?? createCollection(galleryId, owner, { title: FAVORITES_TITLE, isFavorites: true })
  );
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

/** Rewrites a collection's order to match the given list of photo ids. */
export async function reorderCollection(collectionId: string, orderedIds: string[]): Promise<void> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    for (const [index, photoId] of orderedIds.entries()) {
      await tx
        .update(collectionPhotos)
        .set({ sortOrder: index })
        .where(
          and(
            eq(collectionPhotos.collectionId, collectionId),
            eq(collectionPhotos.photoId, photoId),
          ),
        );
    }
  });
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
