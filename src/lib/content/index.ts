/**
 * The content access layer. This folder is the ONLY place that imports the
 * Velite output (`#velite`), so swapping the content engine touches one folder.
 * Pages call these functions and never read the raw output.
 */
import {
  albumManifests,
  albums,
  education,
  experience,
  pages,
  papers,
  posts,
  privatePages,
  projects,
  talks,
} from "#velite";

import { showUnpublished } from "@/lib/features";
import { siteConfig, type ProjectCategory } from "@/lib/site";
import { slugify } from "@/lib/utils";

import syndicationState from "../../../content/.syndication.json";

export type {
  Album,
  Education,
  Experience,
  Page,
  Paper,
  Post,
  PrivatePage,
  Project,
  Talk,
} from "#velite";
import type { Album, AlbumManifest, Page, Paper, Post, PrivatePage, Project } from "#velite";

export type AlbumPhoto = AlbumManifest["photos"][number];
export type AlbumWithPhotos = Album & { photos: AlbumPhoto[]; coverImage?: AlbumPhoto };

/** Options shared by list accessors. Tests pass these instead of relying on the environment. */
export interface ListOptions {
  /** Include drafts and entries dated in the future. Defaults to on outside production. */
  includeUnpublished?: boolean;
  /** Reference time for "dated in the future". */
  now?: Date;
}

/** True when an entry should be visible: not a draft and not scheduled for later. */
export function isPublished(
  entry: { draft?: boolean; date?: string },
  { includeUnpublished = showUnpublished(), now = new Date() }: ListOptions = {},
): boolean {
  if (includeUnpublished) return true;
  if (entry.draft) return false;
  return !entry.date || new Date(entry.date).getTime() <= now.getTime();
}

const byDateDesc = <T extends { date: string; title: string }>(a: T, b: T) =>
  b.date.localeCompare(a.date) || a.title.localeCompare(b.title);

function visible<T extends { draft?: boolean; date: string; title: string }>(
  items: T[],
  options?: ListOptions,
): T[] {
  return items.filter((item) => isPublished(item, options)).sort(byDateDesc);
}

// ── Pages ───────────────────────────────────────────────────────────────────

/** Free-form pages such as About and Hobbies. */
export function getPages(options?: ListOptions): Page[] {
  return pages.filter((page) => isPublished(page, options));
}

/** One free-form page by slug. */
export function getPage(slug: string, options?: ListOptions): Page | undefined {
  return getPages(options).find((page) => page.slug === slug);
}

// ── Blog ────────────────────────────────────────────────────────────────────

/** All posts, newest first, including ones hosted elsewhere. */
export function getPosts(options?: ListOptions): Post[] {
  return visible(posts, options);
}

/** Posts that have a page on this site. */
export function getLocalPosts(options?: ListOptions): Post[] {
  return getPosts(options).filter((post) => !post.isExternal);
}

/** One self-hosted post by slug. */
export function getPost(slug: string, options?: ListOptions): Post | undefined {
  return getLocalPosts(options).find((post) => post.slug === slug);
}

/** The posts before and after a self-hosted post, in date order. */
export function getAdjacentPosts(
  slug: string,
  options?: ListOptions,
): { newer?: Post; older?: Post } {
  const list = getLocalPosts(options);
  const index = list.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return { newer: list[index - 1], older: list[index + 1] };
}

/** A tag with its URL-safe slug and number of posts. */
export interface TagCount {
  tag: string;
  slug: string;
  count: number;
}

/** Tags across all posts, most used first. */
export function getTags(options?: ListOptions): TagCount[] {
  const counts = new Map<string, TagCount>();
  for (const post of getPosts(options)) {
    for (const tag of post.tags) {
      const slug = slugify(tag);
      const entry = counts.get(slug) ?? { tag, slug, count: 0 };
      entry.count += 1;
      counts.set(slug, entry);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

/** Posts carrying a tag, matched by its slug. */
export function getPostsByTag(tagSlug: string, options?: ListOptions): Post[] {
  return getPosts(options).filter((post) => post.tags.some((tag) => slugify(tag) === tagSlug));
}

/** One page of a list plus the paging facts a template needs. */
export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
}

/** Slices a list into 1-indexed pages. */
export function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), page, totalPages };
}

