import { defineSiteConfig } from "./src/lib/site-config";

/**
 * The one file to edit to customize the site: identity, navigation, project
 * categories, home page sections and feature switches.
 *
 * See docs/guides/customizing.md. Values marked TODO are placeholders for Mark.
 */
export const siteConfig = defineSiteConfig({
  // Preview deployments use their own address, so links and cookies made
  // there never point at production.
  url:
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  // TODO (Mark): replace with the real domain once it is chosen.
  productionUrl: "https://example.com",
  name: "Mark Kurtz",
  title: "Mark Kurtz",
  tagline: "TODO: one line about what you do",
  description:
    "TODO: two sentences used for search engines and the profile README. Personal website of Mark Kurtz.",
  locale: "en-US",
  author: { name: "Mark Kurtz", email: "", avatar: "", location: "" },

  // Any subset. Rendered in the footer, the about page and the README.
  // Use the handle or id only, not a full URL (email is the address).
  social: {
    github: "markurtz",
    linkedin: "",
    scholar: "",
    orcid: "",
    bluesky: "",
    mastodon: "",
    x: "",
    email: "",
  },

  // Order and labels of the header navigation.
  nav: [
    { label: "About", href: "/about" },
    { label: "Work", href: "/work" },
    { label: "Research", href: "/research" },
    { label: "Blog", href: "/blog" },
    { label: "Projects", href: "/projects" },
    { label: "Photos", href: "/photos" },
  ],

  // Add a hobby by adding a line here. Its listing page, filter and README
  // entry follow from this list.
  projectCategories: [
    {
      id: "software",
      label: "Software",
      icon: "code",
      description: "Open source and side projects.",
    },
    { id: "3d-printing", label: "3D Printing", icon: "box", description: "Designs and prints." },
    {
      id: "woodworking",
      label: "Woodworking",
      icon: "hammer",
      description: "Furniture and shop builds.",
    },
    { id: "diy", label: "DIY", icon: "wrench", description: "Everything else made by hand." },
  ],

  // Which sections appear on the home page, in order.
  home: {
    sections: ["hero", "featuredProjects", "latestPosts", "selectedPapers", "photoStrip"],
    counts: { featuredProjects: 4, latestPosts: 3, selectedPapers: 3, photoStrip: 6 },
  },

  // Switch whole areas on or off. clientGalleries and gatedPages also need the
  // backend environment variables (see .env.example and docs/guides/deploy.md).
  features: {
    blog: true,
    research: true,
    photos: true,
    search: true,
    contact: false,
    clientGalleries: process.env.FEATURE_CLIENT_GALLERIES === "true",
    gatedPages: process.env.FEATURE_GATED_PAGES === "true",
    comments: false,
    analytics: true,
  },

  blog: { postsPerPage: 10, showReadingTime: true, syndicationTargets: ["devto", "hashnode"] },
  syndication: { autoPublish: false },
  readme: {
    sections: ["links", "projects", "posts", "papers"],
    counts: { projects: 5, posts: 5, papers: 5 },
  },
  media: {
    publicBaseUrl: process.env.NEXT_PUBLIC_MEDIA_URL ?? "",
    widths: [640, 1280, 2560],
  },
  clientArea: { label: "Client Galleries", defaultExpiryDays: 90, sessionDays: 30 },
});
