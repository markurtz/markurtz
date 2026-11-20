/**
 * Cross-posts blog posts to other services with the site as the canonical
 * source (POSSE). Run by `.github/workflows/syndicate.yml`.
 *
 *   pnpm syndicate --dry-run            print the exact payloads, send nothing
 *   pnpm syndicate --slug my-post       only this post
 *
 * The job is idempotent: `content/.syndication.json` records every copy that
 * exists, and a post is never sent twice to the same service. Copies are
 * created as drafts unless `syndication.autoPublish` is on in site.config.ts.
 */
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";

import { getLocalPosts, getSyndicationTargets } from "@/lib/content";
import { siteConfig } from "@/lib/site";

import { contentHash, findStale, planSyndication, type SyndicationState } from "./plan";
import { devto } from "./targets/devto";
import { hashnode } from "./targets/hashnode";
import type { SyndicationPost, SyndicationTarget } from "./targets/types";
import { findPublishedAsset, toPortableMarkdown } from "./transform";

const STATE_PATH = "content/.syndication.json";
const TARGETS: Record<string, SyndicationTarget> = { devto, hashnode };
const LIVE_ATTEMPTS = 20;
const LIVE_INTERVAL_MS = 30_000;

/** Waits until the post is live, so the canonical link is valid before any copy exists. */
async function waitUntilLive(url: string): Promise<void> {
  for (let attempt = 1; attempt <= LIVE_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (response.ok) return;
    } catch {
      // Not reachable yet.
    }
    console.log(`  waiting for ${url} (${attempt}/${LIVE_ATTEMPTS})`);
    await new Promise((resolve) => setTimeout(resolve, LIVE_INTERVAL_MS));
  }
  throw new Error(`${url} did not return 200. Is the deployment finished?`);
}

async function main() {
  const { values } = parseArgs({
    options: { "dry-run": { type: "boolean", default: false }, slug: { type: "string" } },
  });
  const dryRun = values["dry-run"];
  const publish = siteConfig.syndication.autoPublish;
  const siteUrl = siteConfig.productionUrl;

  const state = JSON.parse(await readFile(STATE_PATH, "utf8")) as SyndicationState;
  const posts = getLocalPosts({ includeUnpublished: false });
  const plannable = posts.map((post) => ({
    slug: post.slug,
    raw: post.raw,
    targets: getSyndicationTargets(post),
  }));

  // In a real run, a target without credentials is skipped. A dry run shows every target.
  const available = Object.values(TARGETS)
    .filter((target) => dryRun || target.requiredEnv.every((name) => process.env[name]))
    .map((target) => target.id);
  const skipped = Object.keys(TARGETS).filter((id) => !available.includes(id));
  if (skipped.length > 0)
    console.log(`Skipping targets without credentials: ${skipped.join(", ")}`);

  const plan = planSyndication(plannable, state, available, values.slug);
  if (plan.length === 0) console.log("Nothing to syndicate.");

  let changed = false;
  const failures: string[] = [];
  for (const entry of plan) {
    const post = posts.find((candidate) => candidate.slug === entry.slug);
    if (!post) continue;
    const canonicalUrl = `${siteUrl}${post.url}`;
    const payload: SyndicationPost = {
      slug: post.slug,
      title: post.title,
      description: post.description,
      tags: post.tags,
      canonicalUrl,
      coverUrl: post.cover ? `${siteUrl}${post.cover.src}` : undefined,
      markdown: toPortableMarkdown(post.raw, {
        siteUrl,
        canonicalUrl,
        resolveAsset: (relativePath) => findPublishedAsset(relativePath, post.html),
      }),
    };

    if (!dryRun) await waitUntilLive(canonicalUrl);
    for (const targetId of entry.targets) {
      const target = TARGETS[targetId];
      if (!target) continue;
      if (dryRun) {
        console.log(`\n--- ${target.label}: ${post.slug} (${publish ? "publish" : "draft"}) ---`);
        console.log(JSON.stringify(target.buildPayload(payload, { publish }), null, 2));
        continue;
      }
      try {
        const result = await target.publish(payload, { publish });
        state[post.slug] = {
          ...state[post.slug],
          [targetId]: { ...result, hash: contentHash(post.raw) },
        };
        // Recorded immediately: if a later target fails, this copy is still
        // on file and is never created a second time.
        await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
        changed = true;
        console.log(`${target.label}: ${post.slug} -> ${result.url}`);
      } catch (error) {
        failures.push(`${target.label}: ${post.slug}`);
        console.error(`${target.label}: ${post.slug} failed`, error);
      }
    }
  }

  for (const stale of findStale(plannable, state)) {
    console.log(
      `Stale copy: "${stale.slug}" changed after it was cross-posted to ${stale.target} (${stale.url}).`,
    );
  }

  if (changed) {
    console.log(`Updated ${STATE_PATH}. Commit it so the site can link to the copies.`);
  }
  if (failures.length > 0) {
    throw new Error(`Syndication failed for: ${failures.join(", ")}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
