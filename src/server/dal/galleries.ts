import "server-only";

import { and, asc, count, desc, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import {
  galleries,
  galleryMembers,
  photos,
  type Gallery,
  type NewGallery,
} from "@/server/db/schema";

/**
 * Data access for galleries and their members. Functions here trust their
 * caller: authorization happens first, in `src/server/auth/access.ts`.
 */

/** A gallery by slug, whatever its status. */
export async function getGalleryBySlug(slug: string): Promise<Gallery | undefined> {
  const db = await getDb();
  const [gallery] = await db.select().from(galleries).where(eq(galleries.slug, slug)).limit(1);
  return gallery;
}

/** A gallery by id. */
export async function getGalleryById(id: string): Promise<Gallery | undefined> {
  const db = await getDb();
  const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id)).limit(1);
  return gallery;
}

/** Every gallery with its photo count, newest first. Admin only. */
export async function listGalleries(): Promise<(Gallery & { photoCount: number })[]> {
  const db = await getDb();
  const rows = await db
    .select({ gallery: galleries, photoCount: count(photos.id) })
    .from(galleries)
    .leftJoin(photos, eq(photos.galleryId, galleries.id))
    .groupBy(galleries.id)
    .orderBy(desc(galleries.createdAt));
  return rows.map((row) => ({ ...row.gallery, photoCount: row.photoCount }));
}

/** Creates a gallery. Throws on a duplicate slug. */
export async function createGallery(values: NewGallery): Promise<Gallery> {
  const db = await getDb();
  const [gallery] = await db.insert(galleries).values(values).returning();
  if (!gallery) throw new Error("Gallery was not created");
  return gallery;
}

/** Fields an admin can edit on a gallery. */
export type GalleryUpdate = Partial<
  Pick<
    Gallery,
    | "title"
    | "description"
    | "clientName"
    | "shootDate"
    | "status"
    | "allowDownloads"
    | "allowCollections"
    | "expiresAt"
    | "coverPhotoId"
    | "archiveKey"
  >
>;

/** Updates editable gallery fields. Returns false when no gallery has that id. */
export async function updateGallery(id: string, values: GalleryUpdate): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .update(galleries)
    .set(values)
    .where(eq(galleries.id, id))
    .returning({ id: galleries.id });
  return rows.length > 0;
}

/**
 * Sets or clears the passcode hash and bumps `access_version`, which revokes
 * every session that was unlocked with the old passcode.
 */
export async function setGalleryPasscode(id: string, passcodeHash: string | null): Promise<void> {
  const db = await getDb();
  await db
    .update(galleries)
    .set({ passcodeHash, accessVersion: sql`${galleries.accessVersion} + 1` })
    .where(eq(galleries.id, id));
}

/** Deletes a gallery. Photos, collections, members and events cascade. */
export async function deleteGallery(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(galleries).where(eq(galleries.id, id));
}

/** Archives published galleries whose expiry has passed. Returns how many changed. */
export async function archiveExpiredGalleries(now: Date = new Date()): Promise<number> {
  const db = await getDb();
  const rows = await db
    .update(galleries)
    .set({ status: "archived" })
    .where(
      and(
        eq(galleries.status, "published"),
        isNotNull(galleries.expiresAt),
        lt(galleries.expiresAt, now),
      ),
    )
    .returning({ id: galleries.id });
  return rows.length;
}

// ── Members ─────────────────────────────────────────────────────────────────

/** The role a user holds on a gallery, if any. */
export async function getMemberRole(
  galleryId: string,
  userId: string,
): Promise<"viewer" | "owner" | undefined> {
  const db = await getDb();
  const [member] = await db
    .select({ role: galleryMembers.role })
    .from(galleryMembers)
    .where(and(eq(galleryMembers.galleryId, galleryId), eq(galleryMembers.userId, userId)))
    .limit(1);
  return member?.role;
}

/** Members of a gallery. */
export async function listMembers(galleryId: string) {
  const db = await getDb();
  return db
    .select()
    .from(galleryMembers)
    .where(eq(galleryMembers.galleryId, galleryId))
    .orderBy(asc(galleryMembers.invitedEmail));
}

/** Adds a member, or does nothing if they already belong to the gallery. */
export async function addMember(
  galleryId: string,
  userId: string,
  invitedEmail: string,
): Promise<void> {
  const db = await getDb();
  await db.insert(galleryMembers).values({ galleryId, userId, invitedEmail }).onConflictDoNothing();
}

/** Removes a member from a gallery. */
export async function removeMember(galleryId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const rows = await db
    .delete(galleryMembers)
    .where(and(eq(galleryMembers.galleryId, galleryId), eq(galleryMembers.userId, userId)))
    .returning({ userId: galleryMembers.userId });
  return rows.length > 0;
}

/** True when the address has been invited to at least one gallery. */
export async function isInvitedEmail(email: string): Promise<boolean> {
  const db = await getDb();
  const [row] = await db
    .select({ galleryId: galleryMembers.galleryId })
    .from(galleryMembers)
    .where(eq(galleryMembers.invitedEmail, email.toLowerCase()))
    .limit(1);
  return Boolean(row);
}

/** Published galleries a signed-in client belongs to. */
export async function listGalleriesForUser(userId: string): Promise<Gallery[]> {
  const db = await getDb();
  const memberships = await db
    .select({ galleryId: galleryMembers.galleryId })
    .from(galleryMembers)
    .where(eq(galleryMembers.userId, userId));
  if (memberships.length === 0) return [];
  return db
    .select()
    .from(galleries)
    .where(
      and(
        inArray(
          galleries.id,
          memberships.map((membership) => membership.galleryId),
        ),
        eq(galleries.status, "published"),
      ),
    )
    .orderBy(desc(galleries.createdAt));
}
