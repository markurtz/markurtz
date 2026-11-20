import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { PaperItem } from "@/components/content/paper-item";
import { PaperList } from "@/components/content/paper-list";
import { getPapersByYear } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const TITLE = "Research";
const DESCRIPTION = "Papers, preprints and other publications.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/research",
});

/** Publications grouped by year, with type filters. */
export default function ResearchPage() {
  if (!siteConfig.features.research) notFound();
  const groups = getPapersByYear();
  const types = [
    ...new Set(groups.flatMap((group) => group.papers.map((paper) => paper.type))),
  ].sort();

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />
      {groups.length === 0 ? <p className="text-muted-foreground">No publications yet.</p> : null}
      <PaperList
        types={types}
        groups={groups.map((group) => ({
          year: group.year,
          items: group.papers.map((paper) => ({
            slug: paper.slug,
            type: paper.type,
            node: <PaperItem paper={paper} />,
          })),
        }))}
      />
    </>
  );
}
