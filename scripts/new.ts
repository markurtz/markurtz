/**
 * Scaffolds a content file with valid front matter.
 *
 *   pnpm new post "My title"
 *   pnpm new project "Walnut desk" --category woodworking
 *   pnpm new paper "Paper title"
 *   pnpm new album "Iceland 2026"
 *
 * New entries start as drafts where the collection supports it, so nothing is
 * published until `draft: true` is removed.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { siteConfig } from "../site.config";
import { slugify } from "../src/lib/utils";

export type ContentKind = "post" | "project" | "paper" | "album";

/** A file to create, relative to the repository root. */
export interface ScaffoldFile {
  path: string;
  content: string;
}

const quote = (value: string) => JSON.stringify(value);

/** Builds the files for a new content entry. Pure, so it can be tested without touching disk. */
export function scaffold(
  kind: ContentKind,
  title: string,
  options: { category?: string; date?: string } = {},
): ScaffoldFile[] {
  const slug = slugify(title);
  if (!slug) throw new Error("The title must contain letters or digits.");
  const date = options.date ?? new Date().toISOString().slice(0, 10);

  switch (kind) {
    case "post":
      return [
        {
          path: `content/blog/${slug}.mdx`,
          content: `---\ntitle: ${quote(title)}\ndescription: "TODO: one or two sentences."\ndate: ${date}\ntags: []\ndraft: true\n---\n\nWrite here.\n`,
        },
      ];
    case "project": {
      const categories = siteConfig.projectCategories.map((category) => category.id);
      const category = options.category ?? categories[0];
      if (!category || !categories.includes(category)) {
        throw new Error(`--category must be one of: ${categories.join(", ")}`);
      }
      return [
        {
          path: `content/projects/${slug}/index.mdx`,
          content: `---\ntitle: ${quote(title)}\ndescription: "TODO: one or two sentences."\ndate: ${date}\ncategory: ${category}\nstatus: in-progress\ntags: []\ndraft: true\n# cover: ./cover.jpg\n# coverAlt: "Describe the image"\n# links: { repo: "", demo: "" }\n# materials: [{ item: "", quantity: 1, cost: 0 }]\n# tools: []\n# models: [/models/example.glb]\n---\n\nWrite the build log here.\n`,
        },
      ];
    }
    case "paper":
      return [
        {
          path: `content/papers/${slug}.mdx`,
          content: `---\ntitle: ${quote(title)}\nauthors: [${quote(siteConfig.author.name)}]\nvenue: "TODO"\nyear: ${date.slice(0, 4)}\ndate: ${date}\ntype: preprint\nlinks: {}\nabstract: "TODO"\ndraft: true\n---\n`,
        },
      ];
    case "album":
      return [
        {
          path: `content/albums/${slug}/index.mdx`,
          content: `---\ntitle: ${quote(title)}\ndescription: "TODO: one or two sentences."\ndate: ${date}\nkind: photography\ntags: []\ndraft: true\n---\n`,
        },
        {
          path: `content/albums/${slug}/photos.json`,
          content: `${JSON.stringify({ album: slug, photos: [] }, null, 2)}\n`,
        },
      ];
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { category: { type: "string" } },
  });
  const [kind, ...titleParts] = positionals;
  const title = titleParts.join(" ").trim();
  if (!kind || !["post", "project", "paper", "album"].includes(kind) || !title) {
    console.error('Usage: pnpm new <post|project|paper|album> "Title" [--category <id>]');
    process.exit(1);
  }

  for (const file of scaffold(kind as ContentKind, title, { category: values.category })) {
    await mkdir(path.dirname(file.path), { recursive: true });
    // "wx" refuses to overwrite an existing file.
    await writeFile(file.path, file.content, { flag: "wx" });
    console.log(`Created ${file.path}`);
  }
  if (kind === "album") {
    console.log(`Next: pnpm photos upload ./folder --album ${slugify(title)}`);
  }
}

// Only run when executed directly, not when imported by a test.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/new.ts")) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
