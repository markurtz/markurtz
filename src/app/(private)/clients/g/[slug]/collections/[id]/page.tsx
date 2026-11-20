/* eslint-disable @next/next/no-img-element -- signed, pre-sized thumbnails from private storage. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { StatefulForm } from "@/components/private/stateful-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  collectionPhotoAction,
  deleteCollectionAction,
  shareCollectionAction,
  updateCollectionAction,
} from "@/server/actions/collections";
import { requireGalleryAccess } from "@/server/auth/access";
import { getManagedCollection, listCollectionPhotos } from "@/server/dal/collections";
import { toGalleryImages } from "@/server/media";

export const metadata: Metadata = { title: "Collection" };

/** Manage one collection: its photos and order, its details, and how it is shared. */
export default async function CollectionPage({
  params,
}: PageProps<"/clients/g/[slug]/collections/[id]">) {
  const { slug, id } = await params;
  const { gallery, capabilities, owner } = await requireGalleryAccess(slug);
  if (!capabilities.canManageCollections || !z.uuid().safeParse(id).success) notFound();
  const collection = await getManagedCollection(gallery.id, id, owner);
  if (!collection) notFound();

  const images = await toGalleryImages(await listCollectionPhotos(collection.id));
  const hidden = (
    <>
      <input type="hidden" name="slug" value={gallery.slug} />
      <input type="hidden" name="collectionId" value={collection.id} />
    </>
  );

  return (
    <>
      <p className="mb-4 text-sm">
        <Link
          href={`/clients/g/${gallery.slug}/collections`}
          className="text-accent hover:underline"
        >
          <span aria-hidden>←</span> Collections
        </Link>
      </p>
      <h1 className="text-3xl font-bold tracking-tight">{collection.title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {images.length} {images.length === 1 ? "photo" : "photos"}
        {collection.createdByName ? ` · created by ${collection.createdByName}` : ""}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Share</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            {collection.shareTokenHash
              ? "This collection has a share link. Creating a new link stops the old one from working."
              : "Create a link that shows only the photos in this collection."}
          </p>
          <StatefulForm
            action={shareCollectionAction}
            submitLabel={collection.shareTokenHash ? "Create a new link" : "Create share link"}
          >
            {hidden}
            <input type="hidden" name="op" value="share" />
          </StatefulForm>
          {collection.shareTokenHash ? (
            <StatefulForm
              action={shareCollectionAction}
              submitLabel="Stop sharing"
              submitVariant="outline"
              className="mt-4"
            >
              {hidden}
              <input type="hidden" name="op" value="revoke" />
            </StatefulForm>
          ) : null}
          <StatefulForm
            action={shareCollectionAction}
            submitLabel="Save passcode"
            submitVariant="outline"
            className="mt-6 border-t pt-4"
          >
            {hidden}
            <input type="hidden" name="op" value="passcode" />
            <div>
              <Label htmlFor="share-passcode">
                Share passcode {collection.passcodeHash ? "(one is set)" : "(optional)"}
              </Label>
              <Input
                id="share-passcode"
                name="passcode"
                autoComplete="off"
                placeholder="Leave empty to remove"
              />
            </div>
          </StatefulForm>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>
          <StatefulForm action={updateCollectionAction} submitLabel="Save">
            {hidden}
            <div>
              <Label htmlFor="title">Name</Label>
              <Input
                id="title"
                name="title"
                defaultValue={collection.title}
                readOnly={collection.isFavorites}
                maxLength={120}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Note for the people you share with</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={collection.description}
                maxLength={1000}
              />
            </div>
            <div>
              <Label htmlFor="expiresAt">Link expires on (optional)</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="date"
                defaultValue={collection.expiresAt?.toISOString().slice(0, 10)}
              />
            </div>
            {gallery.allowDownloads ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="allowDownloads"
                  defaultChecked={collection.allowDownloads}
                />
                People with the link can download the photos
              </label>
            ) : null}
          </StatefulForm>
          {!collection.isFavorites ? (
            <form action={deleteCollectionAction} className="mt-6 border-t pt-4">
              {hidden}
              <Button type="submit" variant="danger" size="sm">
                Delete collection
              </Button>
            </form>
          ) : null}
        </Card>
      </div>

      <h2 className="mt-12 mb-4 text-lg font-semibold">Photos</h2>
      {images.length === 0 ? (
        <p className="text-muted-foreground">
          This collection is empty. Add photos from the gallery.
        </p>
      ) : (
        <ol className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="rounded-lg border p-2">
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                className="aspect-square w-full rounded object-cover"
                style={{ background: image.placeholder }}
              />
              <form action={collectionPhotoAction} className="mt-2 flex flex-wrap gap-1">
                {hidden}
                <input type="hidden" name="photoId" value={image.id} />
                <Button
                  type="submit"
                  name="op"
                  value="earlier"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  aria-label={`Move photo ${index + 1} earlier`}
                >
                  ←
                </Button>
                <Button
                  type="submit"
                  name="op"
                  value="later"
                  variant="outline"
                  size="sm"
                  disabled={index === images.length - 1}
                  aria-label={`Move photo ${index + 1} later`}
                >
                  →
                </Button>
                <Button
                  type="submit"
                  name="op"
                  value="remove"
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
