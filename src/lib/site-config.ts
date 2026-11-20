import { z } from "zod";

/**
 * Schema and helper for `site.config.ts`, the one file edited to customize the
 * site. Validation runs at build time so a typo fails with a readable message.
 */

const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().startsWith("/"),
});

const categorySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "Category ids are lowercase letters, digits and dashes"),
  label: z.string().min(1),
  icon: z.enum(["code", "box", "hammer", "wrench", "camera", "sparkles"]).default("sparkles"),
  description: z.string().default(""),
});

/** Home page sections that can be listed in `home.sections`. */
export const HOME_SECTIONS = [
  "hero",
  "featuredProjects",
  "latestPosts",
  "selectedPapers",
  "photoStrip",
] as const;

/** README blocks that `scripts/readme/generate.ts` knows how to render. */
export const README_SECTIONS = ["links", "projects", "posts", "papers"] as const;

/** Services the syndication job can cross-post to. */
export const SYNDICATION_TARGETS = ["devto", "hashnode"] as const;

const socialSchema = z
  .object({
    github: z.string(),
    linkedin: z.string(),
    scholar: z.string(),
    orcid: z.string(),
    bluesky: z.string(),
    mastodon: z.string(),
    x: z.string(),
    email: z.string(),
  })
  .partial();

export const siteConfigSchema = z.object({
  url: z
    .url()
    .transform((value) => value.replace(/\/+$/, ""))
    .describe("Canonical origin, without a trailing slash"),
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string(),
  description: z.string().min(1),
  locale: z.string().default("en-US"),
  author: z.object({
    name: z.string().min(1),
    email: z.string().default(""),
    avatar: z.string().default(""),
    location: z.string().default(""),
  }),
  social: socialSchema.default({}),
  nav: z.array(navItemSchema).min(1),
  projectCategories: z
    .array(categorySchema)
    .min(1)
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, {
      message: "Project category ids must be unique",
    }),
  home: z.object({
    sections: z.array(z.enum(HOME_SECTIONS)),
    counts: z.object({
      featuredProjects: z.number().int().positive().default(4),
      latestPosts: z.number().int().positive().default(3),
      selectedPapers: z.number().int().positive().default(3),
      photoStrip: z.number().int().positive().default(6),
    }),
  }),
  features: z.object({
    blog: z.boolean().default(true),
    research: z.boolean().default(true),
    photos: z.boolean().default(true),
    search: z.boolean().default(true),
    contact: z.boolean().default(false),
    clientGalleries: z.boolean().default(false),
    gatedPages: z.boolean().default(false),
    comments: z.boolean().default(false),
    analytics: z.boolean().default(true),
  }),
  blog: z.object({
    postsPerPage: z.number().int().positive().default(10),
    showReadingTime: z.boolean().default(true),
    syndicationTargets: z.array(z.enum(SYNDICATION_TARGETS)).default([]),
  }),
  syndication: z
    .object({
      /** Publish cross-posts immediately instead of creating drafts. */
      autoPublish: z.boolean().default(false),
    })
    .default({ autoPublish: false }),
  readme: z
    .object({
      sections: z.array(z.enum(README_SECTIONS)).default([...README_SECTIONS]),
      counts: z
        .object({
          projects: z.number().int().positive().default(5),
          posts: z.number().int().positive().default(5),
          papers: z.number().int().positive().default(5),
        })
        .default({ projects: 5, posts: 5, papers: 5 }),
    })
    .default({ sections: [...README_SECTIONS], counts: { projects: 5, posts: 5, papers: 5 } }),
  media: z.object({
    /** Origin of the public media bucket. Empty serves from `/media` in `public/`. */
    publicBaseUrl: z.string().transform((value) => value.replace(/\/+$/, "")),
    widths: z.array(z.number().int().positive()).min(1),
  }),
  clientArea: z.object({
    label: z.string().default("Client Galleries"),
    defaultExpiryDays: z.number().int().positive().default(90),
    sessionDays: z.number().int().positive().default(30),
  }),
});

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfig = z.output<typeof siteConfigSchema>;
export type ProjectCategory = SiteConfig["projectCategories"][number];
export type SocialKey = keyof z.output<typeof socialSchema>;
export type SyndicationTarget = (typeof SYNDICATION_TARGETS)[number];

/** Validates the site configuration and fills in defaults. */
export function defineSiteConfig(input: SiteConfigInput): SiteConfig {
  const result = siteConfigSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid site.config.ts:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
