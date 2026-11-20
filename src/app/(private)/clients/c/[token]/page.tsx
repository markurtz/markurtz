import type { Metadata } from "next";

import { GalleryView } from "@/components/gallery/gallery-view";
import { PasscodeForm } from "@/components/gallery/passcode-form";
import { Card } from "@/components/ui/card";
import { unlockCollection } from "@/server/actions/unlock";
import { requireCollectionAccess } from "@/server/auth/access";
import { getRequestInfo } from "@/server/auth/request";
import { listCollectionPhotos } from "@/server/dal/collections";
import { recordEvent } from "@/server/dal/events";
import { toGalleryImages } from "@/server/media";

export const metadata: Metadata = { title: "Shared collection" };

/**
 * A shared collection, opened by its link. It shows only the collection's
 * photos and offers no route into the gallery they came from.
 */
export default async function SharedCollectionPage({ params }: PageProps<"/clients/c/[token]">) {
  const { token } = await params;
  const access = await requireCollectionAccess(token);

  if (access.status === "locked") {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">This collection is private</h1>
        <p className="text-muted-foreground mt-2">Enter the passcode that came with the link.</p>
        <Card className="mt-6 p-6">
          <PasscodeForm action={unlockCollection} fields={{ token }} />
        </Card>
      </div>
    );
  }

  const { collection, gallery, capabilities } = access;
  const photos = await listCollectionPhotos(collection.id);
  const images = await toGalleryImages(photos, {
    download: capabilities.canDownload ? { kind: "collection", token } : undefined,
  });
  await recordEvent({
    kind: "view",
    galleryId: gallery.id,
    collectionId: collection.id,
    ...(await getRequestInfo()),
  });

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{collection.title}</h1>
        {collection.description ? (
          <p className="text-muted-foreground mt-2 max-w-2xl">{collection.description}</p>
        ) : null}
        <p className="text-muted-foreground mt-2 text-sm">
          {images.length} {images.length === 1 ? "photo" : "photos"}
          {collection.createdByName ? ` · shared by ${collection.createdByName}` : ""}
        </p>
      </header>
      {images.length === 0 ? (
        <p className="text-muted-foreground">This collection is empty.</p>
      ) : (
        <GalleryView
          scope={{ kind: "collection", token }}
          initialImages={images}
          total={images.length}
          canDownload={capabilities.canDownload}
          zipName="collection.zip"
        />
      )}
    </>
  );
}
