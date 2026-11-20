// ## WRITTEN BY AI ##
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

import { scaffold } from "../../scripts/new";
import {
  formatExif,
  formatShutter,
  inspectImage,
  isSupportedImage,
  mapWithConcurrency,
  renderDerivative,
  widthsFor,
} from "../../scripts/photos/pipeline";
import { renderBlocks, replaceBlocks, type ReadmeData } from "../../scripts/readme/render";
import {
  contentHash,
  findStale,
  planSyndication,
  type SyndicationState,
} from "../../scripts/syndicate/plan";
import { devto, devtoTags } from "../../scripts/syndicate/targets/devto";
import { hashnode } from "../../scripts/syndicate/targets/hashnode";
import type { SyndicationPost } from "../../scripts/syndicate/targets/types";
import {
  absolutize,
  findPublishedAsset,
  toPortableMarkdown,
} from "../../scripts/syndicate/transform";

describe("readme generator", () => {
  const data: ReadmeData = {
    siteUrl: "https://example.com",
    links: [{ label: "Website", url: "https://example.com" }],
    projects: [
      {
        title: "Desk [v2]",
        description: "A desk.",
        url: "/projects/desk",
        category: "Woodworking",
      },
    ],
    posts: [
      { title: "Hello", url: "/blog/hello", date: "2026-01-02T00:00:00.000Z" },
      {
        title: "Elsewhere",
        url: "https://other.example/post",
        date: "2025-12-01T00:00:00.000Z",
        source: "Other",
      },
    ],
    papers: [],
  };
  const readme = [
    "# Hi",
    "hand written",
    "<!-- BEGIN:projects -->",
    "stale",
    "<!-- END:projects -->",
    "between",
    "<!-- BEGIN:posts -->",
    "<!-- END:posts -->",
    "footer",
  ].join("\n");

  it("renders absolute links and escapes brackets in titles", () => {
    const blocks = renderBlocks(data);
    expect(blocks.projects).toBe(
      "- [**Desk \\[v2\\]**](https://example.com/projects/desk) (Woodworking): A desk.",
    );
    expect(blocks.posts).toContain("- [Hello](https://example.com/blog/hello), 2026-01-02");
    expect(blocks.posts).toContain("- [Elsewhere](https://other.example/post) (Other), 2025-12-01");
    expect(blocks.papers).toBe("_Nothing here yet._");
  });

  it("replaces only the text between markers", () => {
    const output = replaceBlocks(readme, renderBlocks(data));
    expect(output).toContain("# Hi\nhand written\n<!-- BEGIN:projects -->\n\n- [**Desk");
    expect(output).not.toContain("stale");
    expect(output).toContain("\nbetween\n");
    expect(output.endsWith("footer")).toBe(true);
  });

  it("is idempotent: a second run produces no diff", () => {
    const once = replaceBlocks(readme, renderBlocks(data));
    expect(replaceBlocks(once, renderBlocks(data))).toBe(once);
  });

  it("changes the block when a featured project changes", () => {
    const before = replaceBlocks(readme, renderBlocks(data));
    const after = replaceBlocks(
      readme,
      renderBlocks({ ...data, projects: [{ ...data.projects[0]!, title: "Bench" }] }),
    );
    expect(after).not.toBe(before);
    expect(after).toContain("**Bench**");
  });

  it("skips sections whose markers were deleted", () => {
    const output = replaceBlocks("no markers here", renderBlocks(data));
    expect(output).toBe("no markers here");
  });
});

