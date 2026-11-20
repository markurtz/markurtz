/* eslint-disable @next/next/no-img-element -- signed, pre-sized thumbnails from private storage. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { StatefulForm } from "@/components/private/stateful-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  deleteGalleryAction,
  inviteMemberAction,
  photoAction,
  removeMemberAction,
  setGalleryPasscodeAction,
  updateGalleryAction,
} from "@/server/actions/admin";
import { requireAdmin } from "@/server/auth/access";
import { listAllCollections } from "@/server/dal/collections";
import { getGalleryById, listMembers } from "@/server/dal/galleries";
import { listAllPhotos } from "@/server/dal/photos";
import { toGalleryImages } from "@/server/media";

export const metadata: Metadata = { title: "Gallery settings" };

/** Everything about one gallery: settings, passcode, invited clients, photos and collections. */
export default async function AdminGalleryPage({ params }: PageProps<"/admin/galleries/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const gallery = await getGalleryById(id);
  if (!gallery) notFound();

  const [members, photos, collections] = await Promise.all([
    listMembers(gallery.id),
    listAllPhotos(gallery.id),
    listAllCollections(gallery.id),
  ]);
  const images = await toGalleryImages(photos);
  const idField = <input type="hidden" name="id" value={gallery.id} />;

  return (
    <>
      <p className="mb-4 text-sm">
        <Link href="/admin" className="text-accent hover:underline">
          <span aria-hidden>←</span> Galleries
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{gallery.title}</h1>
        <Badge>{gallery.status}</Badge>
        <Link href={`/clients/g/${gallery.slug}`} className="text-accent text-sm hover:underline">
          View as client
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Settings</h2>
          <StatefulForm action={updateGalleryAction} submitLabel="Save settings">
            {idField}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={gallery.title}
                maxLength={140}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={gallery.description}
                maxLength={2000}
              />
            </div>
            <div>
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                name="clientName"
                defaultValue={gallery.clientName}
                maxLength={140}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="shootDate">Shoot date</Label>
                <Input
                  id="shootDate"
                  name="shootDate"
                  type="date"
                  defaultValue={gallery.shootDate ?? ""}
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Expires on</Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  defaultValue={gallery.expiresAt?.toISOString().slice(0, 10)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={gallery.status}>
                <option value="draft">Draft (only you can see it)</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allowDownloads"
                defaultChecked={gallery.allowDownloads}
              />
              Clients can download originals
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allowCollections"
                defaultChecked={gallery.allowCollections}
              />
              Clients can create and share collections
            </label>
          </StatefulForm>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-2 text-lg font-semibold">Passcode</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              {gallery.passcodeHash
                ? "A passcode is set. Setting a new one signs out everyone who used the old one."
                : "No passcode is set, so only invited clients can open this gallery."}
            </p>
            <StatefulForm
              action={setGalleryPasscodeAction}
              submitLabel={gallery.passcodeHash ? "Change passcode" : "Set passcode"}
            >
              {idField}
              <div>
                <Label htmlFor="passcode">New passcode</Label>
                <Input
                  id="passcode"
                  name="passcode"
                  autoComplete="off"
                  placeholder="Leave empty to generate four words"
                />
              </div>
            </StatefulForm>
          </Card>

          <Card className="p-6">
            <h2 className="mb-2 text-lg font-semibold">Invited clients</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Invited clients sign in with their email and do not need the passcode.
            </p>
            {members.length > 0 ? (
              <ul className="mb-4 list-none divide-y p-0 text-sm">
                {members.map((member) => (
                  <li key={member.userId} className="flex items-center justify-between gap-3 py-2">
                    <span>{member.invitedEmail}</span>
                    <form action={removeMemberAction}>
                      {idField}
                      <input type="hidden" name="userId" value={member.userId} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${member.invitedEmail}`}
                      >
                        Remove
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : null}
            <StatefulForm action={inviteMemberAction} submitLabel="Invite" inline>
              {idField}
              <div className="min-w-48 flex-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </StatefulForm>
          </Card>
        </div>
      </div>

      <section aria-labelledby="photos" className="mt-12">
        <h2 id="photos" className="text-lg font-semibold">
          Photos ({images.length})
        </h2>
        <p className="text-muted-foreground mt-1 mb-4 text-sm">
          Upload from your computer with{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
            pnpm photos upload ./folder --gallery {gallery.slug}
          </code>
          . See docs/guides/photos.md.
        </p>
        <ol className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-5">
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
              <p className="mt-1 flex items-center gap-1 truncate text-xs">
                {gallery.coverPhotoId === image.id ? <Badge tone="accent">Cover</Badge> : null}
                <span className="truncate">{image.filename}</span>
              </p>
              <form action={photoAction} className="mt-1 flex flex-wrap gap-1">
                {idField}
                <input type="hidden" name="photoId" value={image.id} />
                <Button
                  type="submit"
                  name="op"
                  value="earlier"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  aria-label={`Move ${image.filename} earlier`}
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
                  aria-label={`Move ${image.filename} later`}
                >
                  →
                </Button>
                <Button
                  type="submit"
                  name="op"
                  value="cover"
                  variant="ghost"
                  size="sm"
                  aria-label={`Use ${image.filename} as the cover`}
                >
                  Cover
                </Button>
                <Button
                  type="submit"
                  name="op"
                  value="delete"
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  aria-label={`Delete ${image.filename}`}
                >
                  Delete
                </Button>
              </form>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="collections" className="mt-12">
        <h2 id="collections" className="text-lg font-semibold">
          Client collections ({collections.length})
        </h2>
        <p className="text-muted-foreground mt-1 mb-4 text-sm">
          What clients have picked. Useful as a selection list for retouching or prints.
        </p>
        {collections.length > 0 ? (
          <ul className="list-none divide-y p-0 text-sm">
            {collections.map((collection) => (
              <li key={collection.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="font-medium">{collection.title}</span>
                <span className="text-muted-foreground">
                  {collection.photoCount} {collection.photoCount === 1 ? "photo" : "photos"}
                  {collection.createdByName ? ` · ${collection.createdByName}` : ""}
                </span>
                {collection.shareTokenHash ? <Badge tone="accent">Shared</Badge> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <Card className="border-danger/40 mt-12 max-w-xl p-6">
        <h2 className="mb-2 text-lg font-semibold">Delete gallery</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Permanently deletes the gallery, its photos in storage, and every collection made from it.
        </p>
        <StatefulForm
          action={deleteGalleryAction}
          submitLabel="Delete gallery"
          submitVariant="danger"
        >
          {idField}
          <div>
            <Label htmlFor="confirm">
              Type <span className="font-mono">{gallery.slug}</span> to confirm
            </Label>
            <Input id="confirm" name="confirm" autoComplete="off" required />
          </div>
        </StatefulForm>
      </Card>
    </>
  );
}
