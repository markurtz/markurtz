# Contributing to `markurtz`

This is the source for a personal website, so most changes come from its owner. Corrections and improvements from others are still very welcome. Thank you for taking the time!

## Code of Conduct

By participating in this project, you are expected to uphold the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security Vulnerabilities

> [!IMPORTANT]
> **Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security issue, please refer to the [Security Policy](SECURITY.md) for instructions on how to safely report it.

## How Can I Contribute?

- **Reporting Bugs:** Something broken on the site? Open a [bug report](https://github.com/markurtz/markurtz/issues/new/choose).
- **Correcting Content:** Found a typo, a broken link, or a factual error? Open a content correction issue or a pull request.
- **Suggesting Features:** Ideas for the site are welcome as feature requests.
- **Writing Code:** Bug fixes and small improvements are welcome as pull requests. For anything larger, please open an issue first to talk it over.

> [!NOTE]
> The written content, photographs, and other media on the site are personal work. Please do not submit new posts, pages, or media; corrections to existing content are welcome.

For general questions and help, please see [SUPPORT.md](SUPPORT.md).

## Contributing Code

### 1. Development Setup

Refer to the [Development Guide](DEVELOPING.md) for detailed instructions on:

- Setting up your local environment
- Installing dependencies
- Running the test suite
- Code formatting and linting standards

### 2. Making Changes

1. **Fork the Repository:** Fork `markurtz/markurtz` to your GitHub account.
2. **Create a Branch:** Create a new branch from `main` for your work (e.g., `git checkout -b bugfix/broken-link`).
3. **Write Code:** Implement your changes, adhering to the project's coding standards.
4. **Write Tests:** Add or update tests for behavior changes.
5. **Run Checks:** Run `pnpm check` and make sure it passes before committing.

### 3. Committing Your Changes

- Write clear, concise commit messages.
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add support for X`, `fix: resolve issue with Y`).
- The pre-commit hook lints and formats staged files automatically.

### 4. Submitting a Pull Request

1. **Push your branch:** `git push origin your-branch-name`.
2. **Open a Pull Request:** Open a PR against the `main` branch.
3. **Fill out the PR Template:** Provide a clear description of your changes, link to any relevant issues (e.g., `Closes #123`), and complete the checklist.
4. **Pass CI:** Ensure all GitHub Actions CI checks pass.
5. **Review:** Address any feedback. Once approved and checks pass, the maintainer will merge your PR.

## Licensing

By contributing to `markurtz`, you agree that your contributions will be licensed under its [Apache 2.0 License](LICENSE).
