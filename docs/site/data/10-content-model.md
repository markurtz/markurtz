# 10 · Content model

Status: **Locked** for structure (P6.1 to P6.5, 2026-11-21); field names are **Default**
(derived from the mock's `content/site.mjs`, which is the working reference for every field below).

Public content is files in git. It builds to static HTML and needs no database. Private material is
never in the repository (P6.4). Large media lives outside git and is uploaded with the CLI (P6.5).

## 1. Folders

A file's folder is its address. Each post, project or work is a folder with its text beside it.
Repeated records are one YAML list per kind (P6.2).

```text
content/
  labels.yaml                      sections, sub-sections, topics, regions, orgs
  site.yaml                        identity, menu, footer, profiles, stats (hand-kept part)
  pages/
    home.mdx                       hero, doors and row picks
    about.mdx  uses.yaml  colophon.mdx  privacy.mdx
  professional/
    index.mdx                      header copy, tiles, pinned picks
    experience.yaml                roles and education
    software.yaml                  repositories (public and not public)
    research.yaml                  papers and patents
    speaking.yaml                  talks, lectures, webinars, podcasts
  workshop/
    index.mdx                      header copy, tiles, featured, in-progress picks
    builds/<project>/index.mdx     one folder per project, photos.json beside it
    designs/<project>/index.mdx
    code/<project>/index.mdx
  studio/
    index.mdx                      header copy, favourites, "What I shoot with"
    <name-year>/index.mdx          one folder per work
    <name-year>/photos.json        written by the media CLI
  blog/
    external.yaml                  posts published elsewhere
    <slug>/index.mdx               hosted posts, images beside them
media/
  credits.json                     stand-in credits (must be empty at launch)
```

The compiled content is reached only through `src/lib/content/` (architecture rule from PR #3).

## 2. Labels

`content/labels.yaml` is the single list of names. Every record's labels must exist here; the
build fails otherwise.

```yaml
sections:
  professional: { name: Professional, subs: { software: Software, research: Research, speaking: Speaking, experience: Experience } }
  workshop:     { name: Workshop,     subs: { builds: Builds, designs: Designs, code: Code } }
  studio:       { name: Studio,       subs: { photo: Photo, video: Video, travel: Travel, creative: Creative } }
regions:        [polar, europe, americas, africa-and-middle-east]
orgs:                                   # roles that items point to with `org`
  red-hat:      { name: Red Hat }
  neural-magic: { name: Neural Magic }
  burst:        { name: Burst, Inc. }
  personal:     { name: Personal }
topics:                                 # free tags; listed so spelling stays consistent
  [quantization, sparsity, speculative-decoding, benchmarking, agents, furniture, time-lapse, 3d-printing, plans, …]
```

Topics only filter (`?topic=`); there are no topic pages.

## 3. Shared fields

Every list item has these, in addition to its own fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | slug | yes | Unique per kind. For folder items it is the folder name. Used as the `#anchor`. |
| `title` | string | yes | Sentence case |
| `year` | int | yes | Places the item on the year rail. For repos, the start year. |
| `tags` | topic[] | no | |
| `org` | org id | Professional only | The role the work belongs to (P2.2) |
| `pin` | bool | no | Shows in the page's pinned band |
| `featured` | bool | no | Home picks and Speaking "Featured" |
| `size` | `compact` \| `standard` \| `featured` | no | Card size, default `standard` |
| `badge` | `in-progress` \| `coming-soon` | no | Card badge (P1.3) |
| `tbd` | string[] | no | Field names that are **Held** ([05](../product/05-voice-copy-placeholders.md#4-facts-and-placeholders)) |
| `ask` | string | no | The open question for a held field |
| `unlisted` | bool | no | Readable by link, left out of lists, search, feeds, sitemap |

## 4. Records

Types below are written as TypeScript; the build validates them with Zod.

### 4.1 Site (`content/site.yaml`)

```ts
type Site = {
  name: "Mark Kurtz";
  description: string;                 // meta description for the home page
  menu: { label: string; href: string }[];          // Professional, Workshop, Studio, Blog, About
  footer: { label: string; href: string }[];        // Uses, Colophon, Privacy, Clients
  profiles: { name: string; handle: string; url: string; icon: IconName }[];
  stats: { value: string | "auto:github-stars"; label: string }[];
};
```

`productionUrl`, feature switches and secrets are in `site.config.ts` and the environment, not here.

### 4.2 Experience (`professional/experience.yaml`)

```ts
type Role = {
  id: OrgId;                       // red-hat, neural-magic, burst, …
  org: string;
  kind: "work" | "education";
  start: number; end: number | "now";   // years for the rail
  location?: string;
  titles: { title: string; from: string; to: string }[];   // "Jan 2025", "now"
  bullets: string[];               // 3 to 5 for current roles, one line for earlier roles
  built?: { kind: "software" | "research" | "talk"; id: string }[];   // up to 6
};
```

Rule: every `built` reference must resolve. "All from <org>" links are generated from `id`.

### 4.3 Software (`professional/software.yaml`)

```ts
type Repo = Shared & {
  owner: string; name: string;     // github.com/<owner>/<name>; omitted when not public
  public: boolean;                 // false = "Not public" card with lock icon, no link
  tagline: string;                 // one line, set B
  kind: "library" | "tool";        // Research libraries / Developer tools
  role: "Creator" | "Co-creator" | "Maintainer" | "Author" | "Contributor";
  lang: string;
  status: "active" | "archived" | "in-progress";
  where?: string;                  // for non-public work: where it lived
};
// Derived at build: stars, latestRelease { tag, date }, pushedAt (GitHub API, cached).
```

### 4.4 Research (`professional/research.yaml`)

```ts
type Research = Shared & {
  kind: "paper" | "patent";
  venueKind?: "conference" | "preprint" | "journal" | "workshop";   // filter: Conference papers / Preprints
  authors: string[];               // as printed; Mark's entry is "M. Kurtz" and renders bold
  venue: string;                   // "ICLR 2026", "arXiv", "Granted patent"
  number?: string;                 // patents: "US 11,797,855"
  citations?: number;              // hand-kept; refreshed monthly
  links: { label: "arXiv" | "PDF" | "Code" | "Video" | "Google Patents" | string; url: string }[];
  cite?: string;                   // BibTeX; generated from fields when absent
  result?: string;                 // key result, shown only on Featured cards
};
```

### 4.5 Speaking (`professional/speaking.yaml`)

```ts
type Talk = Shared & {
  kind: "talk" | "lecture" | "webinar" | "podcast";
  tier: 1 | 2 | 3;                 // 1 keynote or major talk, 2 conference talk, 3 webinar or podcast
  venue: string;
  date?: string;                   // ISO date when known
  video?: { provider: "youtube"; id: string } | { provider: "url"; url: string };
  thumbnail?: MediaKey;            // defaults to the YouTube thumbnail, fetched at build and self-hosted
};
```

### 4.6 Workshop project (`workshop/<page>/<project>/index.mdx`)

Front matter, then the build log as MDX under "The build".

```ts
type Project = Shared & {
  sub: "builds" | "designs" | "code";          // must match the folder
  summary: string;                              // the card line
  lede: string;
  status: "finished" | "ongoing" | "upcoming";  // role line: tag · status · year
  cover?: MediaKey;
  photos?: "photos.json";
  facts?: { category?: string; materials?: string; time?: string; tools?: string;
            dimensions?: string; cost?: string };          // empty rows hidden
  files?: { label: string; key: MediaKey; format: "PDF" | "STL" | "STEP" | "3MF" | string; bytes?: number }[];
  repo?: string;                                // code projects
  film?: FilmRef;                               // time-lapse or process clip
  external?: { label: string; url: string }[];  // "Watch the time-lapse on Reddit"
  hasVideo?: boolean; hasPlans?: boolean;       // Builds filters (derived when film/files present)
};
```

### 4.7 Studio work (`studio/<name-year>/index.mdx`)

The folder name is the address: `<name>-<year>` (P3.3).

```ts
type Work = Shared & {
  place: string;                    // "Black Rock City, Nevada"
  area: string;                     // card line: "Nevada"
  region: Region;                   // filter
  start: string; end?: string;      // ISO dates; month and days derived
  shown?: string;                   // display override for the year, e.g. "2025–26"
  kinds: ("photo" | "video" | "travel" | "creative")[];
  lede: string;                     // "N days in <place>, <dates>."
  moment: string;                   // first-person opening of the story
  kit?: { camera?: string; lenses?: string; editedIn?: string };   // facts panel; defaults from uses.yaml
  film?: FilmRef;                   // leads the page in the cinema band and the mosaic
  photos: "photos.json";
};
// Body: story paragraphs, placed between photo rows with <Rows after={n} />.

type FilmRef = { key: MediaKey; duration: string /* "0:12" */; captions?: string /* .vtt key */; description?: string };
```

`photos.json`, written by the media CLI:

```ts
type Photo = {
  key: MediaKey;                    // "studio/iceland-2025/<uuid>"
  width: number; height: number;    // of the largest derivative
  takenAt: string;                  // capture time, drives the day-by-day rail
  alt: string;                      // required before launch
  caption?: string;
  thumbhash: string;
  focus?: [number, number];         // 0..1 focal point for crops (og:image, cards)
};
```

Item numbers on single-photo pages (`/studio/<work>/<n>/`) are the 1-based order in `photos.json`.
Reordering photos changes those addresses, so the CLI appends and only reorders on request.

### 4.8 Hosted post (`blog/<slug>/index.mdx`)

```ts
type Post = {
  title: string;
  hook: string;                     // one sentence: subtitle, card summary, meta description
  date: string; updated?: string;
  section: SectionId; sub: SubId; topics?: string[];
  cover?: MediaKey;                 // share image falls back to the Blog banner
  draft?: boolean;                  // dev and previews only
  unlisted?: boolean;
  pin?: boolean;
  syndicate?: ("devto" | "hashnode")[];
};
// Derived: readingMinutes, toc, wordCount.
```

### 4.9 External post (`blog/external.yaml`)

```ts
type ExternalPost = {
  title: string; date: string;
  section: SectionId; sub: SubId; topics?: string[];
  source: "Red Hat Developer" | "Medium" | "Neural Magic" | "Reddit" | string;
  url: string;
  summary: string;                  // approved one-liner (Held until approved)
  cover?: MediaKey;                 // else generated cover art
  pin?: boolean;
};
```

### 4.10 Uses (`pages/uses.yaml`)

```ts
type Uses = { updated: string; groups: { id: "desk" | "software" | "woodshop" | "3d-printing-and-electronics" | "camera-and-editing";
  name: string; items: { name: string; model: string; why: string; icon: IconName; url?: string; affiliate?: boolean }[] }[] };
```

The Camera and editing group is the source for Studio's "What I shoot with" and the default `kit`
on works, so the three never drift.

## 5. Validation rules (build fails on any)

1. Every label, region and org exists in `labels.yaml`.
2. Every `built`, `pin` and home pick resolves to an item.
3. `id`s are unique per kind; folder names match `^[a-z0-9]+(-[a-z0-9]+)*$`; Studio folders end in `-<year>`.
4. Every photo has `alt` (production only), width, height and `takenAt`.
5. No `⟦…⟧`, `[confirm` or non-empty `tbd` remains (production only).
6. No stand-in media key is referenced (production only).
7. External URLs are `https://`.
8. Home rows hold exactly four items each.

## 6. Derived data

| Data | Source | When |
| --- | --- | --- |
| GitHub stars, releases | GitHub REST API with a read-only token | Build; cached in `.cache/github.json`; the last good value is kept on failure |
| Home "GitHub stars" stat | Sum of stars over repos with `role: Creator` | Build |
| Filter counts | Item lists | Build |
| Search index | Titles, summaries, labels (MiniSearch) | Build, one small JSON per list page |
| Talk thumbnails | YouTube `i.ytimg.com`, saved to public storage | Media CLI, once per talk |
| og:image crops | Photo + `focus` | Media CLI |
| Reading time | Post body | Build |
