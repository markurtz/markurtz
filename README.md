<!--
This file is two things at once:
  1. The GitHub profile README shown at https://github.com/markurtz
  2. The front page of the repository that holds the personal website source

Edit anything OUTSIDE the BEGIN/END markers by hand. The text between each
marker pair is generated from the site content by `pnpm readme:generate` and
checked in CI by `pnpm readme:check`. Delete a marker pair (and its heading)
to remove that section for good. See docs/guides/customizing.md.
-->

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/profile/banner-dark.svg">
  <img src=".github/profile/banner-light.svg" alt="Mark Kurtz: software, research, and things made by hand" width="100%">
</picture>

### Hi, I'm Mark 👋

<!-- TODO (Mark): two or three sentences on what you do and what you are focused on now. -->

Welcome to my corner of GitHub. This repository holds my profile README and the source code for my personal website, where I share my work, projects, writing, and photography.

<!-- BEGIN:links -->

[Website](https://example.com) · [Blog](https://example.com/blog) · [Research](https://example.com/research)

<!-- END:links -->

#### Featured projects

<!-- BEGIN:projects -->

- [**Sample software project**](https://example.com/projects/sample-software) (Software): TODO: a placeholder software project showing the repository card and tech list.
- [**Sample 3D print**](https://example.com/projects/sample-3d-print) (3D Printing): TODO: a placeholder 3D printing project with an interactive model.
- [**Sample woodworking build**](https://example.com/projects/sample-woodworking) (Woodworking): TODO: a placeholder build log with materials, tools and a photo gallery.
- [**Sample DIY project**](https://example.com/projects/sample-diy) (DIY): TODO: a placeholder for projects that do not fit another category.

<!-- END:projects -->

#### Latest writing

<!-- BEGIN:posts -->

- [Sample post: writing on this site](https://example.com/blog/welcome), 2026-11-20
- [Sample external post](https://example.com/blog/sample-external-post) (Example Publication), 2026-10-01

<!-- END:posts -->

#### Selected publications

<!-- BEGIN:papers -->

- [Sample paper with a summary page](https://example.com/research/sample-paper), _Sample Conference_ 2026
- [Sample preprint without a page](https://example.com/research#sample-preprint), _Sample Archive_ 2025

<!-- END:papers -->

#### Beyond work

<!-- TODO (Mark): one line about woodworking, 3D printing and photography, linking to the site. -->

Away from the keyboard I build things in the workshop and take photographs.

<sub>This repository is also the source of my website. See <a href="DEVELOPING.md">DEVELOPING.md</a> and the section below.</sub>

---

<details>
<summary><strong>About this repository</strong></summary>

<br/>

<p>
  <a href="https://github.com/markurtz/markurtz/actions/workflows/main.yml">
    <img src="https://github.com/markurtz/markurtz/actions/workflows/main.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License">
  </a>
</p>

### Stack

| Layer               | Technology                                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------ |
| **Framework**       | [Next.js](https://nextjs.org/) (App Router) with React and TypeScript                             |
| **Hosting**         | [Vercel](https://vercel.com/), deployed through its Git integration                               |
| **Package manager** | [pnpm](https://pnpm.io/) on Node.js 24                                                            |
| **Content**         | MDX files in `content/`, validated and typed by [Velite](https://velite.js.org/)                  |
| **Styling**         | [Tailwind CSS](https://tailwindcss.com/) v4 with theme tokens in `src/styles/theme.css`           |
| **Client area**     | Postgres ([Supabase](https://supabase.com/)) through Drizzle, and Cloudflare R2 for photos        |
| **Quality**         | ESLint, Prettier, and strict TypeScript, enforced by a pre-commit hook and CI                     |
| **Tests**           | [Vitest](https://vitest.dev/) (unit, integration) and [Playwright](https://playwright.dev/) (e2e) |

### Quick Start

```bash
git clone https://github.com/markurtz/markurtz.git
cd markurtz

corepack enable        # provides the pinned pnpm version
pnpm install
cp .env.example .env.local
pnpm dev               # http://localhost:3000
```

See [DEVELOPING.md](DEVELOPING.md) for the full command reference, project layout, and CI/CD architecture.

### Contributing

Spotted a typo, a broken link, or a bug? Issues and pull requests are welcome. See the [Contributing Guide](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

### Support and Security

- For questions and help, see [SUPPORT.md](SUPPORT.md).
- To report a security vulnerability, follow the [Security Policy](SECURITY.md).

### AI & LLM Tooling

[AGENTS.md](AGENTS.md) contains the repository-specific instructions for AI coding agents: project structure, executable commands, code style, and critical constraints.

### License

The source code is licensed under the Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Unless stated otherwise, the written content, photographs, and other media published through the website are not covered by that license and remain © Mark Kurtz, all rights reserved.

</details>
