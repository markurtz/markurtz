import type { Metadata } from "next";
import Link from "next/link";

import { GalleryView } from "@/components/gallery/gallery-view";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { requireGalleryAccess } from "@/server/auth/access";
import { getRequestInfo } from "@/server/auth/request";
import { listCollectionPhotoIds, listCollections } from "@/server/dal/collections";
import { recordEvent } from "@/server/dal/events";
import { countPhotos, listPhotos } from "@/server/dal/photos";
import { toGalleryImages } from "@/server/media";

export const metadata: Metadata = { title: "Gallery" };

/** A client gallery: photos with selection, favorites, collections and downloads. */
export default async function GalleryPage({ params }: PageProps<"/clients/g/[slug]">) {
  const { slug } = await params;
  const { gallery, capabilities, owner, isAdmin } = await requireGalleryAccess(slug);

  const [photos, total, collections, request] = await Promise.all([
    listPhotos(gallery.id),
    countPhotos(gallery.id),
    capabilities.canManageCollections ? listCollections(gallery.id, owner) : [],
    getRequestInfo(),
  ]);
  const favorites = collections.find((collection) => collection.isFavorites);
  const [images, favoriteIds] = await Promise.all([
    toGalleryImages(photos, {
      download: capabilities.canDownload ? { kind: "gallery", slug: gallery.slug } : undefined,
    }),
    favorites ? listCollectionPhotoIds(favorites.id) : [],
  ]);
  await recordEvent({ kind: "view", galleryId: gallery.id, ...request });

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{gallery.title}</h1>
          {gallery.description ? (
            <p className="text-muted-foreground mt-2 max-w-2xl">{gallery.description}</p>
          ) : null}
          <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span>
              {total} {total === 1 ? "photo" : "photos"}
            </span>
            {gallery.expiresAt ? (
              <span>Available until {formatDate(gallery.expiresAt.toISOString())}</span>
            ) : null}
            {isAdmin && gallery.status !== "published" ? (
              <Badge tone="warning">Admin preview: {gallery.status}</Badge>
            ) : null}
          </p>
        </div>
        {capabilities.canManageCollections ? (
          <Link
            href={`/clients/g/${gallery.slug}/collections`}
            className={buttonVariants({ variant: "outline" })}
          >
            Collections
          </Link>
        ) : null}
      </header>

      {images.length === 0 ? (
        <p className="text-muted-foreground">Photos have not been added to this gallery yet.</p>
      ) : (
        <GalleryView
          scope={{ kind: "gallery", slug: gallery.slug }}
          initialImages={images}
          total={total}
          canDownload={capabilities.canDownload}
          canManageCollections={capabilities.canManageCollections}
          initialFavoriteIds={favoriteIds}
          collections={collections.map((collection) => ({
            id: collection.id,
            title: collection.title,
          }))}
          archiveUrl={
            gallery.archiveKey ? `/api/clients/download?archive=1&g=${gallery.slug}` : undefined
          }
          zipName={`${gallery.slug}-selection.zip`}
        />
      )}
    </>
  );
}