describe("syndication transform", () => {
  const options = {
    siteUrl: "https://example.com",
    canonicalUrl: "https://example.com/blog/post",
    resolveAsset: (relative: string) =>
      relative === "./cover.jpg" ? "/static/cover-0a1b2c3d.jpg" : undefined,
  };
  const source = `import Thing from "./thing";

<Callout type="warning" title="Heads up">
  Read the [about page](/about) first.
</Callout>

Intro with ![inline](./cover.jpg) and an {expression}.

<Figure src="./cover.jpg" alt="The cover" caption="A caption" />

<Steps>
  <Step title="One">Do the first thing.</Step>
  <Step title="Two">Do the second thing.</Step>
</Steps>

<BeforeAfter>
  <img src="./cover.jpg" alt="Before" />
  <img src="https://cdn.example/after.jpg" alt="After" />
</BeforeAfter>

<YouTube id="abc123" title="Demo" />

<ModelViewer src="/models/a.glb" alt="A bracket" />

\`\`\`ts
const untouched = "<Callout>";
\`\`\`
`;

  it("converts MDX to portable Markdown", () => {
    expect(toPortableMarkdown(source, options)).toMatchInlineSnapshot(`
      "> **Heads up**
      >
      > Read the [about page](https://example.com/about) first.

      Intro with ![inline](https://example.com/static/cover-0a1b2c3d.jpg) and an .

      ![The cover](https://example.com/static/cover-0a1b2c3d.jpg)

      _A caption_

      **One**

      Do the first thing.

      **Two**

      Do the second thing.

      ![Before](https://example.com/static/cover-0a1b2c3d.jpg)

      ![After](https://cdn.example/after.jpg)

      [Demo](https://www.youtube.com/watch?v=abc123)

      _Interactive 3D model (A bracket): see the original post._

      \`\`\`ts
      const untouched = "<Callout>";
      \`\`\`

      ---

      _Originally published at [example.com](https://example.com/blog/post)._
      "
    `);
  });

  it("leaves no JSX or imports behind", () => {
    const markdown = toPortableMarkdown(source, options).replace(/```[\s\S]*?```/g, "");
    expect(markdown).not.toMatch(/<[A-Z]|import /);
  });

  it("makes URLs absolute without touching external ones or anchors", () => {
    expect(absolutize("/a", options)).toBe("https://example.com/a");
    expect(absolutize("#section", options)).toBe("#section");
    expect(absolutize("mailto:a@example.com", options)).toBe("mailto:a@example.com");
    expect(absolutize("./missing.jpg", options)).toBe("./missing.jpg");
  });

  it("finds a content image's published path in rendered HTML", () => {
    const html = '<img src="/static/cover-2a6f3ef1.jpg"><img src="/static/cover.v2-11223344.png">';
    expect(findPublishedAsset("./cover.jpg", html)).toBe("/static/cover-2a6f3ef1.jpg");
    expect(findPublishedAsset("./img/cover.v2.png", html)).toBe("/static/cover.v2-11223344.png");
    expect(findPublishedAsset("./other.jpg", html)).toBeUndefined();
  });
});

describe("syndication planning", () => {
  const posts = [
    { slug: "a", raw: "one", targets: ["devto", "hashnode"] },
    { slug: "b", raw: "two", targets: ["devto"] },
    { slug: "c", raw: "three", targets: [] },
  ];

  it("plans every missing copy", () => {
    expect(planSyndication(posts, {}, ["devto", "hashnode"])).toEqual([
      { slug: "a", targets: ["devto", "hashnode"] },
      { slug: "b", targets: ["devto"] },
    ]);
  });

  it("does nothing on a second run after success", () => {
    const state: SyndicationState = {
      a: {
        devto: { id: "1", url: "u", hash: contentHash("one") },
        hashnode: { id: "2", url: "u", hash: contentHash("one") },
      },
      b: { devto: { id: "3", url: "u", hash: contentHash("two") } },
    };
    expect(planSyndication(posts, state, ["devto", "hashnode"])).toEqual([]);
  });

  it("skips targets without credentials and honours --slug", () => {
    expect(planSyndication(posts, {}, ["devto"])).toEqual([
      { slug: "a", targets: ["devto"] },
      { slug: "b", targets: ["devto"] },
    ]);
    expect(planSyndication(posts, {}, ["devto", "hashnode"], "b")).toEqual([
      { slug: "b", targets: ["devto"] },
    ]);
  });

  it("reports copies of posts edited after cross-posting", () => {
    const state: SyndicationState = {
      a: { devto: { id: "1", url: "https://dev.to/x", hash: contentHash("old") } },
    };
    expect(findStale(posts, state)).toEqual([
      { slug: "a", target: "devto", url: "https://dev.to/x" },
    ]);
  });
});

