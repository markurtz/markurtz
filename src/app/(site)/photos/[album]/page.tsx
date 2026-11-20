import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { PageHeader } from "@/components/content/page-header";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { Mdx } from "@/components/mdx";
import { getAlbum, getAlbums } from "@/lib/content";
import { albumPhotoToImage } from "@/lib/media";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { absoluteUrl, formatDate } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  if (!siteConfig.features.photos) return [];
  return getAlbums().map((album) => ({ album: album.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/photos/[album]">): Promise<Metadata> {
  const album = getAlbum((await params).album);
  if (!album) return {};
  const cover = album.coverImage ? albumPhotoToImage(album.slug, album.coverImage) : undefined;
  return buildMetadata({
    title: album.title,
    description: album.description,
    path: album.url,
    image: cover?.fullSrc ? absoluteUrl(cover.fullSrc) : undefined,
  });
}

/** A public album: optional travel notes, then the photo grid with a lightbox. */
export default async function AlbumPage({ params }: PageProps<"/photos/[album]">) {
  const album = getAlbum((await params).album);
  if (!album) notFound();
  const images = album.photos.map((photo) => albumPhotoToImage(album.slug, photo));

  return (
    <article>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Photos", path: "/photos" },
          { name: album.title, path: album.url },
        ])}
      />
      <p className="mb-4 text-sm">
        <Link href="/photos" className="text-accent hover:underline">
          <span aria-hidden>←</span> Photos
        </Link>
      </p>
      <PageHeader title={album.title} description={album.description}>
        <p className="text-muted-foreground mt-3 text-sm">
          <time dateTime={album.date}>{formatDate(album.date, { day: undefined })}</time>
          {album.location ? ` · ${album.location}` : ""}
        </p>
      </PageHeader>
      {album.raw.trim() ? <Mdx code={album.body} className="mb-10" /> : null}
      {images.length > 0 ? (
        <PhotoGrid images={images} />
      ) : (
        <p className="text-muted-foreground">No photos yet.</p>
      )}
    </article>
  );
}
