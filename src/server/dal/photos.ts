import "server-only";

import { and, asc, count, eq, inArray, max, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { galleries, photos, type NewPhoto, type Photo } from "@/server/db/schema";

/** Data access for photos in client galleries. Callers authorize first. */

/** Photos shown per page in a gallery. */
export const PHOTOS_PAGE_SIZE = 200;

/** One page of a gallery's photos in display order. */
export async function listPhotos(
  galleryId: string,
  { offset = 0, limit = PHOTOS_PAGE_SIZE }: { offset?: number; limit?: number } = {},
): Promise<Photo[]> {
  const db = await getDb();
  return db
    .select()
    .from(photos)
    .where(eq(photos.galleryId, galleryId))
    .orderBy(asc(photos.sortOrder), asc(photos.createdAt), asc(photos.id))
    .limit(limit)
    .offset(offset);
}

/** Number of photos in a gallery. */
export async function countPhotos(galleryId: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ value: count() })
    .from(photos)
    .where(eq(photos.galleryId, galleryId));
  return row?.value ?? 0;
}

/** One photo, only if it belongs to the given gallery. */
export async function getPhotoInGallery(
  galleryId: string,
  photoId: string,
): Promise<Photo | undefined> {
  const db = await getDb();
  const [photo] = await db
    .select()
    .from(photos)
    .where(and(eq(photos.id, photoId), eq(photos.galleryId, galleryId)))
    .limit(1);
  return photo;
}

/** The subset of the given ids that belong to the gallery. */
export async function getPhotosInGallery(galleryId: string, photoIds: string[]): Promise<Photo[]> {
  if (photoIds.length === 0) return [];
  const db = await getDb();
  return db
    .select()
    .from(photos)
    .where(and(eq(photos.galleryId, galleryId), inArray(photos.id, photoIds)));
}

/** Content hashes already uploaded to a gallery, so an upload can resume. */
export async function listContentHashes(galleryId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db
    .select({ hash: photos.contentHash })
    .from(photos)
    .where(eq(photos.galleryId, galleryId));
  return new Set(rows.map((row) => row.hash));
}

/** Inserts a photo at the end of the gallery. A repeated content hash is ignored. */
export async function insertPhoto(values: Omit<NewPhoto, "sortOrder">): Promise<void> {
  const db = await getDb();
  const [row] = await db
    .select({ value: max(photos.sortOrder) })
    .from(photos)
    .where(eq(photos.galleryId, values.galleryId));
  await db
    .insert(photos)
    .values({ ...values, sortOrder: (row?.value ?? -1) + 1 })
    .onConflictDoNothing();
}

/** Rewrites the display order to match the given list of ids, in one statement. */
export async function reorderPhotos(galleryId: string, orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;
  const db = await getDb();
  const order = sql.join(
    orderedIds.map((id, index) => sql`(${id}::uuid, ${index}::integer)`),
    sql`, `,
  );
  await db.execute(sql`
    update ${photos} set sort_order = ordering.position
    from (values ${order}) as ordering(id, position)
    where ${photos.id} = ordering.id and ${photos.galleryId} = ${galleryId}
  `);
}

/**
 * Moves a photo one place earlier or later by swapping its position with its
 * neighbor, in one statement however large the gallery is.
 */
export async function movePhoto(
  galleryId: string,
  photoId: string,
  direction: "earlier" | "later",
): Promise<void> {
  const db = await getDb();
  const neighbor =
    direction === "earlier"
      ? sql`select n.id, n.sort_order from ${photos} n, target
            where n.gallery_id = ${galleryId} and n.sort_order < target.sort_order
            order by n.sort_order desc limit 1`
      : sql`select n.id, n.sort_order from ${photos} n, target
            where n.gallery_id = ${galleryId} and n.sort_order > target.sort_order
            order by n.sort_order asc limit 1`;
  await db.execute(sql`
    with target as (
      select id, sort_order from ${photos}
      where id = ${photoId} and gallery_id = ${galleryId}
    ), neighbor as (${neighbor})
    update ${photos} p
    set sort_order = case when p.id = target.id then neighbor.sort_order else target.sort_order end
    from target, neighbor
    where p.id in (target.id, neighbor.id)
  `);
}

/**
 * Deletes a photo row and returns it so the caller can remove its files. A
 * gallery whose cover it was is left without a cover rather than pointing at
 * a photo that no longer exists.
 */
export async function deletePhoto(galleryId: string, photoId: string): Promise<Photo | undefined> {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const [photo] = await tx
      .delete(photos)
      .where(and(eq(photos.id, photoId), eq(photos.galleryId, galleryId)))
      .returning();
    if (photo) {
      await tx
        .update(galleries)
        .set({ coverPhotoId: null })
        .where(and(eq(galleries.id, galleryId), eq(galleries.coverPhotoId, photoId)));
    }
    return photo;
  });
}

/** Every photo in a gallery, unpaged. For deleting storage objects and building archives. */
export async function listAllPhotos(galleryId: string): Promise<Photo[]> {
  const db = await getDb();
  return db
    .select()
    .from(photos)
    .where(eq(photos.galleryId, galleryId))
    .orderBy(asc(photos.sortOrder));
}
