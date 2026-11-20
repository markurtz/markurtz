import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import { defineCollection, defineConfig, s } from "velite";

import { siteConfig } from "./site.config";
import { SYNDICATION_TARGETS } from "./src/lib/site-config";

/**
 * Content collections and their schemas. Velite validates every file under
 * `content/` against these at build time and writes typed JSON to `.velite/`.
 *
 * Only `src/lib/content/` may import that output.
 */

const categoryIds = siteConfig.projectCategories.map((category) => category.id) as [
  string,
  ...string[],
];

/** Fields shared by every collection that has a page. */
const common = {
  title: s.string().max(140),
  description: s.string().max(400),
  date: s.isodate(),
  updated: s.isodate().optional(),
  tags: s.array(s.string()).default([]),
  draft: s.boolean().default(false),
  featured: s.boolean().default(false),
  cover: s.image().optional(),
  coverAlt: s.string().optional(),
  path: s.path(),
};

const body = {
  body: s.mdx(),
  raw: s.raw(),
  metadata: s.metadata(),
  toc: s.toc(),
};

/** Cover images must describe themselves for screen readers. */
const requireCoverAlt = <T extends { cover?: unknown; coverAlt?: string }>(
  data: T,
  ctx: { addIssue: (issue: { code: "custom"; message: string; path: string[] }) => void },
) => {
  if (data.cover && !data.coverAlt) {
    ctx.addIssue({
      code: "custom",
      message: "coverAlt is required when cover is set",
      path: ["coverAlt"],
    });
  }
};

/** `blog/hello` and `projects/desk/index` both become their last meaningful segment. */
const slugFromPath = (path: string) =>
  path
    .replace(/\/index$/, "")
    .split("/")
    .pop() as string;

const optionalUrl = s
  .string()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || /^https?:\/\//.test(value), "Must be an http(s) URL");

const linkRecord = <K extends string>(keys: readonly K[]) =>
  s
    .object(
      Object.fromEntries(keys.map((key) => [key, optionalUrl])) as Record<K, typeof optionalUrl>,
    )
    .default({} as never);

const pages = defineCollection({
  name: "Page",
  pattern: "pages/*.mdx",
  schema: s
    .object({
      title: s.string().max(140),
      description: s.string().max(400),
      updated: s.isodate().optional(),
      draft: s.boolean().default(false),
      path: s.path(),
      ...body,
    })
    .transform((data) => ({
      ...data,
      slug: slugFromPath(data.path),
      url: `/${slugFromPath(data.path)}`,
    })),
});

const posts = defineCollection({
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s
    .object({
      ...common,
      /** Set for posts hosted elsewhere. The card links out and no page is built. */
      externalUrl: optionalUrl,
      /** Shown as a badge on the card, for example the publication name. */
      externalSource: s.string().optional(),
      /** Overrides `blog.syndicationTargets`. An empty list disables syndication. */
      syndicate: s.array(s.enum(SYNDICATION_TARGETS)).optional(),
      /** Only when this site is not the original home of the post. */
      canonicalUrl: optionalUrl,
      html: s.markdown(),
      ...body,
    })
    .superRefine(requireCoverAlt)
    .transform((data) => {
      const slug = slugFromPath(data.path);
      return {
        ...data,
        slug,
        url: data.externalUrl ?? `/blog/${slug}`,
        isExternal: Boolean(data.externalUrl),
      };
    }),
});

export const PAPER_TYPES = [
  "conference",
  "journal",
  "preprint",
  "workshop",
  "thesis",
  "patent",
  "talk",
] as const;

const papers = defineCollection({
  name: "Paper",
  pattern: "papers/*.mdx",
  schema: s
    .object({
      ...common,
      description: s.string().max(400).default(""),
      authors: s.array(s.string()).min(1),
      venue: s.string(),
      year: s.number().int(),
      type: s.enum(PAPER_TYPES),
      links: linkRecord(["pdf", "arxiv", "doi", "code", "slides", "video", "poster"] as const),
      abstract: s.string().default(""),
      bibtex: s.string().optional(),
      ...body,
    })
    .superRefine(requireCoverAlt)
    .transform((data) => {
      const slug = slugFromPath(data.path);
      const hasPage = data.raw.trim().length > 0;
      return { ...data, slug, hasPage, url: `/research/${slug}` };
    }),
});

