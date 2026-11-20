import type { SyndicationPost, SyndicationTarget } from "./types";

const ENDPOINT = "https://dev.to/api/articles";
const MAX_TAGS = 4;

/** DEV allows at most four tags, each alphanumeric. */
export function devtoTags(tags: string[]): string[] {
  return tags
    .map((tag) => tag.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .slice(0, MAX_TAGS);
}

function payload(post: SyndicationPost, publish: boolean) {
  return {
    article: {
      title: post.title,
      body_markdown: post.markdown,
      published: publish,
      canonical_url: post.canonicalUrl,
      description: post.description,
      tags: devtoTags(post.tags),
      ...(post.coverUrl ? { main_image: post.coverUrl } : {}),
    },
  };
}

/** DEV Community (dev.to), through its REST API. Needs `DEVTO_API_KEY`. */
export const devto: SyndicationTarget = {
  id: "devto",
  label: "DEV Community",
  requiredEnv: ["DEVTO_API_KEY"],
  buildPayload: (post, options) => payload(post, options.publish),
  async publish(post, options) {
    const response = await (options.fetch ?? fetch)(ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": process.env.DEVTO_API_KEY ?? "",
        "Content-Type": "application/json",
        Accept: "application/vnd.forem.api-v1+json",
      },
      body: JSON.stringify(payload(post, options.publish)),
    });
    if (!response.ok) throw new Error(`DEV returned ${response.status}: ${await response.text()}`);
    const data = (await response.json()) as { id: number; url: string };
    return { id: String(data.id), url: data.url };
  },
};
