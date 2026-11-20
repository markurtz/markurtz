/* eslint-disable @next/next/no-img-element -- covers are static files sized by Velite; the Vercel image optimizer is deliberately not used. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { TagList } from "@/components/content/tag-list";
import { Toc } from "@/components/content/toc";
import { Mdx } from "@/components/mdx";
import { Callout } from "@/components/mdx/callout";
import {
  getAdjacentPosts,
  getLocalPosts,
  getPost,
  getSyndicatedCopies,
  isPublished,
} from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, postJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

const TARGET_LABELS: Record<string, string> = { devto: "DEV Community", hashnode: "Hashnode" };

/** External posts have no page here, so they are not in this list. */
export function generateStaticParams() {
  if (!siteConfig.features.blog) return [];
  return getLocalPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: post.url,
    image: post.cover?.src,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated,
    canonical: post.canonicalUrl,
  });
}

/** A self-hosted blog post. */
export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { newer, older } = getAdjacentPosts(post.slug);
  const copies = getSyndicatedCopies(post.slug);
  const scheduled = !post.draft && !isPublished(post, { includeUnpublished: false });

  return (
    <article>
      <JsonLd
        data={[
          postJsonLd(post),
          breadcrumbJsonLd([
            { name: "Blog", path: "/blog" },
            { name: post.title, path: post.url },
          ]),
        ]}
      />
      <header className="mx-auto mb-10 max-w-(--prose-width) xl:mx-0">
        <p className="mb-4 text-sm">
          <Link href="/blog" className="text-accent hover:underline">
            <span aria-hidden>←</span> Blog
          </Link>
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
        <p className="text-muted-foreground mt-3 text-lg text-pretty">{post.description}</p>
        <p className="text-muted-foreground mt-4 flex flex-wrap gap-x-3 text-sm">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.updated ? (
            <span>
              Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
            </span>
          ) : null}
          {siteConfig.blog.showReadingTime ? (
            <span>{post.metadata.readingTime} min read</span>
          ) : null}
        </p>
        <div className="mt-4">
          <TagList tags={post.tags} />
        </div>
        {post.draft || scheduled ? (
          <Callout type="warning" title={post.draft ? "Draft" : "Scheduled"}>
            <p>This post is only visible in development and preview deployments.</p>
          </Callout>
        ) : null}
      </header>

      <div className="xl:grid xl:grid-cols-[minmax(0,var(--prose-width))_16rem] xl:gap-12">
        <div className="mx-auto w-full max-w-(--prose-width) xl:mx-0">
          {post.cover ? (
            <img
              src={post.cover.src}
              alt={post.coverAlt ?? ""}
              width={post.cover.width}
              height={post.cover.height}
              fetchPriority="high"
              className="mb-10 w-full rounded-xl border"
              style={{ background: `center / cover url("${post.cover.blurDataURL}")` }}
            />
          ) : null}
          <Mdx code={post.body} />

          {copies.length > 0 ? (
            <p className="text-muted-foreground mt-10 border-t pt-6 text-sm">
              Also published on{" "}
              {copies.map((copy, index) => (
                <span key={copy.target}>
                  {index > 0 ? ", " : ""}
                  <a href={copy.url} rel="noopener" className="text-accent hover:underline">
                    {TARGET_LABELS[copy.target] ?? copy.target}
                  </a>
                </span>
              ))}
              .
            </p>
          ) : null}

          <nav aria-label="More posts" className="mt-12 grid gap-4 border-t pt-6 sm:grid-cols-2">
            {older ? (
              <Link
                href={older.url}
                rel="prev"
                className="hover:border-accent rounded-lg border p-4"
              >
                <span className="text-muted-foreground block text-xs">Older</span>
                <span className="font-medium">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link
                href={newer.url}
                rel="next"
                className="hover:border-accent rounded-lg border p-4 sm:text-right"
              >
                <span className="text-muted-foreground block text-xs">Newer</span>
                <span className="font-medium">{newer.title}</span>
              </Link>
            ) : null}
          </nav>
        </div>
        <aside className="no-print hidden xl:block">
          <div className="sticky top-24">
            <Toc entries={post.toc} />
          </div>
        </aside>
      </div>
    </article>
  );
}
