# Sources

Where the working material behind these documents lives. Links to claude.ai open only for Mark.
Paths in backticks are in the project's shared files, not in this repository.

## Mock

| What | Where |
| --- | --- |
| Static mock (v51 at time of writing), 51+ pages | https://claude.ai/artifact/6SuC2aV5w9VUYww69tF3iy |
| Source | `site-mock/`: `content/site.mjs` (all content), `src/components.mjs`, `src/html.mjs`, `src/icons.mjs`, `src/styles/{tokens,site}.css`, `src/scripts/{site,theme,art-motion}.js`, `scripts/build.mjs`, `tests/smoke.mjs` |
| Build and test | `node scripts/build.mjs` then `node tests/smoke.mjs` |
| Screenshots | `site-mock/screenshots/` |

## Specifications and reviews

| What | Where |
| --- | --- |
| Site structure spec (Claude Doc) | https://claude.ai/artifact/2dbCzAfg9d8ThzkqsXWx9k |
| Site Map and Access decision page | https://claude.ai/artifact/DYJ4W1oTkv4vuvieV1sTxy |
| Brand system page | https://claude.ai/artifact/SwGqtP5XjUzjh8LFrHbyFw (source `site-structure/brand/`) |
| Brand choices | https://claude.ai/artifact/CLaAVe9cUBmgue3sBy7Q48 |
| Component Workbench | https://claude.ai/artifact/HsFpuku5nGVHJyX5JFP8qM (decisions `components-workbench/component-decisions.md`) |
| Page reviews | Home https://claude.ai/artifact/Fm1vHBtEQgcJEz1RZVheJa · Professional https://claude.ai/artifact/3cQ1mdk4bNUGUhHx8P7x2F · Workshop https://claude.ai/artifact/8WTvk3YAWyDJFhSARB6vgQ · Studio https://claude.ai/artifact/27mxsyT1sR5sy4yM52LoY4 · Blog https://claude.ai/artifact/VgN6YsvV14dvmBvvLNw6kr · About https://claude.ai/artifact/U8LgbaZzbMJGeFkwCGADJY |
| Page finals | `page-review/<page>/final.md`, copied to [page-content/](page-content/) |
| Parent-link options | https://claude.ai/artifact/TF151GuE2YAPXHMy3pcKt9 |
| Research report "Modern Web Best Practices, Late 2026" | https://claude.ai/artifact/1ikcTBbrkRcLM91RiJFQaw (`research/modern-web-best-practices-2026.md`) |

## Imagery

| What | Where |
| --- | --- |
| Final icons and imagery board | https://claude.ai/artifact/GHxUGdZ21gupg8wuYcBcuf |
| Source and guide | `imagery/final/README.md`, `icons.mjs`, `mk-study.mjs`, `gen-art.mjs`, `art-joints.mjs`, `out/` |
| Page art, final (Build Six) | `imagery/rebuild/final/README.md`, `page-art.js`, `page-art.css`, `field2.js`, `art-motion.js`, `subjects.js`, `out/`; review page https://claude.ai/artifact/VfENMn2jP2oCz9ojpC1K4F |
| Earlier motion (retired) | `imagery/motion/README.md` |
| Loop review | https://claude.ai/artifact/Eip2RQdXWJF5svrhiVCSsf (`imagery/motion/loop-review/`) |
| Scroll-motion prototype | https://claude.ai/artifact/8jxwv5WTqqhCUvmHu684WQ |

## Repository

| What | Where |
| --- | --- |
| Implementation plan | [docs/plans/website-implementation-plan.md](../../plans/website-implementation-plan.md) (PR #1) |
| Repo standards | PR #2 (`claude/project-thread-a37u44`) |
| Build | PR #3 (`claude/project-thread-hcxhrm`), reviewed at `e2ee8b4` with 16 inline comments |
| Lecture deck (colour source) | "What Survives Compression", MIT 6.S979, 28 Oct 2026 |
