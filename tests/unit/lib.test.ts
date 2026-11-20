// ## WRITTEN BY AI ##
import { describe, expect, it } from "vitest";

import { citationKey, toBibtex } from "@/lib/bibtex";
import { getPapers, getPosts } from "@/lib/content";
import { adminEmails, parseEnv } from "@/lib/env";
import { missingBackendEnv } from "@/lib/features";
import { buildFeed, toFeedHtml } from "@/lib/feeds";
import { repoFromUrl } from "@/lib/github";
import {
  albumPhotoKey,
  albumPhotoToImage,
  exifCaption,
  thumbhashToColor,
  thumbhashToPlaceholder,
} from "@/lib/media";
import { breadcrumbJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo";
import { getSocialLinks } from "@/lib/social";
import { absoluteUrl, formatDate, isExternal, slugify } from "@/lib/utils";
import { formatPeriod } from "@/components/content/timeline";
import { totalCost } from "@/components/mdx/bill-of-materials";

describe("utils", () => {
  it("slugifies text", () => {
    expect(slugify("  Héllo, Wörld! 3D-Printing ")).toBe("hello-world-3d-printing");
    expect(slugify("!!!")).toBe("");
  });

  it("builds absolute URLs and leaves absolute ones alone", () => {
    expect(absoluteUrl("/blog")).toMatch(/^https?:\/\/[^/]+\/blog$/);
    expect(absoluteUrl("https://example.com/x")).toBe("https://example.com/x");
  });

  it("formats dates in UTC so builds are deterministic", () => {
    expect(formatDate("2026-01-01T00:00:00.000Z")).toBe("January 1, 2026");
  });

  it("detects external links", () => {
    expect(isExternal("https://example.com")).toBe(true);
    expect(isExternal("mailto:a@example.com")).toBe(true);
    expect(isExternal("/about")).toBe(false);
  });

  it("formats work periods", () => {
    expect(formatPeriod("2020-06", "2023-12")).toBe("Jun 2020 to Dec 2023");
    expect(formatPeriod("2024")).toBe("2024 to Present");
  });

  it("totals material costs, ignoring missing ones", () => {
    expect(
      totalCost([
        { item: "a", quantity: 1, cost: 3 },
        { item: "b", quantity: 2 },
        { item: "c", quantity: 1, cost: 1.5 },
      ]),
    ).toBe(4.5);
  });
});

describe("env", () => {
  it("treats empty strings as unset and applies defaults", () => {
    const env = parseEnv({ DATABASE_URL: "  " });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.AUTH_DRIVER).toBe("supabase");
    expect(env.STORAGE_DRIVER).toBe("r2");
  });

  it("rejects a short session secret", () => {
    expect(() => parseEnv({ GALLERY_SESSION_SECRET: "short" })).toThrow(/at least 32/);
  });

  it("refuses development-only drivers on Vercel", () => {
    expect(() => parseEnv({ VERCEL: "1", AUTH_DRIVER: "dev" })).toThrow(/never be used on Vercel/);
    expect(() => parseEnv({ VERCEL: "1", STORAGE_DRIVER: "local" })).toThrow(
      /cannot be used on Vercel/,
    );
    expect(() => parseEnv({ AUTH_DRIVER: "dev", STORAGE_DRIVER: "local" })).not.toThrow();
  });

  it("parses the admin allowlist case-insensitively", () => {
    expect(adminEmails(parseEnv({ ADMIN_EMAILS: " A@Example.com, b@example.com ,," }))).toEqual([
      "a@example.com",
      "b@example.com",
    ]);
    expect(adminEmails(parseEnv({}))).toEqual([]);
  });

  it("lists what the private area is missing for each driver", () => {
    expect(missingBackendEnv(parseEnv({}))).toEqual(
      expect.arrayContaining([
        "DATABASE_URL",
        "GALLERY_SESSION_SECRET",
        "SUPABASE_SECRET_KEY",
        "R2_PRIVATE_BUCKET",
      ]),
    );
    const local = parseEnv({
      DATABASE_URL: "pglite://memory",
      GALLERY_SESSION_SECRET: "x".repeat(32),
      IP_HASH_SALT: "salt",
      ADMIN_EMAILS: "a@example.com",
      AUTH_DRIVER: "dev",
      STORAGE_DRIVER: "local",
    });
    expect(missingBackendEnv(local)).toEqual([]);
  });
});

