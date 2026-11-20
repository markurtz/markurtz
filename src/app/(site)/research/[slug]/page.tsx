import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { PageHeader } from "@/components/content/page-header";
import { AuthorList, PaperLinks } from "@/components/content/paper-item";
import { Mdx } from "@/components/mdx";
import { getPaper, getPapers } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, paperJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

/** Only papers with a body get their own page. */
export function generateStaticParams() {
  if (!siteConfig.features.research) return [];
  return getPapers()
    .filter((paper) => paper.hasPage)
    .map((paper) => ({ slug: paper.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/research/[slug]">): Promise<Metadata> {
  const paper = getPaper((await params).slug);
  if (!paper) return {};
  return {
    ...buildMetadata({
      title: paper.title,
      description: paper.abstract || paper.description,
      path: paper.url,
      type: "article",
      publishedTime: paper.date,
    }),
    // Highwire Press tags, which Google Scholar and other indexers read.
    other: {
      citation_title: paper.title,
      citation_author: paper.authors,
      citation_publication_date: paper.date.slice(0, 10).replaceAll("-", "/"),
      citation_conference_title: paper.venue,
      ...(paper.links.pdf ? { citation_pdf_url: paper.links.pdf } : {}),
      ...(paper.links.doi ? { citation_doi: paper.links.doi } : {}),
    },
  };
}

/** A paper's page: citation details, abstract and plain-language summary. */
export default async function PaperPage({ params }: PageProps<"/research/[slug]">) {
  const paper = getPaper((await params).slug);
  if (!paper) notFound();

  return (
    <article>
      <JsonLd
        data={[
          paperJsonLd(paper),
          breadcrumbJsonLd([
            { name: "Research", path: "/research" },
            { name: paper.title, path: paper.url },
          ]),
        ]}
      />
      <p className="mb-4 text-sm">
        <Link href="/research" className="text-accent hover:underline">
          <span aria-hidden>←</span> Research
        </Link>
      </p>
      <PageHeader title={paper.title}>
        <p className="text-muted-foreground mt-3">
          <AuthorList authors={paper.authors} />
        </p>
        <p className="mt-1">
          <span className="italic">{paper.venue}</span>, {paper.year}
        </p>
        <div className="mt-4">
          <PaperLinks paper={paper} />
        </div>
      </PageHeader>
      {paper.abstract ? (
        <section aria-labelledby="abstract" className="bg-muted mb-10 max-w-3xl rounded-lg p-5">
          <h2 id="abstract" className="mb-2 font-semibold">
            Abstract
          </h2>
          <p className="text-[0.95rem] leading-relaxed">{paper.abstract}</p>
        </section>
      ) : null}
      <Mdx code={paper.body} />
    </article>
  );
}
