# 24 · Build, test and deploy

Status: tooling and CI **Locked** by PR #2 and PR #3; the migration plan and launch checklist are
**Default**.

## 1. Commands

From PR #3 (`AGENTS.md`), unchanged:

| Command | Does |
| --- | --- |
| `pnpm dev` | Dev server (PGlite, local storage, dev sign-in) |
| `pnpm check` | Lint, format check, types, Vitest unit + integration |
| `pnpm test:e2e` | Builds, seeds PGlite, Playwright + axe on port 3100 |
| `pnpm build` | `velite build --strict`, then `next build` |
| `pnpm content` | Content only |
| `pnpm db:generate`, `pnpm db:migrate` | Drizzle migrations |
| `pnpm media …` | The media CLI ([12](../data/12-media-storage.md#4-the-media-cli)), was `pnpm photos` |
| `pnpm readme:generate` / `readme:check` | Profile README blocks |
| `pnpm new <kind> <slug>` | Scaffold a project, work or post folder |

New:

| Command | Does |
| --- | --- |
| `pnpm content:check-held` | Fails on any `⟦…⟧`, `[confirm` or `tbd` in content; run in the production build |
| `pnpm tokens` | Regenerates `tokens.css` from `design/tokens.json` |
| `pnpm art` | Regenerates page-art stills (heroes, covers, edge, banners and banner PNGs) and the per-page subject files from the Build Six sources |
| `pnpm test:visual` | Screenshot diff against the approved mock at four widths, two themes |
| `pnpm lhci` | Lighthouse CI against budgets |

## 2. Tests

| Layer | Tool | Covers |
| --- | --- | --- |
| Unit | Vitest | Access rules (`evaluateLinkAccess` per permission row), token parse/verify, filter logic, facet AND/OR, justified-row layout, timeline units, placeholder stripping, citation formatting |
| Integration | Vitest + PGlite | `resolveLink` chains, triggers (no escalation, same collection), cascade turn-off, atomic rate limit under 50 parallel calls, retention jobs, contact flow |
| Boundaries | Vitest | Server-only imports; no `#velite` outside `src/lib/content/`; no client component imports `src/server/` except actions; every admin action starts with `requireAdmin()` |
| End to end | Playwright | Every route at 320 and 1280 px; filters and search; viewer keyboard; item actions; contact form; client flow: open link → gallery → filter → make link → open share in a fresh context → turn off → `/link-expired/`; preview-bot fetch of `/s/<id>/` without a token sees only og tags |
| Accessibility | axe in Playwright | Zero violations on every route, light and dark |
| Visual | Playwright screenshots | Against the mock at 390, 768, 1280, 1920 |
| Performance | Lighthouse CI | Budgets below |
| Links | lychee (weekly) | External links in content |
| Security | CodeQL, dependency review, secret scanning, `pnpm audit` | |

Tests written by an AI are marked as such (PR #2 convention).

## 3. Budgets (CI fails above)

| Page | Total transfer | JS | LCP (lab, mobile) | CLS |
| --- | --- | --- | --- | --- |
| Home | 500 KB | 150 KB | 2.0 s | 0.05 |
| List page | 450 KB | 150 KB | 2.0 s | 0.05 |
| Studio work | 900 KB (photos lazy) | 150 KB | 2.5 s | 0.05 |
| Fonts | 150 KB total, three families, WOFF2 subset | | | |

## 4. CI workflows

Kept from PR #3: `development.yml` (PRs), `main.yml`, `weekly.yml`, reusable `_quality`, `_tests`,
`_build`, `_security`, `_link-check`, `syndicate.yml` (later), `keepalive.yml` (Supabase free tier).

Changed:

- `db-backup.yml`: **remove the artifact upload** (High finding). Replace with an encrypted dump to
  the private bucket or delete ([11 § 7](../data/11-database-schema.md#7-backups)).
- `db-migrate.yml`: runs on `main` after review, against production, with a manual approval
  environment.
- Add `lhci` and `test:visual` to `_tests`.

## 5. Deploy

| Step | Where |
| --- | --- |
| Preview per PR | Vercel Git integration; preview uses staging DB and buckets; `FEATURE_CLIENTS=on` |
| Production | Merge to `main`; Vercel builds; `FEATURE_CLIENTS=off` until launch criterion 4 |
| Domain | Registrar unchanged; nameservers to Cloudflare; apex and `www` to Vercel; `media.` to R2 public bucket (plan §13) |
| Secrets | Vercel env: `DATABASE_URL`, `SUPABASE_*`, `R2_*`, `LINK_SIGNING_KEYS`, `IP_HASH_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET`, `GITHUB_TOKEN` (read-only, for stars) |
| Scheduled rebuild | Daily deploy hook (refreshes GitHub stars, publishes future-dated posts) |
| CSP | Report-only one week, then enforce |

Mark's steps (only he can do them): choose the domain; create Vercel, Supabase, Cloudflare and
Resend accounts; add secrets; decide Hobby or Pro (D14). Never done on his behalf.

## Gap against PR #3

PR #3 (branch `claude/project-thread-hcxhrm`, stacked on PR #2) implements the November 20 plan.
These changes bring it to this documentation set. Order matters: the access model first, because
the three High findings live there.

| # | Area | PR #3 today | Target | Doc |
| --- | --- | --- | --- | --- |
| 1 | Client access | Passcodes per gallery, `/unlock`, invited clients with email sign-in, grant cookie | Link tokens (JWT after `#`), bearer header, no sign-in | [21](21-access-security.md) |
| 2 | Schema | `galleries`, `photos`, `gallery_members`, `collections`, `collection_photos`, `gates` | `collections`, `deliveries`, `items`, `item_facets`, `links`, `link_items` | [11](../data/11-database-schema.md) |
| 3 | Rate limit | Check then increment | Atomic upsert | [21 § 5](21-access-security.md#5-rate-limits) |
| 4 | Backup | Dump as Actions artifact | Encrypted to private bucket, or Supabase only | [11 § 7](../data/11-database-schema.md#7-backups) |
| 5 | Routes | `/work`, `/research`, `/projects`, `/photos`, `/contact`, `/blog/tags/*`, `/blog/page/*`, `/p/[key]`, `/clients/c/[token]` | Routes in [02](../product/02-information-architecture.md); no tag or paged lists | [22](22-routes-api.md) |
| 6 | Content folders | `content/data`, `papers`, `projects`, `albums` | Mirror the site ([10](../data/10-content-model.md)) with `labels.yaml` | [10](../data/10-content-model.md) |
| 7 | List template | Separate list pages | One `<ListPage>` with pinned band, segmented filters, year rail, jump bar | [23](23-frontend.md) |
| 8 | Styling | Tailwind + shadcn | Port the mock's CSS and tokens | [20 § 3](20-system-architecture.md#3-stack), [30](../design/30-design-system.md) |
| 9 | Icons and art | Lucide placeholders | J1 icons, T4 monogram, Build Six marker-drawn page art | [32](../design/32-mark-icons.md), [33](../design/33-page-art-motion.md) |
| 10 | Video | None | Films: MP4, poster, preview, cinema band, viewer | [34](../design/34-photo-video.md) |
| 11 | Studio items | None | Per-photo pages, og crops, embeds, oEmbed, item actions | [04](../product/04-clients-sharing-embeds.md) |
| 12 | Feature flags | `FEATURE_CLIENT_GALLERIES`, `FEATURE_GATED_PAGES` | `FEATURE_CLIENTS` only | [20 § 7](20-system-architecture.md#7-environments) |
| 13 | Photos CLI | `pnpm photos` for albums and galleries | `pnpm media` for Studio, Workshop, collections and films | [12](../data/12-media-storage.md) |
| 14 | Sample content | `sample-*` and `TODO` | Real facts from the mock's content with held markers | [05](../product/05-voice-copy-placeholders.md) |

Suggested sequence: (1) merge PR #2; (2) on PR #3, replace the access model, schema and rate
limit (items 1 to 4) with tests; (3) content folders and list template (6, 7); (4) port pages and
CSS from the mock route by route (5, 8, 9); (5) Studio items, films, embeds (10, 11); (6) media CLI
(13); (7) real content (14).

## Launch checklist

- [ ] Every Fact in [06](../product/06-open-decisions.md) answered; `content:check-held` passes
- [ ] No stand-in media; `/colophon/` stand-in credits removed
- [ ] Fonts self-hosted and subset
- [ ] Three High findings fixed and verified; `FEATURE_CLIENTS` on
- [ ] CI green: check, e2e, axe, visual, Lighthouse
- [ ] Domain live with HTTPS, HSTS; `productionUrl` set
- [ ] og images verified in Slack, iMessage, X, LinkedIn (public pages and one share)
- [ ] Feeds validate (W3C feed validator, JSON Feed)
- [ ] `security.txt`, `robots.txt`, sitemap submitted
- [ ] CSP enforced after a clean week
- [ ] Every bio and social profile links to the home page (P4.5)
