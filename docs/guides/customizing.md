# Customizing the site

Almost everything about the site is driven by one file, [`site.config.ts`](../../site.config.ts), and by the Markdown files in [`content/`](../../content). You should rarely need to touch a React component.

## Start here: replace the placeholders

The repository ships with labelled sample content and `TODO` placeholders, because none of it should be invented for you. Search for `TODO` to find every spot.

| What                                   | Where                                                         |
| :------------------------------------- | :------------------------------------------------------------ |
| Name, tagline, description, social IDs | `site.config.ts`                                              |
| The live domain                        | `productionUrl` in `site.config.ts` (see [deploy](deploy.md)) |
| About, hobbies, uses, now, privacy     | `content/pages/*.mdx`                                         |
| Jobs, education, talks                 | `content/data/*.yaml`                                         |
| Sample posts, papers, projects, album  | Delete the `sample-*` entries under `content/`                |

After changing content that appears on the GitHub profile, run `pnpm readme:generate` and commit `README.md`. CI fails if the README is stale.

## `site.config.ts`

| Key                 | What it controls                                                                                                                                                |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nav`               | Header links, in order.                                                                                                                                         |
| `social`            | Handles shown in the footer, about page and profile README. Empty ones are left out.                                                                            |
| `projectCategories` | The hobby categories. Add a line to add a hobby: its listing page, filter and README entry follow.                                                              |
| `home.sections`     | Which sections the home page shows, in order, and how many items each holds.                                                                                    |
| `features`          | Switches for whole areas (blog, research, photos, search, contact, analytics, client galleries, gated pages). A switched-off area is not built and returns 404. |
| `blog`              | Posts per page, reading time, and the default syndication targets.                                                                                              |
| `syndication`       | `autoPublish: false` creates cross-posts as drafts for you to review.                                                                                           |
| `readme`            | Which generated sections the profile README shows and how many items.                                                                                           |
| `clientArea`        | Label, default gallery expiry and how long a passcode session lasts.                                                                                            |

The file is validated when the site builds, so a typo fails the build with a message that names the field.

## Colors, fonts and layout

- Colors, radius and fonts are CSS variables in [`src/styles/theme.css`](../../src/styles/theme.css), with a light and a dark set. Change the `--accent` values to re-brand the site.
- Typography for articles is in [`src/styles/globals.css`](../../src/styles/globals.css).
- The header, footer and navigation live in `src/components/layout/`.

## Adding a page

Create `content/pages/<name>.mdx` with a `title` and `description`. It is served at `/<name>`. Add it to `nav` in `site.config.ts` if it should appear in the header.

## Adding a component for use in posts

1. Add the component under `src/components/mdx/` and register it in `src/components/mdx/index.tsx`.
2. Add a plain Markdown fallback in `scripts/syndicate/fallbacks.ts`, so cross-posted copies still read well.