/** Which services a post should be cross-posted to. */
export function getSyndicationTargets(post: Post): readonly string[] {
  if (post.isExternal || post.draft || post.canonicalUrl) return [];
  return post.syndicate ?? siteConfig.blog.syndicationTargets;
}

/** A copy of a post on another service, recorded by the syndication job. */
export interface SyndicatedCopy {
  target: string;
  id: string;
  url: string;
}

/** Where a post has already been cross-posted ("Also published on"). */
export function getSyndicatedCopies(slug: string): SyndicatedCopy[] {
  const state = syndicationState as Record<string, Record<string, { id: string; url: string }>>;
  return Object.entries(state[slug] ?? {}).map(([target, copy]) => ({ target, ...copy }));
}

// ── Research ────────────────────────────────────────────────────────────────

/** All papers, newest first. */
export function getPapers(options?: ListOptions): Paper[] {
  return visible(papers, options);
}

/** One paper that has its own page. */
export function getPaper(slug: string, options?: ListOptions): Paper | undefined {
  return getPapers(options).find((paper) => paper.slug === slug && paper.hasPage);
}

/** Papers grouped by year, newest year first. */
export function getPapersByYear(options?: ListOptions): { year: number; papers: Paper[] }[] {
  const groups = new Map<number, Paper[]>();
  for (const paper of getPapers(options)) {
    groups.set(paper.year, [...(groups.get(paper.year) ?? []), paper]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, list]) => ({ year, papers: list }));
}

// ── Projects ────────────────────────────────────────────────────────────────

/** All projects across categories, newest first. */
export function getProjects(options?: ListOptions): Project[] {
  return visible(projects, options);
}

/** One project by slug. */
export function getProject(slug: string, options?: ListOptions): Project | undefined {
  return getProjects(options).find((project) => project.slug === slug);
}

/** Projects in one configured category. */
export function getProjectsByCategory(categoryId: string, options?: ListOptions): Project[] {
  return getProjects(options).filter((project) => project.category === categoryId);
}

/** The configured category for an id. */
export function getCategory(categoryId: string): ProjectCategory | undefined {
  return siteConfig.projectCategories.find((category) => category.id === categoryId);
}

/** Featured entries first, topped up with the newest, capped at `count`. */
export function pickFeatured<T extends { featured: boolean }>(items: T[], count: number): T[] {
  const featured = items.filter((item) => item.featured);
  const rest = items.filter((item) => !item.featured);
  return [...featured, ...rest].slice(0, count);
}

// ── Photos ──────────────────────────────────────────────────────────────────

/** Public albums with their photo manifests, newest first. */
export function getAlbums(options?: ListOptions): AlbumWithPhotos[] {
  return visible(albums, options).map((album) => {
    const photos = albumManifests.find((manifest) => manifest.album === album.slug)?.photos ?? [];
    const coverImage = photos.find((photo) => photo.id === album.coverPhoto) ?? photos[0];
    return { ...album, photos, coverImage };
  });
}

/** One public album by slug. */
export function getAlbum(slug: string, options?: ListOptions): AlbumWithPhotos | undefined {
  return getAlbums(options).find((album) => album.slug === slug);
}

// ── Data ────────────────────────────────────────────────────────────────────

/** Work history, newest first. */
export function getExperience() {
  return [...experience].sort((a, b) => b.start.localeCompare(a.start));
}

/** Education, newest first. */
export function getEducation() {
  return [...education].sort((a, b) => b.start.localeCompare(a.start));
}

/** Talks, newest first. */
export function getTalks() {
  return [...talks].sort((a, b) => b.date.localeCompare(a.date));
}

// ── Gated pages ─────────────────────────────────────────────────────────────

/**
 * The unlisted page for a gate. Call only after `requireGate()` has passed.
 * These are deliberately absent from every list accessor above.
 */
export function getPrivatePage(gate: string): PrivatePage | undefined {
  return privatePages.find((page) => page.gate === gate);
}
