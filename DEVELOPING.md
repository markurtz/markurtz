# Developing `markurtz`

This guide provides instructions for setting up your development environment, navigating the project structure, and adhering to the coding standards of this repository.

## Prerequisites

Ensure your system meets the following requirements before getting started:

- **[Git](https://git-scm.com/)** (Version control)
- **[Node.js](https://nodejs.org/) 24** (the version in [`.nvmrc`](.nvmrc); `nvm use` or `fnm use` will pick it up)
- **[pnpm](https://pnpm.io/installation)** (any recent version; it switches itself to the version pinned in the `packageManager` field of `package.json`)

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/markurtz/markurtz.git
cd markurtz

# 2. Install dependencies (also installs the pre-commit hook)
pnpm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Start the development server on http://localhost:3000
pnpm dev
```

### Environment Variables

All variables are documented in [`.env.example`](.env.example). Local values go in `.env.local`, which is ignored by git. Production and preview values are managed in the Vercel project settings, never in this repository.

> [!IMPORTANT]
> Variables prefixed with `NEXT_PUBLIC_` are embedded in the browser bundle. Never put a secret behind that prefix.

## Project Structure

| Path                     | Purpose                                                         |
| :----------------------- | :-------------------------------------------------------------- |
| `src/app/`               | Next.js App Router routes, layouts, and route handlers.         |
| `src/lib/`               | Shared modules such as site configuration and utilities.        |
| `tests/unit/`            | Fast, isolated Vitest tests.                                    |
| `tests/integration/`     | Vitest tests that exercise several modules together.            |
| `tests/e2e/`             | Playwright tests that drive the built site in a real browser.   |
| `.github/workflows/`     | CI pipelines. Files prefixed with `_` are reusable templates.   |
| `.github/actions/setup/` | Composite action that installs pnpm, Node.js, and dependencies. |

Import from `src/` with the `@/` alias, for example `import { siteConfig } from "@/lib/site"`.

## Command Reference

| Command                 | Description                                                        |
| :---------------------- | :----------------------------------------------------------------- |
| `pnpm dev`              | Start the development server with hot reload.                      |
| `pnpm build`            | Create the production build.                                       |
| `pnpm start`            | Serve the production build locally.                                |
| `pnpm lint`             | Run ESLint. `pnpm lint:fix` applies automatic fixes.               |
| `pnpm format`           | Format every file with Prettier. `pnpm format:check` only reports. |
| `pnpm typecheck`        | Generate Next.js route types and run the TypeScript compiler.      |
| `pnpm test`             | Run the unit and integration tests once.                           |
| `pnpm test:unit`        | Run only the unit tests.                                           |
| `pnpm test:integration` | Run only the integration tests.                                    |
| `pnpm test:coverage`    | Run the Vitest suites and write a report to `coverage/`.           |
| `pnpm test:e2e`         | Run the Playwright end-to-end tests.                               |
| `pnpm check`            | Lint, format check, type check, and Vitest suites in one command.  |

## Running Tests

Tests are located in the `tests/` directory and are categorized by tier.

| Test Tier       | Directory            | Runner     | Description                                                        |
| :-------------- | :------------------- | :--------- | :----------------------------------------------------------------- |
| **Unit**        | `tests/unit/`        | Vitest     | Fast, isolated tests for individual functions and components.      |
| **Integration** | `tests/integration/` | Vitest     | Slower tests that verify interactions between multiple components. |
| **End-to-End**  | `tests/e2e/`         | Playwright | Full-stack tests simulating real user workflows in a real browser. |

Vitest files are named `*.test.ts` or `*.test.tsx`; Playwright files are named `*.spec.ts`.

The first time you run the end-to-end tests, install the browser Playwright needs:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Locally, Playwright starts `pnpm dev` for you (or reuses a server that is already running). In CI it runs against the production build. To test a deployed site such as a Vercel preview, point Playwright at it:

```bash
PLAYWRIGHT_BASE_URL=https://example.vercel.app pnpm test:e2e
```

## Code Quality and Formatting

- **Prettier** owns formatting. Its settings come from [`.prettierrc.json`](.prettierrc.json) and [`.editorconfig`](.editorconfig).
- **ESLint** uses the Next.js Core Web Vitals and TypeScript rule sets ([`eslint.config.mjs`](eslint.config.mjs)).
- **TypeScript** runs in strict mode with `noUncheckedIndexedAccess` ([`tsconfig.json`](tsconfig.json)).
- **Pre-commit hook:** [Husky](https://typicode.github.io/husky/) runs [lint-staged](https://github.com/lint-staged/lint-staged) on staged files, so commits are linted and formatted automatically.

> [!TIP]
> **IDE Configuration:** The repository ships VS Code settings that format on save and recommend the ESLint, Prettier, EditorConfig, Playwright, and Vitest extensions.

## Dependencies and Supply Chain

- Add packages with `pnpm add <name>` (or `pnpm add -D <name>` for tooling) and commit `pnpm-lock.yaml`.
- [`pnpm-workspace.yaml`](pnpm-workspace.yaml) hardens installs: versions must be public for three days before they can be installed (`minimumReleaseAge`), a package may not lose its publishing provenance (`trustPolicy`), and dependency build scripts only run when approved in `allowBuilds`.
- [Dependabot](.github/dependabot.yml) opens grouped update pull requests every Monday for npm packages and GitHub Actions.
- GitHub Actions are pinned to full commit SHAs with a version comment.

## Git Workflow & Branching

1. **Branch Naming:**
   - Feature branches: `feature/short-description`
   - Bug fixes: `bugfix/short-description`
   - Content: `content/short-description`
   - Documentation: `docs/short-description`

2. **Commit Messages:**
   Follow [Conventional Commits](https://www.conventionalcommits.org/).
   - `feat: add project gallery page`
   - `fix: correct RSS feed dates`
   - `docs: update developing guide`

3. **Pull Requests:**
   - Push your branch to the remote repository.
   - Open a Pull Request against the `main` branch.
   - Ensure all CI checks pass. `CI Passed` is the single status to require in branch protection.

## CI/CD Architecture

This repository uses a modular GitHub Actions architecture. Workflows are divided into core lifecycle events and reusable helper templates.

### Lifecycle Workflows

| Workflow                            | Trigger                | Purpose                                                                                  |
| :---------------------------------- | :--------------------- | :--------------------------------------------------------------------------------------- |
| **Development** (`development.yml`) | Pull Request to `main` | Runs quality gates, security audits, unit/integration/e2e tests, and a production build. |
| **Main** (`main.yml`)               | Push to `main`         | Post-merge validation with the same stages.                                              |
| **Weekly** (`weekly.yml`)           | Cron (Sun 00:00 UTC)   | Security audit, full test suite, and link check to catch drift that no commit triggered. |

### Reusable Templates

The pipelines rely on modular templates located in `.github/workflows/_*.yml`:

| Template          | Purpose                                                                    |
| :---------------- | :------------------------------------------------------------------------- |
| `_quality.yml`    | ESLint, Prettier, and TypeScript checks.                                   |
| `_tests.yml`      | Vitest (unit, integration) and Playwright (e2e) with coverage and reports. |
| `_build.yml`      | Production build of the site.                                              |
| `_security.yml`   | Secret scan, dependency audit, dependency review, and CodeQL analysis.     |
| `_link-check.yml` | Link validation for Markdown and MDX files.                                |

### Deployment

Deployment is handled by [Vercel's Git integration](https://vercel.com/docs/git), not by GitHub Actions. Every pull request gets a preview deployment, and every push to `main` deploys to production. Custom domains and environment variables are configured in the Vercel project.

For further assistance, please refer to [SUPPORT.md](SUPPORT.md).
