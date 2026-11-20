/* eslint-disable @next/next/no-img-element -- album derivatives are pre-generated; the Vercel image optimizer is deliberately not used. */
import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/content/json-ld";
import { Section } from "@/components/content/page-header";
import { PaperItem } from "@/components/content/paper-item";
import { PostCard } from "@/components/content/post-card";
import { ProjectCard } from "@/components/content/project-card";
import { buttonVariants } from "@/components/ui/button";
import { getAlbums, getPapers, getPosts, getProjects, pickFeatured } from "@/lib/content";
import { albumPhotoToImage } from "@/lib/media";
import { siteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getSocialLinks } from "@/lib/social";

type SectionId = (typeof siteConfig.home.sections)[number];

function Hero() {
  const social = getSocialLinks();
  return (
    <section aria-labelledby="hero-title" className="max-w-3xl py-6 sm:py-12">
      <h1 id="hero-title" className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
        {siteConfig.name}
      </h1>
      <p className="text-accent mt-4 text-xl font-medium">{siteConfig.tagline}</p>
      <p className="text-muted-foreground mt-4 text-lg text-pretty">{siteConfig.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/about" className={buttonVariants({ size: "lg" })}>
          About me
        </Link>
        {social.slice(0, 3).map((link) => (
          <a
            key={link.key}
            href={link.url}
            rel="me noopener"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function FeaturedProjects() {
  const projects = pickFeatured(getProjects(), siteConfig.home.counts.featuredProjects);
  if (projects.length === 0) return null;
  return (
    <Section title="Featured projects" href="/projects">
      <ul className="grid list-none gap-6 p-0 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function LatestPosts() {
  if (!siteConfig.features.blog) return null;
  const posts = getPosts().slice(0, siteConfig.home.counts.latestPosts);
  if (posts.length === 0) return null;
  return (
    <Section title="Latest writing" href="/blog">
      <ul className="list-none divide-y p-0">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SelectedPapers() {
  if (!siteConfig.features.research) return null;
  const papers = pickFeatured(getPapers(), siteConfig.home.counts.selectedPapers);
  if (papers.length === 0) return null;
  return (
    <Section title="Selected publications" href="/research">
      <ul className="list-none divide-y p-0">
        {papers.map((paper) => (
          <li key={paper.slug}>
            <PaperItem paper={paper} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function PhotoStrip() {
  if (!siteConfig.features.photos) return null;
  const photos = getAlbums()
    .flatMap((album) =>
      album.photos.map((photo) => ({ album, image: albumPhotoToImage(album.slug, photo) })),
    )
    .slice(0, siteConfig.home.counts.photoStrip);
  if (photos.length === 0) return null;
  return (
    <Section title="Photography" href="/photos">
      <ul className="grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-6">
        {photos.map(({ album, image }) => (
          <li key={image.id}>
            <Link
              href={album.url}
              className="block overflow-hidden rounded-md"
              style={{ background: image.placeholder }}
            >
              <img
                src={image.src}
                alt={image.alt || `Photo from ${album.title}`}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const sections: Record<SectionId, () => ReactNode> = {
  hero: Hero,
  featuredProjects: FeaturedProjects,
  latestPosts: LatestPosts,
  selectedPapers: SelectedPapers,
  photoStrip: PhotoStrip,
};

/** The home page. Its sections and their order come from `siteConfig.home`. */
export default function HomePage() {
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      {siteConfig.home.sections.map((id) => {
        const SectionComponent = sections[id];
        return <SectionComponent key={id} />;
      })}
    </>
  );
}
