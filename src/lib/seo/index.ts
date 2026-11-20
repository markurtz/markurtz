import type { Metadata } from "next";

import type { Paper, Post, Project } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { getSocialLinks } from "@/lib/social";
import { absoluteUrl } from "@/lib/utils";

import { signOgText } from "./og";

/** Inputs for a page's metadata. */
export interface PageSeo {
  title: string;
  description?: string;
  /** Site path, used for the canonical URL. */
  path: string;
  /** Absolute or site-relative image. Defaults to a generated Open Graph image. */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Overrides the canonical URL when this site is not the original source. */
  canonical?: string;
  noindex?: boolean;
}

/** URL of the generated Open Graph image for a title. */
export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  // The route renders only text carrying this site's signature.
  params.set("sig", signOgText(title, subtitle));
  return `/api/og?${params.toString()}`;
}

/** Builds canonical, Open Graph and Twitter metadata for a page. */
export function buildMetadata(seo: PageSeo): Metadata {
  const description = seo.description || siteConfig.description;
  const image = seo.image ?? ogImageUrl(seo.title);
  const canonical = seo.canonical ?? absoluteUrl(seo.path);

  return {
    title: seo.title,
    description,
    alternates: { canonical },
    robots: seo.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: seo.type ?? "website",
      title: seo.title,
      description,
      url: absoluteUrl(seo.path),
      siteName: siteConfig.name,
      locale: siteConfig.locale.replace("-", "_"),
      images: [{ url: image }],
      ...(seo.type === "article"
        ? {
            publishedTime: seo.publishedTime,
            modifiedTime: seo.modifiedTime,
            authors: [siteConfig.author.name],
          }
        : {}),
    },
    twitter: { card: "summary_large_image", title: seo.title, description, images: [image] },
  };
}

type JsonLd = Record<string, unknown>;

const person = (): JsonLd => ({
  "@type": "Person",
  name: siteConfig.author.name,
  url: siteConfig.url,
  sameAs: getSocialLinks()
    .filter((link) => link.key !== "email")
    .map((link) => link.url),
});

/** `Person` and `WebSite` for the home page. */
export function siteJsonLd(): JsonLd[] {
  return [
    { "@context": "https://schema.org", ...person(), description: siteConfig.description },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: siteConfig.locale,
    },
  ];
}

/** `BlogPosting` for a self-hosted post. */
export function postJsonLd(post: Post): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url: absoluteUrl(post.url),
    mainEntityOfPage: absoluteUrl(post.url),
    image: post.cover ? absoluteUrl(post.cover.src) : undefined,
    keywords: post.tags.join(", "),
    author: person(),
  };
}

/** `ScholarlyArticle` for a paper. */
export function paperJsonLd(paper: Paper): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: paper.title,
    abstract: paper.abstract || undefined,
    datePublished: paper.date,
    url: absoluteUrl(paper.url),
    author: paper.authors.map((name) => ({ "@type": "Person", name })),
    isPartOf: { "@type": "PublicationIssue", name: paper.venue },
    sameAs: [paper.links.doi, paper.links.arxiv, paper.links.pdf].filter(Boolean),
  };
}

/** `CreativeWork` (or `SoftwareSourceCode`) for a project. */
export function projectJsonLd(project: Project): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": project.links.repo ? "SoftwareSourceCode" : "CreativeWork",
    name: project.title,
    description: project.description,
    dateCreated: project.date,
    url: absoluteUrl(project.url),
    image: project.cover ? absoluteUrl(project.cover.src) : undefined,
    codeRepository: project.links.repo,
    keywords: project.tags.join(", "),
    creator: person(),
  };
}

/** `BreadcrumbList` from an ordered trail of named paths. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Serializes JSON-LD for a script tag, escaping `<` so content cannot close the tag. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