describe("seo", () => {
  it("escapes < in JSON-LD so content cannot close the script tag", () => {
    const html = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("</script>");
    expect(JSON.parse(html).name).toContain("</script>");
  });

  it("sets a canonical URL and social cards", () => {
    const metadata = buildMetadata({ title: "Hello", path: "/blog/hello", type: "article" });
    expect(metadata.alternates?.canonical).toMatch(/\/blog\/hello$/);
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(
      buildMetadata({ title: "x", path: "/x", canonical: "https://other.example/x" }).alternates
        ?.canonical,
    ).toBe("https://other.example/x");
    expect(buildMetadata({ title: "x", path: "/x", noindex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("numbers breadcrumbs from one", () => {
    const data = breadcrumbJsonLd([
      { name: "Blog", path: "/blog" },
      { name: "Post", path: "/blog/post" },
    ]) as { itemListElement: { position: number }[] };
    expect(data.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });
});

describe("bibtex", () => {
  it("generates an entry from paper fields", () => {
    const paper = getPapers().find((candidate) => candidate.type === "conference");
    if (!paper) throw new Error("expected a sample conference paper");
    const bibtex = toBibtex(paper);
    expect(bibtex).toMatch(/^@inproceedings\{kurtz2026sample,/);
    expect(bibtex).toContain("booktitle = {Sample Conference}");
    expect(bibtex).toContain("author = {Mark Kurtz and Sample Coauthor}");
  });

  it("prefers a hand-written entry", () => {
    const [paper] = getPapers();
    if (!paper) throw new Error("expected a sample paper");
    expect(toBibtex({ ...paper, bibtex: " @misc{custom} " })).toBe("@misc{custom}");
  });

  it("builds a stable citation key", () => {
    expect(
      citationKey({ authors: ["Ada Lovelace"], year: 1843, title: "On the Analytical Engine" }),
    ).toBe("lovelace1843analytical");
  });
});

describe("feeds", () => {
  it("makes rendered HTML portable", () => {
    const html = toFeedHtml(
      '<callout type="note"><p>Hi <a href="/about">me</a></p></callout><img src="/static/a.jpg"><modelviewer src="/m.glb" />',
      "https://example.com",
    );
    expect(html).toBe(
      '<div><p>Hi <a href="https://example.com/about">me</a></p></div><img src="https://example.com/static/a.jpg">',
    );
  });

  it("includes every post, with full content only for self-hosted ones", () => {
    const posts = getPosts();
    const feed = JSON.parse(buildFeed(posts).json1()) as {
      items: { url: string; content_html?: string }[];
    };
    expect(feed.items).toHaveLength(posts.length);
    for (const post of posts) {
      const item = feed.items.find((candidate) =>
        candidate.url.endsWith(post.isExternal ? post.url : `/blog/${post.slug}`),
      );
      // The feed library falls back to the description when an item has no content.
      expect(item?.content_html !== post.description, post.slug).toBe(!post.isExternal);
    }
  });

  it("is deterministic", () => {
    expect(buildFeed().rss2()).toBe(buildFeed().rss2());
    expect(buildFeed().atom1()).toContain("<feed");
  });
});

describe("media helpers", () => {
  const photo = {
    id: "abc",
    width: 3000,
    height: 2000,
    alt: "A photo",
    caption: "Caption",
    thumbhash: "1QcSHQRnh493V4dIh4eXh1h4kJUI",
    widths: [1280, 640, 2560],
    exif: { camera: "Camera X", aperture: "f/2.8", iso: "100" },
  };

  it("builds keys, srcset and captions for public album photos", () => {
    expect(albumPhotoKey("trip", "abc", 640)).toBe("albums/trip/abc/640.webp");
    const image = albumPhotoToImage("trip", photo);
    expect(image.src).toMatch(/albums\/trip\/abc\/640\.webp$/);
    expect(image.fullSrc).toMatch(/2560\.webp$/);
    expect(image.srcSet?.split(", ")).toHaveLength(3);
    expect(image.caption).toBe("Caption — Camera X · f/2.8 · ISO 100");
    expect(image.placeholder).toContain("data:image/png");
  });

  it("decodes thumbhashes and tolerates bad input", () => {
    expect(thumbhashToColor(photo.thumbhash)).toMatch(/^rgb\(\d+ \d+ \d+\)$/);
    expect(thumbhashToPlaceholder("")).toBeUndefined();
    expect(exifCaption({})).toBe("");
  });
});

describe("social and github helpers", () => {
  it("builds profile URLs and skips empty handles", () => {
    const links = getSocialLinks({
      github: "octocat",
      linkedin: "",
      mastodon: "@me@example.social",
      email: "me@example.com",
    });
    expect(links.map((link) => link.url)).toEqual([
      "https://github.com/octocat",
      "https://example.social/@me",
      "mailto:me@example.com",
    ]);
  });

  it("extracts owner/name from GitHub URLs only", () => {
    expect(repoFromUrl("https://github.com/markurtz/markurtz")).toBe("markurtz/markurtz");
    expect(repoFromUrl("https://github.com/markurtz/markurtz.git")).toBe("markurtz/markurtz");
    expect(repoFromUrl("https://gitlab.com/a/b")).toBeUndefined();
    expect(repoFromUrl(undefined)).toBeUndefined();
  });
});