describe("syndication targets", () => {
  const post: SyndicationPost = {
    slug: "post",
    title: "A post",
    description: "About things",
    tags: ["Machine Learning", "3d-printing", "a", "b", "c", "d"],
    canonicalUrl: "https://example.com/blog/post",
    coverUrl: "https://example.com/static/cover.jpg",
    markdown: "Body",
  };
  const respond = (body: unknown, status = 200) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it("sends DEV a draft with the canonical URL and at most four clean tags", async () => {
    // Recorded shape of a successful POST /api/articles response.
    const fetchMock = respond({ id: 123456, url: "https://dev.to/mark/a-post-temp-slug-123" }, 201);
    const result = await devto.publish(post, { publish: false, fetch: fetchMock });
    expect(result).toEqual({ id: "123456", url: "https://dev.to/mark/a-post-temp-slug-123" });

    const [url, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://dev.to/api/articles");
    const body = JSON.parse(String(init.body)) as { article: Record<string, unknown> };
    expect(body.article).toMatchObject({
      published: false,
      canonical_url: post.canonicalUrl,
      tags: ["machinelearning", "3dprinting", "a", "b"],
    });
    expect(devto.buildPayload(post, { publish: true })).toMatchObject({
      article: { published: true },
    });
    expect(devtoTags(["C++", "  "])).toEqual(["c"]);
  });

  it("surfaces DEV errors", async () => {
    await expect(
      devto.publish(post, { publish: false, fetch: respond({ error: "bad" }, 422) }),
    ).rejects.toThrow(/DEV returned 422/);
  });

  it("creates a Hashnode draft with the original article URL", async () => {
    // Recorded shape of a successful createDraft response.
    const fetchMock = respond({
      data: { createDraft: { draft: { id: "draft123", slug: "a-post" } } },
    });
    const result = await hashnode.publish(post, { publish: false, fetch: fetchMock });
    expect(result).toEqual({ id: "draft123", url: "https://hashnode.com/draft/draft123" });

    const [, init] = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(String(init.body)) as {
      query: string;
      variables: { input: Record<string, unknown> };
    };
    expect(body.query).toContain("createDraft");
    expect(body.variables.input).toMatchObject({
      originalArticleURL: post.canonicalUrl,
      title: "A post",
    });
    expect((body.variables.input.tags as unknown[]).length).toBe(5);
  });

  it("publishes on Hashnode when asked and surfaces GraphQL errors", async () => {
    const published = respond({
      data: { publishPost: { post: { id: "p1", url: "https://blog.example/a-post" } } },
    });
    expect(await hashnode.publish(post, { publish: true, fetch: published })).toEqual({
      id: "p1",
      url: "https://blog.example/a-post",
    });
    await expect(
      hashnode.publish(post, {
        publish: false,
        fetch: respond({ errors: [{ message: "Unauthorized" }] }),
      }),
    ).rejects.toThrow(/Unauthorized/);
  });

  it("never puts credentials in a dry-run payload", () => {
    const text = JSON.stringify([
      devto.buildPayload(post, { publish: false }),
      hashnode.buildPayload(post, { publish: false }),
    ]);
    expect(text).not.toMatch(/api-key|Authorization/i);
  });
});

describe("photo pipeline", () => {
  const makeImage = (width: number, height: number) =>
    sharp({ create: { width, height, channels: 3, background: { r: 200, g: 80, b: 40 } } })
      .withExif({
        IFD0: { Make: "TestCam", Model: "TestCam X1" },
        IFD3: { GPSLatitudeRef: "N", GPSLatitude: "40/1 0/1 0/1" },
      })
      .jpeg()
      .toBuffer();

  it("reads dimensions, a content hash and a thumbhash", async () => {
    const source = await makeImage(1200, 800);
    const info = await inspectImage(source, "IMG_0001.JPG");
    expect(info).toMatchObject({
      width: 1200,
      height: 800,
      ext: "jpg",
      contentType: "image/jpeg",
      bytes: source.byteLength,
    });
    expect(info.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(Buffer.from(info.thumbhash, "base64").byteLength).toBeGreaterThan(4);
    expect((await inspectImage(source, "copy.jpg")).hash).toBe(info.hash);
  });

  it("renders derivatives as WebP that fit the long edge and never upscale", async () => {
    const source = await makeImage(1200, 800);
    const preview = await sharp(await renderDerivative(source, 600)).metadata();
    expect(preview).toMatchObject({ format: "webp", width: 600, height: 400 });
    const large = await sharp(await renderDerivative(source, 5000)).metadata();
    expect(large.width).toBe(1200);
    const portrait = await sharp(
      await renderDerivative(await makeImage(800, 1200), 600),
    ).metadata();
    expect(portrait).toMatchObject({ width: 400, height: 600 });
    const byWidth = await sharp(
      await renderDerivative(await makeImage(800, 1200), 400, { fit: "width" }),
    ).metadata();
    expect(byWidth).toMatchObject({ width: 400, height: 600 });
  });

  it("strips all metadata, including GPS, from derivatives", async () => {
    const source = await makeImage(600, 400);
    expect((await sharp(source).metadata()).exif).toBeDefined();
    const derivative = await sharp(await renderDerivative(source, 300)).metadata();
    expect(derivative.exif).toBeUndefined();
    expect(derivative.xmp).toBeUndefined();
  });

  it("formats EXIF for captions and never reads location", () => {
    const exif = formatExif({
      Make: "FUJIFILM",
      Model: "X-T5",
      LensModel: "XF23mmF2",
      FocalLength: 23,
      FNumber: 2.8,
      ExposureTime: 1 / 250,
      ISO: 400,
      DateTimeOriginal: new Date("2026-03-04T05:06:07Z"),
      latitude: 40.1,
      GPSLatitude: [40, 0, 0],
    });
    expect(exif).toEqual({
      camera: "FUJIFILM X-T5",
      lens: "XF23mmF2",
      focalLength: "23mm",
      aperture: "f/2.8",
      shutter: "1/250s",
      iso: "400",
      takenAt: "2026-03-04T05:06:07.000Z",
    });
    expect(formatExif({ Make: "Canon", Model: "Canon EOS R5" }).camera).toBe("Canon EOS R5");
    expect(formatExif(undefined)).toEqual({});
    expect(formatShutter(2)).toBe("2s");
  });

  it("chooses widths no wider than the original", () => {
    expect(widthsFor(3000, [2560, 640, 1280])).toEqual([640, 1280, 2560]);
    expect(widthsFor(2000, [640, 1280, 2560])).toEqual([640, 1280]);
    expect(widthsFor(500, [640, 1280])).toEqual([500]);
  });

  it("recognizes supported files and limits concurrency", async () => {
    expect(isSupportedImage("a.JPG")).toBe(true);
    expect(isSupportedImage("notes.txt")).toBe(false);
    let running = 0;
    let peak = 0;
    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
      return value * 2;
    });
    expect(results).toEqual([2, 4, 6, 8, 10]);
    expect(peak).toBe(2);
  });
});

