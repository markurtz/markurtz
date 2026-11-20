/* eslint-disable @next/next/no-img-element -- album derivatives are pre-generated; the Vercel image optimizer is deliberately not used. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { Badge } from "@/components/ui/badge";
import { getAlbums } from "@/lib/content";
import { albumPhotoToImage } from "@/lib/media";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

const TITLE = "Photos";
const DESCRIPTION = "Photography and travel albums.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/photos",
});

/** Public albums, grouped under photography and travel. */
export default function PhotosPage() {
  if (!siteConfig.features.photos) notFound();
  const albums = getAlbums();
  const kinds = [
    { id: "photography" as const, label: "Photography" },
    { id: "travel" as const, label: "Travel" },
  ].filter((kind) => albums.some((album) => album.kind === kind.id));

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />
      {albums.length === 0 ? <p className="text-muted-foreground">No albums yet.</p> : null}
      {kinds.map((kind) => (
        <section key={kind.id} aria-labelledby={`kind-${kind.id}`} className="mb-12">
          {kinds.length > 1 ? (
            <h2 id={`kind-${kind.id}`} className="mb-6 text-2xl font-semibold tracking-tight">
              {kind.label}
            </h2>
          ) : (
            <h2 id={`kind-${kind.id}`} className="sr-only">
              {kind.label}
            </h2>
          )}
          <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {albums
              .filter((album) => album.kind === kind.id)
              .map((album) => {
                const cover = album.coverImage
                  ? albumPhotoToImage(album.slug, album.coverImage)
                  : undefined;
                return (
                  <li key={album.slug}>
                    <article className="group bg-card hover:border-accent relative overflow-hidden rounded-xl border transition-colors">
                      {cover ? (
                        <img
                          src={cover.src}
                          srcSet={cover.srcSet}
                          sizes="(min-width: 64rem) 24rem, (min-width: 40rem) 50vw, 100vw"
                          alt={cover.alt}
                          width={cover.width}
                          height={cover.height}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[3/2] w-full object-cover"
                          style={{ background: cover.placeholder }}
                        />
                      ) : (
                        <div className="bg-muted aspect-[3/2]" aria-hidden />
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold tracking-tight">
                          <Link href={album.url} className="after:absolute after:inset-0">
                            {album.title}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                          <time dateTime={album.date}>
                            {formatDate(album.date, { day: undefined })}
                          </time>
                          {album.location ? <span>{album.location}</span> : null}
                          <Badge>
                            {album.photos.length} {album.photos.length === 1 ? "photo" : "photos"}
                          </Badge>
                        </p>
                      </div>
                    </article>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </>
  );
}
