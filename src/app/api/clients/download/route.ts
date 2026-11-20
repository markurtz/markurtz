import { z } from "zod";

import { getCollectionAccess, getGalleryAccess } from "@/server/auth/access";
import { getRequestInfo } from "@/server/auth/request";
import { getPhotoInCollection } from "@/server/dal/collections";
import { recordEvent } from "@/server/dal/events";
import { getPhotoInGallery } from "@/server/dal/photos";
import { DOWNLOAD_URL_SECONDS, signOriginalDownload } from "@/server/media";
import { getStorage } from "@/server/storage";

const querySchema = z
  .object({
    photo: z.uuid().optional(),
    archive: z.literal("1").optional(),
    g: z.string().max(80).optional(),
    c: z.string().min(20).max(200).optional(),
  })
  .refine((query) => Boolean(query.g) !== Boolean(query.c), "Exactly one of g or c is required");

const notFound = () => new Response("Not found", { status: 404 });

/**
 * Downloads one original (`?photo=<id>`) or a gallery's prebuilt archive
 * (`?archive=1`), in the scope of a gallery (`g=<slug>`) or a shared
 * collection (`c=<token>`).
 *
 * Access and the download permission are re-checked on every request, the
 * event is logged, and the response is a redirect to a five minute signed URL,
 * so the bytes go from storage to the browser and never through this server.
 * Every refusal is the same 404.
 */
export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return notFound();
  const { photo: photoId, archive, g: slug, c: token } = parsed.data;
  const info = await getRequestInfo();

  if (slug) {
    const access = await getGalleryAccess(slug);
    if (!access?.capabilities.canDownload) return notFound();
    const { gallery } = access;

    if (archive) {
      if (!gallery.archiveKey) return notFound();
      const storage = await getStorage("private");
      const url = await storage.signedGetUrl(gallery.archiveKey, {
        expiresIn: DOWNLOAD_URL_SECONDS,
        downloadAs: `${gallery.slug}.zip`,
      });
      await recordEvent({ kind: "download", galleryId: gallery.id, ...info });
      return Response.redirect(new URL(url, request.url), 302);
    }

    const photo = photoId ? await getPhotoInGallery(gallery.id, photoId) : undefined;
    if (!photo) return notFound();
    await recordEvent({ kind: "download", galleryId: gallery.id, ...info });
    return Response.redirect(new URL(await signOriginalDownload(photo), request.url), 302);
  }

  const access = token ? await getCollectionAccess(token) : undefined;
  if (access?.status !== "ok" || !access.capabilities.canDownload || !photoId) return notFound();
  const photo = await getPhotoInCollection(access.collection.id, photoId);
  if (!photo) return notFound();
  await recordEvent({
    kind: "download",
    galleryId: access.gallery.id,
    collectionId: access.collection.id,
    ...info,
  });
  return Response.redirect(new URL(await signOriginalDownload(photo), request.url), 302);
}
