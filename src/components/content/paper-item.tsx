import Link from "next/link";
import { Fragment } from "react";

import { CopyButton } from "@/components/content/copy-button";
import { Badge } from "@/components/ui/badge";
import { toBibtex } from "@/lib/bibtex";
import type { Paper } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const LINK_LABELS: Record<keyof Paper["links"], string> = {
  pdf: "PDF",
  arxiv: "arXiv",
  doi: "DOI",
  code: "Code",
  slides: "Slides",
  video: "Video",
  poster: "Poster",
};

/** The author list with the site owner's name emphasized. */
export function AuthorList({ authors }: { authors: string[] }) {
  return (
    <>
      {authors.map((author, index) => (
        <Fragment key={author}>
          {index > 0 ? ", " : null}
          {author === siteConfig.author.name ? (
            <strong className="text-foreground">{author}</strong>
          ) : (
            author
          )}
        </Fragment>
      ))}
    </>
  );
}

/** Links to a paper's PDF, code and other resources. */
export function PaperLinks({ paper }: { paper: Paper }) {
  const links = (Object.keys(LINK_LABELS) as (keyof Paper["links"])[]).filter(
    (key) => paper.links[key],
  );
  return (
    <ul className="flex list-none flex-wrap items-center gap-2 p-0">
      {links.map((key) => (
        <li key={key}>
          <a
            href={paper.links[key]}
            rel="noopener"
            className="hover:bg-muted inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium"
          >
            {LINK_LABELS[key]}
            <span className="sr-only">: {paper.title}</span>
          </a>
        </li>
      ))}
      <li>
        <CopyButton text={toBibtex(paper)} label="BibTeX" />
      </li>
    </ul>
  );
}

/** A publication in the research list. */
export function PaperItem({ paper }: { paper: Paper }) {
  return (
    <article id={paper.slug} data-paper-type={paper.type} className="py-5">
      <h3 className="text-lg font-semibold tracking-tight">
        {paper.hasPage ? (
          <Link href={paper.url} className="hover:text-accent">
            {paper.title}
          </Link>
        ) : (
          paper.title
        )}
      </h3>
      <p className="text-muted-foreground mt-1 text-sm">
        <AuthorList authors={paper.authors} />
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="italic">{paper.venue}</span>
        <span>{paper.year}</span>
        <Badge className="capitalize">{paper.type}</Badge>
      </p>
      <div className="mt-3">
        <PaperLinks paper={paper} />
      </div>
    </article>
  );
}
