"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { GalleryImage } from "@/lib/media";
import { absoluteUrl } from "@/lib/utils";
import { getCollectionAccess, getGalleryAccess, type GalleryAccess } from "@/server/auth/access";
import { generateToken, hashPasscode, hashToken } from "@/server/auth/passcode";
import { getRequestInfo } from "@/server/auth/request";
import {
  addPhotosToCollection,
  createCollection,
  deleteCollection,
  getManagedCollection,
  getOrCreateFavorites,
  listCollectionPhotoIds,
  listCollectionPhotos,
  removePhotosFromCollection,
  reorderCollection,
  setCollectionPasscode,
  togglePhotoInCollection,
  updateCollection,
} from "@/server/dal/collections";
import { recordEvent } from "@/server/dal/events";
import { getPhotosInGallery, listPhotos, PHOTOS_PAGE_SIZE } from "@/server/dal/photos";
import type { Collection } from "@/server/db/schema";
import { signOriginalDownload, toGalleryImages, type DownloadScope } from "@/server/media";

import {
  checkbox,
  optionalDate,
  parseForm,
  slugSchema,
  uuidSchema,
  type FormState,
} from "./shared";

/**
 * Actions available to gallery visitors: paging, favorites, collections,
 * sharing and downloads. Each one re-resolves access from the session, so a
 * request forged with someone else's ids gets nothing.
 */

const MAX_SELECTION = 2000;
/** Shortest passcode a client may put on a share link. */
const MIN_SHARE_PASSCODE = 8;
const photoIdsSchema = z.array(uuidSchema).min(1).max(MAX_SELECTION);
const titleSchema = z.string().trim().min(1).max(120);

const collectionsPath = (slug: string) => `/clients/g/${slug}/collections`;

async function requireManager(slug: string): Promise<GalleryAccess> {
  const access = await getGalleryAccess(slugSchema.parse(slug));
  if (!access || !access.capabilities.canManageCollections) throw new Error("Not allowed");
  return access;
}

async function requireManaged(
  slug: string,
  collectionId: string,
): Promise<{ access: GalleryAccess; collection: Collection }> {
  const access = await requireManager(slug);
  const collection = await getManagedCollection(
    access.gallery.id,
    uuidSchema.parse(collectionId),
    access.owner,
  );
  if (!collection) throw new Error("Not allowed");
  return { access, collection };
}

/** Only photos that really belong to the gallery survive. */
async function ownPhotoIds(galleryId: string, photoIds: string[]): Promise<string[]> {
  const rows = await getPhotosInGallery(galleryId, photoIdsSchema.parse(photoIds));
  const valid = new Set(rows.map((photo) => photo.id));
  return photoIds.filter((id) => valid.has(id));
}

/** The next page of a gallery, for infinite scroll. */
export async function loadMorePhotos(slug: string, offset: number): Promise<GalleryImage[]> {
  const access = await getGalleryAccess(slugSchema.parse(slug));
  if (!access) return [];
  const photos = await listPhotos(access.gallery.id, {
    offset: z.number().int().nonnegative().parse(offset),
    limit: PHOTOS_PAGE_SIZE,
  });
  return toGalleryImages(photos, {
    download: access.capabilities.canDownload
      ? { kind: "gallery", slug: access.gallery.slug }
      : undefined,
  });
}

/** Adds or removes a photo from the visitor's Favorites and reports the new state. */
export async function toggleFavorite(
  slug: string,
  photoId: string,
): Promise<{ favorite: boolean }> {
  const access = await requireManager(slug);
  const [id] = await ownPhotoIds(access.gallery.id, [photoId]);
  if (!id) throw new Error("Not allowed");
  const favorites = await getOrCreateFavorites(access.gallery.id, access.owner);
  return { favorite: await togglePhotoInCollection(favorites, id) };
}

/** Adds photos to an existing collection, or to a new one when `title` is given. */
export async function addToCollection(
  slug: string,
  target: { collectionId?: string; title?: string; createdByName?: string },
  photoIds: string[],
): Promise<{ collectionId: string; title: string }> {
  const access = await requireManager(slug);
  const ids = await ownPhotoIds(access.gallery.id, photoIds);

  let collection: Collection | undefined;
  if (target.collectionId) {
    collection = await getManagedCollection(
      access.gallery.id,
      uuidSchema.parse(target.collectionId),
      access.owner,
    );
  } else {
    const name = z.string().trim().max(80).optional().parse(target.createdByName);
    collection = await createCollection(
      access.gallery.id,
      { ...access.owner, name: access.owner.name ?? (name || undefined) },
      { title: titleSchema.parse(target.title) },
    );
  }
  if (!collection) throw new Error("Not allowed");

  await addPhotosToCollection(collection, ids);
  revalidatePath(collectionsPath(access.gallery.slug));
  return { collectionId: collection.id, title: collection.title };
}

/** Saves a collection's title, description, download setting and expiry. */
export async function updateCollectionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseForm(
    z.object({
      slug: slugSchema,
      collectionId: uuidSchema,
      title: titleSchema,
      description: z.string().trim().max(1000).default(""),
      allowDownloads: checkbox,
      expiresAt: optionalDate,
    }),
    formData,
  );
  if (!parsed.ok) return { error: parsed.error };
  const { slug, collectionId, title, description, allowDownloads, expiresAt } = parsed.data;
  const { access, collection } = await requireManaged(slug, collectionId);
  await updateCollection(collection.id, {
    // Favorites keeps its name so the heart button can always find it.
    title: collection.isFavorites ? collection.title : title,
    description,
    // Never more permissive than the parent gallery.
    allowDownloads: allowDownloads && access.gallery.allowDownloads,
    expiresAt,
  });
  revalidatePath(`${collectionsPath(slug)}/${collectionId}`);
  return { message: "Saved." };
}

