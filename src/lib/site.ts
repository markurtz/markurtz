/**
 * Site-wide constants shared by metadata, navigation, and feeds.
 */
export const siteConfig = {
  name: "Mark Kurtz",
  description: "Personal website of Mark Kurtz.",
  /** Canonical origin, without a trailing slash. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  links: {
    github: "https://github.com/markurtz",
  },
} as const;

export type SiteConfig = typeof siteConfig;
