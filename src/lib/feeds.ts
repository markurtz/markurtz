import { Feed } from "feed";

import { getPosts, type Post } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

/** MDX component tags that survive Markdown rendering as unknown lowercase elements. */
const COMPONENT_TAGS =
  "callout|figure|gallery|beforeafter|modelviewer|billofmaterials|steps|step|githubrepo|youtube|video|categorygrid";

/**
 * Makes rendered post HTML portable for feed readers: unknown component tags
 * become plain blocks and site-relative URLs become absolute.
 */
export function toFeedHtml(html: string, origin: string = siteConfig.url): string {
  return html
    .replace(new RegExp(`<(${COMPONENT_TAGS})\\b[^>]*/>`, "gi"), "")
    .replace(new RegExp(`<(${COMPONENT_TAGS})\\b[^>]*>`, "gi"), "<div>")
    .replace(new RegExp(`</(${COMPONENT_TAGS})>`, "gi"), "</div>")
    .replace(/\b(src|href)="\/(?!\/)/g, `$1="${origin}/`);
}

function toItem(post: Post) {
  const link = absoluteUrl(post.url);
  return {
    id: link,
    link,
    title: post.title,
    description: post.description,
    // Self-hosted posts carry their full content. External ones are link-only.
    content: post.isExternal ? undefined : toFeedHtml(post.html),
    date: new Date(post.updated ?? post.date),
    published: new Date(post.date),
    category: post.tags.map((tag) => ({ name: tag })),
    author: [{ name: siteConfig.author.name, link: siteConfig.url }],
    image: post.cover ? absoluteUrl(post.cover.src) : undefined,
  };
}

/** Builds the blog feed, which can be rendered as RSS, Atom or JSON Feed. */
export function buildFeed(posts: Post[] = getPosts()): Feed {
  const newest = posts[0];
  const feed = new Feed({
    id: `${siteConfig.url}/`,
    link: `${siteConfig.url}/`,
    title: siteConfig.title,
    description: siteConfig.description,
    language: siteConfig.locale,
    copyright: `© ${siteConfig.author.name}`,
    // Derived from content so the output is deterministic between builds.
    updated: newest ? new Date(newest.updated ?? newest.date) : new Date(0),
    feedLinks: {
      rss: absoluteUrl("/feed.xml"),
      atom: absoluteUrl("/atom.xml"),
      json: absoluteUrl("/feed.json"),
    },
    author: { name: siteConfig.author.name, link: siteConfig.url },
  });
  for (const post of posts) feed.addItem(toItem(post));
  return feed;
}
