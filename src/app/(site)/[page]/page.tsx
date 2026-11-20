import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { Mdx } from "@/components/mdx";
import { getPage, getPages } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

/** One static page per file in `content/pages`. */
export function generateStaticParams() {
  return getPages().map((page) => ({ page: page.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[page]">): Promise<Metadata> {
  const page = getPage((await params).page);
  if (!page) return {};
  return buildMetadata({ title: page.title, description: page.description, path: page.url });
}

/** A free-form page such as About or Hobbies, rendered from MDX. */
export default async function ContentPage({ params }: PageProps<"/[page]">) {
  const page = getPage((await params).page);
  if (!page) notFound();

  return (
    <article>
      <PageHeader title={page.title} description={page.description}>
        {page.updated ? (
          <p className="text-muted-foreground mt-3 text-sm">
            Updated <time dateTime={page.updated}>{formatDate(page.updated)}</time>
          </p>
        ) : null}
      </PageHeader>
      <Mdx code={page.body} />
    </article>
  );
}