const projects = defineCollection({
  name: "Project",
  pattern: "projects/*/index.mdx",
  schema: s
    .object({
      ...common,
      category: s.enum(categoryIds, {
        message: `category must be one of the ids in site.config.ts projectCategories: ${categoryIds.join(", ")}`,
      }),
      status: s.enum(["idea", "in-progress", "completed", "archived"]).default("completed"),
      gallery: s.array(s.object({ src: s.image(), alt: s.string() })).default([]),
      links: linkRecord(["repo", "demo", "docs", "printables", "video"] as const),
      tech: s.array(s.string()).default([]),
      materials: s
        .array(
          s.object({
            item: s.string(),
            quantity: s.union([s.string(), s.number()]).default(1),
            cost: s.number().nonnegative().optional(),
            link: optionalUrl,
          }),
        )
        .default([]),
      tools: s.array(s.string()).default([]),
      buildTime: s.string().optional(),
      difficulty: s.number().int().min(1).max(5).optional(),
      /** `.glb` paths under `public/`, for example `/models/bracket.glb`. */
      models: s.array(s.string().regex(/^\/models\/.+\.glb$/)).default([]),
      ...body,
    })
    .superRefine(requireCoverAlt)
    .transform((data) => {
      const slug = slugFromPath(data.path);
      return { ...data, slug, url: `/projects/${slug}` };
    }),
});

const albums = defineCollection({
  name: "Album",
  pattern: "albums/*/index.mdx",
  schema: s
    .object({
      ...common,
      kind: s.enum(["photography", "travel"]).default("photography"),
      location: s.string().optional(),
      /** Id of the photo in `photos.json` used as the cover. Defaults to the first photo. */
      coverPhoto: s.string().optional(),
      ...body,
    })
    .transform((data) => {
      const slug = slugFromPath(data.path);
      return { ...data, slug, url: `/photos/${slug}` };
    }),
});

/** One manifest per album, written by `pnpm photos upload --album`. */
const albumManifests = defineCollection({
  name: "AlbumManifest",
  pattern: "albums/*/photos.json",
  schema: s.object({
    album: s.string(),
    photos: s.array(
      s.object({
        id: s.string(),
        hash: s.string(),
        width: s.number().int().positive(),
        height: s.number().int().positive(),
        alt: s.string().default(""),
        caption: s.string().default(""),
        thumbhash: s.string(),
        widths: s.array(s.number().int().positive()),
        exif: s
          .object({
            camera: s.string(),
            lens: s.string(),
            focalLength: s.string(),
            aperture: s.string(),
            shutter: s.string(),
            iso: s.string(),
            takenAt: s.string(),
          })
          .partial()
          .default({}),
      }),
    ),
  }),
});

/**
 * Unlisted pages behind a passcode (`/p/<gate>`). The repository is public, so
 * these are unlisted, not secret. They never appear in lists, feeds or search.
 */
const privatePages = defineCollection({
  name: "PrivatePage",
  pattern: "private/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().default(""),
    gate: s.string().regex(/^[a-z0-9-]+$/),
    ...body,
  }),
});

const linkList = s.array(s.object({ label: s.string(), url: s.string().url() })).default([]);

const experience = defineCollection({
  name: "Experience",
  pattern: "data/experience.yaml",
  schema: s.object({
    company: s.string(),
    role: s.string(),
    start: s.string().regex(/^\d{4}(-\d{2})?$/, "Use YYYY or YYYY-MM"),
    end: s
      .string()
      .regex(/^\d{4}(-\d{2})?$/, "Use YYYY or YYYY-MM")
      .optional(),
    location: s.string().optional(),
    summary: s.string().default(""),
    highlights: s.array(s.string()).default([]),
    links: linkList,
  }),
});

const education = defineCollection({
  name: "Education",
  pattern: "data/education.yaml",
  schema: s.object({
    school: s.string(),
    degree: s.string(),
    start: s.string().regex(/^\d{4}(-\d{2})?$/),
    end: s
      .string()
      .regex(/^\d{4}(-\d{2})?$/)
      .optional(),
    location: s.string().optional(),
    summary: s.string().default(""),
  }),
});

const talks = defineCollection({
  name: "Talk",
  pattern: "data/talks.yaml",
  schema: s.object({
    title: s.string(),
    event: s.string(),
    date: s.isodate(),
    location: s.string().optional(),
    links: linkList,
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
    clean: true,
  },
  collections: {
    pages,
    posts,
    papers,
    projects,
    albums,
    albumManifests,
    privatePages,
    experience,
    education,
    talks,
  },
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [
        rehypePrettyCode,
        { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false },
      ],
      [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["heading-anchor"] } }],
    ],
  },
  markdown: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] },
});
