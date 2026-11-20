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

- `src/app/`: Next.js App Router routes, layouts, and route handlers.
- `src/lib/`: Shared, framework-light modules (configuration, utilities).
- `tests/`: Organized into `unit/`, `integration/` (Vitest), and `e2e/` (Playwright).
- `.github/workflows/`: CI pipelines. Files prefixed with `_` are reusable templates.
- `.github/actions/setup/`: Composite action that installs pnpm, Node.js, and dependencies.

Import from `src/` with the `@/` alias (for example `@/lib/site`).

## Executable Commands

- **Install:** `pnpm install`
- **Dev server:** `pnpm dev`
- **Linting:** `pnpm lint` (fix with `pnpm lint:fix`)
- **Formatting:** `pnpm format:check` (fix with `pnpm format`)
- **Type checking:** `pnpm typecheck`
- **Testing:** `pnpm test` (Vitest: unit + integration), `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e` (Playwright)
- **Build:** `pnpm build`
- **Everything CI checks except e2e and build:** `pnpm check`

Run `pnpm check` before finishing any change, and `pnpm build` when routes, configuration, or dependencies change.

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
- Deployment is not done in GitHub Actions. Vercel builds and deploys from Git.

## Documentation

- Root Markdown files (`README.md`, `DEVELOPING.md`, `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`) are the documentation. Update them in the same change as the behavior they describe.
- When a feature adds an environment variable, a script, or a workflow, update `.env.example`, `DEVELOPING.md`, and this file.

## Agent Notes

_Add notes here when updating instructions for AI agents._
