# Writing: posts, papers and projects

Content is Markdown (MDX) in [`content/`](../../content). Every file starts with front matter, which is validated when the site builds: a missing or misspelled field fails the build and names the file and field.

## Scaffolding

```bash
pnpm new post "My title"
pnpm new project "Walnut desk" --category woodworking
pnpm new paper "Paper title"
pnpm new album "Iceland 2026"
```

Each command creates a draft with every available field. Drafts (`draft: true`) and posts dated in the future are visible in `pnpm dev` and hidden from the production site.

## Blog posts

A post is `content/blog/<slug>.mdx`, or `content/blog/<slug>/index.mdx` when it has images next to it. Reference images relatively (`![Alt text](./photo.jpg)`); they are optimized and fingerprinted at build time.

To list a post that lives on another site, set `externalUrl` (and optionally `externalSource`). The card links out and no page is built here.

Components available in posts: `Callout`, `Figure`, `Gallery`, `BeforeAfter`, `Steps`/`Step`, `BillOfMaterials`, `GitHubRepo`, `YouTube`, `Video` and `ModelViewer`. Code blocks support titles, line highlights and diffs, and math works with `$...$`. The sample post `content/blog/welcome/index.mdx` shows each of them.

## Papers

A paper is `content/papers/<slug>.mdx` with authors, venue, year and links (PDF, arXiv, DOI, code). The author matching `author.name` in `site.config.ts` is highlighted automatically. A paper with body text gets its own page with a BibTeX block; one without is listed with its links only.

## Projects

A project is `content/projects/<slug>/index.mdx` with a `category` from `site.config.ts`. Optional fields add a bill of materials, a tools list, repository and demo links, and 3D models (`.glb` files in `public/models/`).

## Syndicating posts to other services

The site is always the original. Copies elsewhere carry a canonical link back, which is what tells search engines which one is the source.

### Automatic: Dev.to and Hashnode

`.github/workflows/syndicate.yml` cross-posts new posts after they are live. It is off until you:

1. Add the repository secrets `DEVTO_API_KEY`, `HASHNODE_TOKEN` and `HASHNODE_PUBLICATION_ID` (a service without its secrets is skipped).
2. Set the repository variable `SYNDICATION_ENABLED` to `true`.
3. Set `productionUrl` in `site.config.ts` to the live domain.
4. In the repository settings under Actions, General, turn on "Allow GitHub Actions to create and approve pull requests". The workflow needs it to open the pull request that records the copies.

Copies are created as drafts unless `syndication.autoPublish` is `true`. The run opens a pull request that records each copy in `content/.syndication.json`; merging it adds the "Also published on" links, and guarantees a post is never sent twice. Merge it promptly: the workflow will not run again while one of these pull requests is open, because until it merges the repository does not know which copies exist. To preview what would be sent, run `pnpm syndicate --dry-run` or start the workflow manually (dry run is its default).

Per post, `syndicate: [devto]` in the front matter overrides the default targets and `syndicate: []` keeps a post on the site only.

> [!NOTE]
> The Hashnode request was written against its public GraphQL API documentation and has not been exercised with a real account. Check the first run's draft before turning on `autoPublish`.

### Manual: Medium, LinkedIn and Substack

None of these has a publishing API that is open to new integrations, so they take two minutes by hand:

- **Medium:** Use "Import a story" with the post's URL. Medium sets the canonical link for you.
- **LinkedIn:** Share the post's link, or paste the text into an article and link to the original in the first line.
- **Substack:** Paste the text, then set the canonical URL in the post's settings (under SEO options).

To show a manual copy under "Also published on", add it to `content/.syndication.json`:

```json
{ "my-post": { "medium": { "id": "manual", "url": "https://medium.com/@you/my-post" } } }
```

RSS, Atom and JSON feeds are at `/feed.xml`, `/atom.xml` and `/feed.json`. Services that import from RSS can use those.
