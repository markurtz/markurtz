import "server-only";

import { thumbhashToColor, type GalleryImage } from "@/lib/media";
import type { Photo } from "@/server/db/schema";
import { getStorage, photoKeys } from "@/server/storage";

/**
 * Turns photo rows into what the browser may see: short-lived signed URLs and
 * display facts. Storage keys and prefixes never leave the server.
 */

/** How long page image URLs stay valid. */
export const VIEW_URL_SECONDS = 60 * 60;
/** How long a download URL stays valid. */
export const DOWNLOAD_URL_SECONDS = 5 * 60;

/** Where a download link points, which decides how access is re-checked. */
export type DownloadScope =
  { kind: "gallery"; slug: string } | { kind: "collection"; token: string };

/** URL of the download route for one photo in a scope. */
export function downloadHref(scope: DownloadScope, photoId: string): string {
  const params = new URLSearchParams({ photo: photoId });
  if (scope.kind === "gallery") params.set("g", scope.slug);
  else params.set("c", scope.token);
  return `/api/clients/download?${params.toString()}`;
}

/** Signs thumbnail and preview URLs for a page of photos. */
export async function toGalleryImages(
  photos: Photo[],
  options: { download?: DownloadScope } = {},
): Promise<GalleryImage[]> {
  const storage = await getStorage("private");
  return Promise.all(
    photos.map(async (photo) => {
      const keys = photoKeys(photo);
      const [src, fullSrc] = await Promise.all([
        storage.signedGetUrl(keys.thumb, { expiresIn: VIEW_URL_SECONDS }),
        storage.signedGetUrl(keys.preview, { expiresIn: VIEW_URL_SECONDS }),
      ]);
      return {
        id: photo.id,
        src,
        fullSrc,
        width: photo.width,
        height: photo.height,
        alt: photo.filename,
        filename: photo.filename,
        placeholder: thumbhashToColor(photo.thumbhash),
        downloadUrl: options.download ? downloadHref(options.download, photo.id) : undefined,
      };
    }),
  );
}

/** A short-lived URL that downloads a photo's original under its own filename. */
export async function signOriginalDownload(photo: Photo): Promise<string> {
  const storage = await getStorage("private");
  return storage.signedGetUrl(photoKeys(photo).original, {
    expiresIn: DOWNLOAD_URL_SECONDS,
    downloadAs: photo.filename,
  });
}
