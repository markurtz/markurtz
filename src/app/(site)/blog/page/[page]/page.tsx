import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { Pagination } from "@/components/content/pagination";
import { PostList } from "@/components/content/post-list";
import { getPosts, paginate } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

/** Pages 2 and up. Page 1 is `/blog`. */
export function generateStaticParams() {
  if (!siteConfig.features.blog) return [];
  const { totalPages } = paginate(getPosts(), 1, siteConfig.blog.postsPerPage);
  return Array.from({ length: totalPages - 1 }, (_, index) => ({ page: String(index + 2) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/page/[page]">): Promise<Metadata> {
  const { page } = await params;
  return buildMetadata({ title: `Blog, page ${page}`, path: `/blog/page/${page}` });
}

/** An older page of the blog list. */
export default async function BlogListPage({ params }: PageProps<"/blog/page/[page]">) {
  const pageNumber = Number((await params).page);
  const { items, page, totalPages } = paginate(
    getPosts(),
    pageNumber,
    siteConfig.blog.postsPerPage,
  );
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || items.length === 0) notFound();

  return (
    <>
      <PageHeader title="Blog" description={`Page ${page} of ${totalPages}`} />
      <PostList posts={items} />
      <Pagination page={page} totalPages={totalPages} basePath="/blog" />
    </>
  );
}
