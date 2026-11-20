/**
 * Rewrites the generated blocks of the profile README from site content.
 *
 *   pnpm readme:generate   update README.md in place
 *   pnpm readme:check      fail (exit 1) if README.md is out of date; used in CI
 *
 * Everything outside the `<!-- BEGIN:x -->` / `<!-- END:x -->` markers is
 * hand-written and never touched.
 */
import { readFile, writeFile } from "node:fs/promises";

import { getCategory, getPapers, getPosts, getProjects, pickFeatured } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { getSocialLinks } from "@/lib/social";

import { renderBlocks, replaceBlocks, type BlockName } from "./render";

const README_PATH = "README.md";
// Never list drafts or scheduled posts on the public profile.
const published = { includeUnpublished: false };

async function main() {
  const check = process.argv.includes("--check");
  const { features, readme, productionUrl } = siteConfig;

  const all = renderBlocks({
    siteUrl: productionUrl,
    links: [
      { label: "Website", url: productionUrl },
      ...(features.blog ? [{ label: "Blog", url: `${productionUrl}/blog` }] : []),
      ...(features.research ? [{ label: "Research", url: `${productionUrl}/research` }] : []),
      ...getSocialLinks().filter((link) => link.key !== "github" && link.key !== "email"),
    ],
    projects: pickFeatured(getProjects(published), readme.counts.projects).map((project) => ({
      title: project.title,
      description: project.description,
      url: project.url,
      category: getCategory(project.category)?.label ?? project.category,
    })),
    posts: features.blog
      ? getPosts(published)
          .slice(0, readme.counts.posts)
          .map((post) => ({
            title: post.title,
            url: post.url,
            date: post.date,
            source: post.externalSource,
          }))
      : [],
    papers: features.research
      ? pickFeatured(getPapers(published), readme.counts.papers).map((paper) => ({
          title: paper.title,
          url: paper.hasPage ? paper.url : `/research#${paper.slug}`,
          venue: paper.venue,
          year: paper.year,
        }))
      : [],
  });

  const blocks = Object.fromEntries(
    readme.sections.map((name: BlockName) => [name, all[name]]),
  ) as Partial<Record<BlockName, string>>;

  const current = await readFile(README_PATH, "utf8");
  const next = replaceBlocks(current, blocks);

  if (check) {
    if (current !== next) {
      console.error("README.md is out of date. Run `pnpm readme:generate` and commit the result.");
      process.exit(1);
    }
    console.log("README.md is up to date.");
    return;
  }
  if (current !== next) await writeFile(README_PATH, next);
  console.log(current === next ? "README.md is already up to date." : "README.md updated.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
