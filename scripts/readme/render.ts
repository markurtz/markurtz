/**
 * Pure rendering for the generated blocks of the profile README. Output is
 * deterministic (no timestamps), so running the generator twice gives no diff.
 */

/** A generated section between `<!-- BEGIN:name -->` and `<!-- END:name -->`. */
export type BlockName = "links" | "projects" | "posts" | "papers";

export interface ReadmeData {
  siteUrl: string;
  links: { label: string; url: string }[];
  projects: { title: string; description: string; url: string; category: string }[];
  posts: { title: string; url: string; date: string; source?: string }[];
  papers: { title: string; url: string; venue: string; year: number }[];
}

const absolute = (siteUrl: string, url: string) =>
  /^https?:\/\//.test(url) ? url : `${siteUrl}${url}`;

/** Escapes characters that would break a Markdown link label. */
const label = (text: string) => text.replace(/([\[\]])/g, "\\$1");

/** Renders every block's Markdown. An empty list renders a short placeholder line. */
export function renderBlocks(data: ReadmeData): Record<BlockName, string> {
  const or = (lines: string[], empty: string) => (lines.length > 0 ? lines.join("\n") : empty);
  return {
    links: or(
      [data.links.map((link) => `[${label(link.label)}](${link.url})`).join(" · ")].filter(Boolean),
      "",
    ),
    projects: or(
      data.projects.map(
        (project) =>
          `- [**${label(project.title)}**](${absolute(data.siteUrl, project.url)}) (${project.category}): ${project.description}`,
      ),
      "_Nothing here yet._",
    ),
    posts: or(
      data.posts.map(
        (post) =>
          `- [${label(post.title)}](${absolute(data.siteUrl, post.url)})${post.source ? ` (${post.source})` : ""}, ${post.date.slice(0, 10)}`,
      ),
      "_Nothing here yet._",
    ),
    papers: or(
      data.papers.map(
        (paper) =>
          `- [${label(paper.title)}](${absolute(data.siteUrl, paper.url)}), _${paper.venue}_ ${paper.year}`,
      ),
      "_Nothing here yet._",
    ),
  };
}

/**
 * Replaces the text between each marker pair. Marker pairs that are not in the
 * README are skipped, so deleting a pair removes that section for good.
 * Everything outside the markers is left exactly as written.
 */
export function replaceBlocks(readme: string, blocks: Partial<Record<BlockName, string>>): string {
  let output = readme;
  for (const [name, content] of Object.entries(blocks)) {
    const pattern = new RegExp(`(<!-- BEGIN:${name} -->)[\\s\\S]*?(<!-- END:${name} -->)`);
    output = output.replace(pattern, (_match, begin: string, end: string) =>
      // Blank lines around the content match what Prettier would produce.
      content ? `${begin}\n\n${content}\n\n${end}` : `${begin}\n${end}`,
    );
  }
  return output;
}
