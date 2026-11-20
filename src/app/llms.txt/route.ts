import { getLocalPosts, getPages, getPapers, getProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-static";

const list = (items: { title: string; url: string; description?: string }[]) =>
  items
    .map(
      (item) =>
        `- [${item.title}](${absoluteUrl(item.url)})${item.description ? `: ${item.description}` : ""}`,
    )
    .join("\n");

/** A Markdown index of the public site for language models (llmstxt.org). */
export function GET() {
  const sections = [
    `# ${siteConfig.name}`,
    `> ${siteConfig.description}`,
    `## Pages\n${list(getPages())}`,
    siteConfig.features.blog ? `## Blog\n${list(getLocalPosts())}` : "",
    `## Projects\n${list(getProjects())}`,
    siteConfig.features.research
      ? `## Research\n${list(getPapers().map((paper) => ({ title: paper.title, url: paper.hasPage ? paper.url : `/research#${paper.slug}`, description: `${paper.venue} ${paper.year}` })))}`
      : "",
  ].filter(Boolean);

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
