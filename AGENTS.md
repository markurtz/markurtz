# AGENTS.md — AI Agent & Coding Assistant Guide

> **This file provides repository-specific instructions to AI coding agents** (e.g., OpenAI Codex, GitHub Copilot, Gemini, Claude, Cursor).
> Human contributors should refer to [DEVELOPING.md](DEVELOPING.md).

## Project Context

**`markurtz`** is the source for Mark Kurtz's personal website and, because the repository shares his username, his GitHub profile README.

**Primary language:** TypeScript (strict)
**Framework:** Next.js (App Router) with React
**Package manager:** pnpm (version pinned in `package.json`), Node.js 24 (`.nvmrc`)
**Hosting:** Vercel, deployed by its Git integration (previews per pull request, production from `main`)

## Critical Constraints

> [!CAUTION]
>
> 1. **Never commit secrets.** Do not add API keys, tokens, or credentials anywhere. Document new variables in `.env.example` with placeholder values only.
> 2. **Never expose a secret through `NEXT_PUBLIC_`.** Variables with that prefix are shipped to the browser.
> 3. **Never commit private or client media.** Client photo galleries and anything behind a login must not live in the repository or in `public/`.
> 4. **Do not modify `LICENSE` or `NOTICE`.** These are legally binding.
> 5. **Do not modify workflow trigger conditions or permissions** without human review.
> 6. **`README.md` is the public GitHub profile page.** Keep its top section short and personal; put repository details in the collapsed section or in `DEVELOPING.md`.
> 7. **Do not weaken supply-chain settings** in `pnpm-workspace.yaml` (`minimumReleaseAge`, `trustPolicy`, `allowBuilds`) or unpin GitHub Actions from commit SHAs.

## Repository Layout

- `site.config.ts`: Identity, navigation, categories and feature switches. Validated by `src/lib/site-config.ts`.
- `content/`: MDX and YAML content, validated and compiled by Velite (`velite.config.ts`) into `.velite/`.
- `src/app/(site)/`: Public routes. `src/app/(private)/`: client area, gated pages and admin. `src/app/api/`: route handlers.
- `src/components/`: `ui/` primitives, `layout/`, `content/`, `mdx/` (components usable in posts), `gallery/`, `private/`.
- `src/lib/`: Shared, framework-light modules (configuration, content queries, feeds, SEO, utilities).
- `src/server/`: Server-only code: `db/` (Drizzle schema, migrations), `dal/` (all queries), `auth/`, `storage/`, `actions/`.
- `scripts/`: CLI tools run with `tsx` (`new`, `photos`, `readme`, `syndicate`).
- `docs/guides/`: Owner-facing how-to guides. Keep them in step with behavior.
- `tests/`: Organized into `unit/`, `integration/` (Vitest) and `e2e/` (Playwright).
- `.github/workflows/`: CI pipelines. Files prefixed with `_` are reusable templates.
- `.github/actions/setup/`: Composite action that installs pnpm, Node.js, and dependencies.

Import from `src/` with the `@/` alias (for example `@/lib/site`).

## Architecture Rules

These are enforced by `tests/unit/boundaries.test.ts`.

- **Only `src/lib/content/` imports Velite output** (`#velite`). Everything else uses its typed query functions.
- **Every module under `src/server/` starts with `import "server-only"`** (or `"use server"` for actions). `db/schema.ts` and `db/migrate.ts` are the exceptions, because tools load them outside Next.js.
- **Client components import nothing from `src/server/` except `actions/`**, and never receive storage keys or database rows. Map rows to view models on the server (`src/server/media.ts`).
- **Pages and route handlers in the private area never query the database directly.** They call an access guard from `src/server/auth/access.ts` first (`requireGalleryAccess`, `requireCollectionAccess`, `requireGate`, `requireAdmin`) and then the data access layer.
- **Every admin server action begins with `await requireAdmin();`.**
- **Access decisions are pure functions** (`evaluate*Access`) with unit tests. Change the rules there, not in pages.
- **Private media stays in the private bucket** and is reached only through short-lived signed URLs.
- Modules loaded by root config files (`next.config.ts`, `velite.config.ts`) use relative imports, not the `@/` alias.
- A schema change needs a migration (`pnpm db:generate`) committed with it. New tables must call `.enableRLS()`.
- A new MDX component needs a Markdown fallback in `scripts/syndicate/fallbacks.ts`.
- Do not invent biography, employers or publications. Use `TODO` placeholders and labelled samples.

## Executable Commands

- **Install:** `pnpm install`
- **Dev server:** `pnpm dev`
- **Linting:** `pnpm lint` (fix with `pnpm lint:fix`)
- **Formatting:** `pnpm format:check` (fix with `pnpm format`)
- **Type checking:** `pnpm typecheck`
- **Testing:** `pnpm test` (Vitest: unit + integration), `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e` (Playwright)
- **Build:** `pnpm build` (runs `velite build --strict` first)
- **Content only:** `pnpm content`
- **Profile README:** `pnpm readme:generate` (CI runs `pnpm readme:check`)
- **Database:** `pnpm db:generate`, `pnpm db:migrate`
- **Scaffolding and tools:** `pnpm new`, `pnpm photos`, `pnpm syndicate --dry-run`
- **Everything CI checks except e2e and build:** `pnpm check`

Run `pnpm check` before finishing any change, and `pnpm build` when routes, configuration, or dependencies change. Run `pnpm test:e2e` when a route, the private area or access rules change; it builds the site with the private areas on, using an in-process database (PGlite), local storage and the development sign-in driver, so it needs no accounts or secrets (`tests/e2e/env.ts`).

## Code Style & Patterns

- **Server Components by default.** Add `"use client"` only where interactivity requires it.
- **No magic strings or numbers** — define constants.
- **Prefer explicit over implicit.** No `any`; narrow `unknown` instead.
- **One responsibility per module.**
- Every exported function, component, and module has a short doc comment explaining its purpose.
- Formatting is owned by Prettier and linting by ESLint. Do not hand-format or disable rules without a comment explaining why.
- Add dependencies with `pnpm add` so the lockfile stays in sync. Prefer the platform and existing dependencies over new packages.
- Follow [Conventional Commits](https://www.conventionalcommits.org/).

## GitHub Actions Workflows

- **Reusable Templates (`_*.yml`):** Never trigger directly. Ensure changes are backward-compatible with every caller.
- **Lifecycle:**
  - `development.yml`: Pull requests to `main` (quality, security, unit + integration + e2e tests, build).
  - `main.yml`: Push to `main` (same stages, post-merge).
  - `weekly.yml`: Scheduled security audit, full test suite, and link check.
- Pin every third-party action to a full commit SHA with a version comment.
- Operational workflows: `syndicate.yml` (blog cross-posting), `db-migrate.yml` (manual, `production` environment), `keepalive.yml` (daily health check and gallery expiry), `db-backup.yml` (weekly encrypted dump). Each is inert until its secrets exist.
- Deployment is not done in GitHub Actions. Vercel builds and deploys from Git.

## Documentation

- Root Markdown files (`README.md`, `DEVELOPING.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`) are the documentation. Update them in the same change as the behavior they describe.
- When a feature adds an environment variable, a script, or a workflow, update `.env.example`, `DEVELOPING.md`, and this file.

## Agent Notes

_Add notes here when updating instructions for AI agents._