describe("content scaffolder", () => {
  it("creates a draft post with valid front matter", () => {
    const [file] = scaffold("post", 'My "First" Post', { date: "2026-01-02" });
    expect(file?.path).toBe("content/blog/my-first-post.mdx");
    expect(file?.content).toContain('title: "My \\"First\\" Post"');
    expect(file?.content).toContain("date: 2026-01-02");
    expect(file?.content).toContain("draft: true");
  });

  it("validates the project category against the site config", () => {
    const [file] = scaffold("project", "Walnut desk", { category: "woodworking" });
    expect(file?.path).toBe("content/projects/walnut-desk/index.mdx");
    expect(file?.content).toContain("category: woodworking");
    expect(() => scaffold("project", "Thing", { category: "nope" })).toThrow(
      /--category must be one of/,
    );
  });

  it("creates an album with an empty manifest", () => {
    const files = scaffold("album", "Iceland 2026");
    expect(files.map((file) => file.path)).toEqual([
      "content/albums/iceland-2026/index.mdx",
      "content/albums/iceland-2026/photos.json",
    ]);
    expect(JSON.parse(files[1]?.content ?? "")).toEqual({ album: "iceland-2026", photos: [] });
  });

  it("refuses a title with nothing usable in it", () => {
    expect(() => scaffold("paper", "???")).toThrow();
  });
});
