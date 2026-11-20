import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { Pagination } from "@/components/content/pagination";
import { PostList } from "@/components/content/post-list";
import { getPosts, getTags, paginate } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const TITLE = "Blog";
const DESCRIPTION = "Writing, hosted here and elsewhere.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blog",
});

/** The first page of the blog, with the tag list. */
export default function BlogPage() {
  if (!siteConfig.features.blog) notFound();
  const { items, page, totalPages } = paginate(getPosts(), 1, siteConfig.blog.postsPerPage);
  const tags = getTags();

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION}>
        {tags.length > 0 ? (
          <ul aria-label="Tags" className="mt-5 flex list-none flex-wrap gap-2 p-0">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={`/blog/tags/${tag.slug}`}
                  className="hover:bg-muted rounded-full border px-3 py-1 text-sm"
                >
                  {tag.tag} <span className="text-muted-foreground">{tag.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </PageHeader>
      <PostList posts={items} />
      <Pagination page={page} totalPages={totalPages} basePath="/blog" />
    </>
  );
}
