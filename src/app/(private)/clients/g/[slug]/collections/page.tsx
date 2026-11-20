import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { requireGalleryAccess } from "@/server/auth/access";
import { listCollections } from "@/server/dal/collections";

export const metadata: Metadata = { title: "Collections" };

/** The collections a visitor can manage in a gallery. */
export default async function CollectionsPage({
  params,
}: PageProps<"/clients/g/[slug]/collections">) {
  const { slug } = await params;
  const { gallery, capabilities, owner } = await requireGalleryAccess(slug);
  if (!capabilities.canManageCollections) notFound();
  const collections = await listCollections(gallery.id, owner);

  return (
    <>
      <p className="mb-4 text-sm">
        <Link href={`/clients/g/${gallery.slug}`} className="text-accent hover:underline">
          <span aria-hidden>←</span> {gallery.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Group photos into collections and share each one with its own link. To start one, select
        photos in the gallery and choose “Add to collection”.
      </p>
      {collections.length === 0 ? (
        <p className="text-muted-foreground mt-8">No collections yet.</p>
      ) : (
        <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
          {collections.map((collection) => (
            <li key={collection.id}>
              <Link
                href={`/clients/g/${gallery.slug}/collections/${collection.id}`}
                className="hover:border-accent block rounded-xl border p-5"
              >
                <span className="font-semibold">{collection.title}</span>
                <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                  {collection.photoCount} {collection.photoCount === 1 ? "photo" : "photos"}
                  {collection.shareTokenHash ? <Badge tone="accent">Shared</Badge> : null}
                  {collection.passcodeHash ? <Badge>Passcode</Badge> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
