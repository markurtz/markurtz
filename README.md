<!--
This file is two things at once:
  1. The GitHub profile README shown at https://github.com/markurtz
  2. The front page of the repository that holds the personal website source

Keep the top section short and personal. Repository details live in the
collapsed section at the bottom and in DEVELOPING.md.
-->

# Hi, I'm Mark 👋

Welcome to my corner of GitHub. This repository holds my profile README and the source code for my personal website, where I share my work, projects, writing, and photography.

🚧 The website is under construction. Check back soon.

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
