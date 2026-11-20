import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { PostList } from "@/components/content/post-list";
import { getPostsByTag, getTags } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  if (!siteConfig.features.blog) return [];
  return getTags().map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  const label = getTags().find((entry) => entry.slug === tag)?.tag ?? tag;
  return buildMetadata({ title: `Posts tagged ${label}`, path: `/blog/tags/${tag}` });
}

/** Posts carrying one tag. */
export default async function TagPage({ params }: PageProps<"/blog/tags/[tag]">) {
  const { tag } = await params;
  const entry = getTags().find((candidate) => candidate.slug === tag);
  if (!entry) notFound();

  return (
    <>
      <p className="mb-4 text-sm">
        <Link href="/blog" className="text-accent hover:underline">
          <span aria-hidden>←</span> Blog
        </Link>
      </p>
      <PageHeader
        title={`Tagged “${entry.tag}”`}
        description={`${entry.count} ${entry.count === 1 ? "post" : "posts"}`}
      />
      <PostList posts={getPostsByTag(tag)} />
    </>
  );
}