/** Per-photo operations inside a collection: remove, or move earlier or later. */
export async function collectionPhotoAction(formData: FormData): Promise<void> {
  const { slug, collectionId, photoId, op } = z
    .object({
      slug: slugSchema,
      collectionId: uuidSchema,
      photoId: uuidSchema,
      op: z.enum(["remove", "earlier", "later"]),
    })
    .parse(Object.fromEntries(formData));
  const { collection } = await requireManaged(slug, collectionId);

  if (op === "remove") {
    await removePhotosFromCollection(collection.id, [photoId]);
  } else {
    const ids = await listCollectionPhotoIds(collection.id);
    const from = ids.indexOf(photoId);
    const to = op === "earlier" ? from - 1 : from + 1;
    if (from !== -1 && to >= 0 && to < ids.length) {
      [ids[from], ids[to]] = [ids[to] as string, ids[from] as string];
      await reorderCollection(collection.id, ids);
    }
  }
  revalidatePath(`${collectionsPath(slug)}/${collectionId}`);
}

/** Returned by the share action. The link is shown once and cannot be recovered. */
export interface ShareState extends FormState {
  url?: string;
}

/**
 * Sharing operations on a collection:
 * - `share`: create (or regenerate) the link. Regenerating breaks the old link.
 * - `revoke`: stop sharing.
 * - `passcode`: set or clear the share passcode.
 */
export async function shareCollectionAction(
  _previous: ShareState,
  formData: FormData,
): Promise<ShareState> {
  const parsed = parseForm(
    z.object({
      slug: slugSchema,
      collectionId: uuidSchema,
      op: z.enum(["share", "revoke", "passcode"]),
      passcode: z
        .string()
        .trim()
        .max(200)
        .optional()
        .refine(
          (value) => !value || value.length >= MIN_SHARE_PASSCODE,
          `Use at least ${MIN_SHARE_PASSCODE} characters`,
        ),
    }),
    formData,
  );
  if (!parsed.ok) return { error: parsed.error };
  const { slug, collectionId, op, passcode } = parsed.data;
  const { access, collection } = await requireManaged(slug, collectionId);
  revalidatePath(`${collectionsPath(slug)}/${collectionId}`);

  if (op === "revoke") {
    await updateCollection(collection.id, { shareTokenHash: null });
    return { message: "Sharing is off. The old link no longer works." };
  }
  if (op === "passcode") {
    await setCollectionPasscode(collection.id, passcode ? await hashPasscode(passcode) : null);
    return { message: passcode ? "Passcode set." : "Passcode removed." };
  }
  const token = generateToken();
  await updateCollection(collection.id, { shareTokenHash: hashToken(token) });
  await recordEvent({
    kind: "share_create",
    galleryId: access.gallery.id,
    collectionId: collection.id,
    ...(await getRequestInfo()),
  });
  return { url: absoluteUrl(`/clients/c/${token}`) };
}

/** Deletes a collection the visitor manages. */
export async function deleteCollectionAction(formData: FormData): Promise<void> {
  const { slug, collectionId } = z
    .object({ slug: slugSchema, collectionId: uuidSchema })
    .parse(Object.fromEntries(formData));
  const { collection } = await requireManaged(slug, collectionId);
  await deleteCollection(collection.id);
  revalidatePath(collectionsPath(slug));
  redirect(collectionsPath(slug));
}

/** A file the browser should fetch and add to a zip. */
export interface DownloadItem {
  name: string;
  url: string;
}

/**
 * Short-lived download URLs for a selection, used to build a zip in the
 * browser. Access and the download permission are re-checked here, and only
 * photos inside the authorized gallery or collection are returned.
 */
export async function getDownloadUrls(
  scope: DownloadScope,
  photoIds?: string[],
): Promise<DownloadItem[]> {
  const request = await getRequestInfo();

  if (scope.kind === "gallery") {
    const access = await getGalleryAccess(slugSchema.parse(scope.slug));
    if (!access?.capabilities.canDownload || !photoIds) return [];
    const photos = await getPhotosInGallery(access.gallery.id, photoIdsSchema.parse(photoIds));
    await recordEvent({ kind: "download", galleryId: access.gallery.id, ...request });
    return Promise.all(
      photos.map(async (photo) => ({
        name: photo.filename,
        url: await signOriginalDownload(photo),
      })),
    );
  }

  const access = await getCollectionAccess(z.string().min(20).max(200).parse(scope.token));
  if (access.status !== "ok" || !access.capabilities.canDownload) return [];
  const wanted = photoIds ? new Set(photoIdsSchema.parse(photoIds)) : undefined;
  const photos = (await listCollectionPhotos(access.collection.id)).filter(
    (photo) => !wanted || wanted.has(photo.id),
  );
  await recordEvent({
    kind: "download",
    galleryId: access.gallery.id,
    collectionId: access.collection.id,
    ...request,
  });
  return Promise.all(
    photos.map(async (photo) => ({ name: photo.filename, url: await signOriginalDownload(photo) })),
  );
}
