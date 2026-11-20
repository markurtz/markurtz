import { createHash } from "node:crypto";

/**
 * Pure planning for the syndication job: which posts go to which targets, and
 * which existing copies are stale. Kept free of I/O so it is easy to test.
 */

/** What `content/.syndication.json` holds: per post, per target, the copy that exists. */
export type SyndicationState = Record<
  string,
  Record<string, { id: string; url: string; hash: string }>
>;

export interface PlannablePost {
  slug: string;
  raw: string;
  targets: readonly string[];
}

/** Fingerprint of a post's source, recorded so later edits can be detected. */
export function contentHash(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

/** Posts paired with the targets that have no copy yet. This is what makes the job idempotent. */
export function planSyndication(
  posts: PlannablePost[],
  state: SyndicationState,
  available: readonly string[],
  onlySlug?: string,
): { slug: string; targets: string[] }[] {
  return posts
    .filter((post) => !onlySlug || post.slug === onlySlug)
    .map((post) => ({
      slug: post.slug,
      targets: post.targets.filter(
        (target) => available.includes(target) && !state[post.slug]?.[target],
      ),
    }))
    .filter((entry) => entry.targets.length > 0);
}

/** Copies whose post has changed since it was cross-posted. They are reported, never updated. */
export function findStale(
  posts: PlannablePost[],
  state: SyndicationState,
): { slug: string; target: string; url: string }[] {
  const stale: { slug: string; target: string; url: string }[] = [];
  for (const post of posts) {
    for (const [target, copy] of Object.entries(state[post.slug] ?? {})) {
      if (copy.hash !== contentHash(post.raw))
        stale.push({ slug: post.slug, target, url: copy.url });
    }
  }
  return stale;
}
