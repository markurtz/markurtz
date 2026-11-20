import { slugify } from "../../../src/lib/utils";

import type { SyndicationPost, SyndicationTarget } from "./types";

const ENDPOINT = "https://gql.hashnode.com";
const MAX_TAGS = 5;

const CREATE_DRAFT = `mutation CreateDraft($input: CreateDraftInput!) {
  createDraft(input: $input) { draft { id slug } }
}`;

const PUBLISH_POST = `mutation PublishPost($input: PublishPostInput!) {
  publishPost(input: $input) { post { id url } }
}`;

function payload(post: SyndicationPost, publish: boolean) {
  return {
    query: publish ? PUBLISH_POST : CREATE_DRAFT,
    variables: {
      input: {
        title: post.title,
        subtitle: post.description,
        publicationId: process.env.HASHNODE_PUBLICATION_ID ?? "<HASHNODE_PUBLICATION_ID>",
        contentMarkdown: post.markdown,
        originalArticleURL: post.canonicalUrl,
        tags: post.tags.slice(0, MAX_TAGS).map((tag) => ({ name: tag, slug: slugify(tag) })),
        ...(post.coverUrl ? { coverImageOptions: { coverImageURL: post.coverUrl } } : {}),
      },
    },
  };
}

/**
 * Hashnode, through its GraphQL API. Needs `HASHNODE_TOKEN` and
 * `HASHNODE_PUBLICATION_ID`. A draft has no public URL, so the dashboard link
 * to the draft is recorded until it is published there.
 */
export const hashnode: SyndicationTarget = {
  id: "hashnode",
  label: "Hashnode",
  requiredEnv: ["HASHNODE_TOKEN", "HASHNODE_PUBLICATION_ID"],
  buildPayload: (post, options) => payload(post, options.publish),
  async publish(post, options) {
    const response = await (options.fetch ?? fetch)(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: process.env.HASHNODE_TOKEN ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload(post, options.publish)),
    });
    const data = (await response.json()) as {
      errors?: { message: string }[];
      data?: {
        createDraft?: { draft: { id: string; slug: string } };
        publishPost?: { post: { id: string; url: string } };
      };
    };
    if (!response.ok || data.errors?.length) {
      throw new Error(
        `Hashnode returned ${response.status}: ${data.errors?.map((error) => error.message).join("; ")}`,
      );
    }
    const published = data.data?.publishPost?.post;
    if (published) return { id: published.id, url: published.url };
    const draft = data.data?.createDraft?.draft;
    if (!draft) throw new Error("Hashnode returned no draft");
    return { id: draft.id, url: `https://hashnode.com/draft/${draft.id}` };
  },
};
