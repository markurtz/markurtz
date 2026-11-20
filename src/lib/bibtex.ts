import type { Paper } from "@/lib/content";

const ENTRY_TYPES: Record<Paper["type"], string> = {
  conference: "inproceedings",
  workshop: "inproceedings",
  journal: "article",
  preprint: "misc",
  thesis: "phdthesis",
  patent: "misc",
  talk: "misc",
};

const VENUE_FIELDS: Record<string, string> = {
  inproceedings: "booktitle",
  article: "journal",
  phdthesis: "school",
  misc: "howpublished",
};

/** Citation key such as `kurtz2026sample`: first author's surname, year, first title word. */
export function citationKey(paper: Pick<Paper, "authors" | "year" | "title">): string {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const surname = normalize(paper.authors[0]?.trim().split(/\s+/).pop() ?? "unknown");
  const word = normalize(paper.title.split(/\s+/).find((part) => normalize(part).length > 3) ?? "");
  return `${surname}${paper.year}${word}`;
}

/** The paper's BibTeX: the hand-written entry when present, otherwise generated from its fields. */
export function toBibtex(paper: Paper): string {
  if (paper.bibtex) return paper.bibtex.trim();

  const entryType = ENTRY_TYPES[paper.type];
  const fields: [string, string | undefined][] = [
    ["title", `{${paper.title}}`],
    ["author", paper.authors.join(" and ")],
    [VENUE_FIELDS[entryType] ?? "howpublished", paper.venue],
    ["year", String(paper.year)],
    ["doi", paper.links.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//, "")],
    ["url", paper.links.arxiv ?? paper.links.pdf],
  ];
  const body = fields
    .filter((field): field is [string, string] => Boolean(field[1]))
    .map(([key, value]) => `  ${key} = {${value}}`)
    .join(",\n");
  return `@${entryType}{${citationKey(paper)},\n${body}\n}`;
}
