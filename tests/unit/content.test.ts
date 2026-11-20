// ## WRITTEN BY AI ##
import { describe, expect, it } from "vitest";

import {
  getAdjacentPosts,
  getAlbum,
  getAlbums,
  getCategory,
  getLocalPosts,
  getPage,
  getPaper,
  getPapers,
  getPapersByYear,
  getPost,
  getPosts,
  getPostsByTag,
  getPrivatePage,
  getProject,
  getProjects,
  getProjectsByCategory,
  getSyndicationTargets,
  getTags,
  isPublished,
  paginate,
  pickFeatured,
} from "@/lib/content";
import { buildSearchDocuments } from "@/lib/search";
import { siteConfig } from "@/lib/site";

const production = { includeUnpublished: false };

describe("isPublished", () => {
  const now = new Date("2026-06-01T00:00:00Z");

  it("hides drafts and future-dated entries in production", () => {
    expect(isPublished({ draft: true, date: "2026-01-01" }, { ...production, now })).toBe(false);
    expect(isPublished({ draft: false, date: "2026-07-01" }, { ...production, now })).toBe(false);
    expect(isPublished({ draft: false, date: "2026-05-01" }, { ...production, now })).toBe(true);
    expect(isPublished({ draft: false }, { ...production, now })).toBe(true);
  });

  it("shows everything in development and previews", () => {
    expect(
      isPublished({ draft: true, date: "2030-01-01" }, { includeUnpublished: true, now }),
    ).toBe(true);
  });
});

describe("blog accessors", () => {
  it("returns posts newest first", () => {
    const dates = getPosts().map((post) => post.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("links external posts out and builds no page for them", () => {
    const external = getPosts().filter((post) => post.isExternal);
    expect(external.length).toBeGreaterThan(0);
    for (const post of external) {
      expect(post.url).toMatch(/^https?:\/\//);
      expect(getPost(post.slug)).toBeUndefined();
      expect(getLocalPosts().some((local) => local.slug === post.slug)).toBe(false);
      expect(getSyndicationTargets(post)).toEqual([]);
    }
  });

  it("gives self-hosted posts a site URL, reading time and a table of contents", () => {
    const [post] = getLocalPosts();
    expect(post).toBeDefined();
    expect(post?.url).toBe(`/blog/${post?.slug}`);
    expect(post?.metadata.readingTime).toBeGreaterThan(0);
    expect(Array.isArray(post?.toc)).toBe(true);
    expect(getPost(post?.slug ?? "")?.title).toBe(post?.title);
  });

  it("counts tags and finds posts by tag slug", () => {
    const tags = getTags();
    expect(tags.length).toBeGreaterThan(0);
    for (const tag of tags) expect(getPostsByTag(tag.slug)).toHaveLength(tag.count);
    expect(getPostsByTag("no-such-tag")).toEqual([]);
  });

  it("finds neighbours only among self-hosted posts", () => {
    expect(getAdjacentPosts("no-such-post")).toEqual({});
    const [first] = getLocalPosts();
    expect(getAdjacentPosts(first?.slug ?? "").newer).toBeUndefined();
  });

  it("lets a post override or disable syndication", () => {
    const [post] = getLocalPosts();
    if (!post) throw new Error("expected a sample post");
    expect(getSyndicationTargets({ ...post, syndicate: undefined })).toEqual(
      siteConfig.blog.syndicationTargets,
    );
    expect(getSyndicationTargets({ ...post, syndicate: [] })).toEqual([]);
    expect(getSyndicationTargets({ ...post, syndicate: ["devto"] })).toEqual(["devto"]);
    expect(getSyndicationTargets({ ...post, syndicate: ["devto"], draft: true })).toEqual([]);
    expect(
      getSyndicationTargets({ ...post, canonicalUrl: "https://elsewhere.example/post" }),
    ).toEqual([]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, index) => index);

  it("slices 1-indexed pages", () => {
    expect(paginate(items, 1, 10)).toEqual({ items: items.slice(0, 10), page: 1, totalPages: 3 });
    expect(paginate(items, 3, 10).items).toEqual([20, 21, 22, 23, 24]);
    expect(paginate(items, 4, 10).items).toEqual([]);
  });

  it("always has at least one page", () => {
    expect(paginate([], 1, 10).totalPages).toBe(1);
  });
});

describe("pickFeatured", () => {
  it("puts featured entries first and caps the list", () => {
    const items = [
      { id: 1, featured: false },
      { id: 2, featured: true },
      { id: 3, featured: false },
      { id: 4, featured: true },
    ];
    expect(pickFeatured(items, 3).map((item) => item.id)).toEqual([2, 4, 1]);
  });
});

describe("projects", () => {
  it("has a sample in every configured category", () => {
    for (const category of siteConfig.projectCategories) {
      expect(getProjectsByCategory(category.id).length, category.id).toBeGreaterThan(0);
      expect(getCategory(category.id)?.label).toBe(category.label);
    }
    expect(getCategory("nope")).toBeUndefined();
  });

  it("only uses categories from the site config", () => {
    const ids = new Set(siteConfig.projectCategories.map((category) => category.id));
    for (const project of getProjects()) expect(ids.has(project.category)).toBe(true);
  });

  it("finds a project by slug", () => {
    const [project] = getProjects();
    expect(getProject(project?.slug ?? "")?.title).toBe(project?.title);
    expect(getProject("nope")).toBeUndefined();
  });

  it("requires alt text wherever a cover is set", () => {
    for (const project of getProjects()) {
      if (project.cover) expect(project.coverAlt, project.slug).toBeTruthy();
    }
  });
});

describe("research", () => {
  it("gives a page only to papers with a body", () => {
    for (const paper of getPapers()) {
      expect(Boolean(getPaper(paper.slug))).toBe(paper.hasPage);
    }
    expect(getPapers().some((paper) => paper.hasPage)).toBe(true);
    expect(getPapers().some((paper) => !paper.hasPage)).toBe(true);
  });

  it("groups by year, newest first", () => {
    const years = getPapersByYear().map((group) => group.year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });
});

describe("albums and pages", () => {
  it("joins each album with its photo manifest", () => {
    const [album] = getAlbums();
    expect(album?.photos.length).toBeGreaterThan(0);
    expect(album?.coverImage?.id).toBe(album?.photos[0]?.id);
    expect(getAlbum(album?.slug ?? "")?.title).toBe(album?.title);
  });

  it("serves free-form pages by slug", () => {
    expect(getPage("about")?.url).toBe("/about");
    expect(getPage("privacy")).toBeDefined();
    expect(getPage("nope")).toBeUndefined();
  });
});

describe("private content stays out of public surfaces", () => {
  it("is reachable only through getPrivatePage", () => {
    const page = getPrivatePage("sample");
    expect(page).toBeDefined();
    expect(getPage("sample-gated")).toBeUndefined();
    const documents = JSON.stringify(buildSearchDocuments());
    expect(documents).not.toContain(page?.title);
    expect(documents).not.toContain("/p/");
  });
});
