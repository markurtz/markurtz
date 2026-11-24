> [!NOTE]
> Record of the page-content review as approved. Where it differs from [03 · Page specifications](../../product/03-page-specs.md) or [04 · Clients](../../product/04-clients-sharing-embeds.md) (for example the client sign-in wording, header Get in touch, kickers and breadcrumbs, all revised on 2026-11-23), those documents win. Paths such as `page-review/…` refer to the project's shared files, not this repository.

# Workshop pages: final content (round 1 and round 2 picks, 2026-11-22)

Source: Mark's picks in the Workshop page review (https://claude.ai/artifact/8WTvk3YAWyDJFhSARB6vgQ, db `review/workshop` round 1 and `review/workshop-r2` round 2). Previews and markup are in `page-review/workshop/build.mjs` (round 2) and `build-r1.mjs` (round 1).

## Shared with Home and Professional

- Page header: mock v10 `pageHeader()` (no box, art on the right). Art keys: workshop, builds, designs, code.
- Tiles use Professional's form: a Home-style name, a colon, then what's there.
- Pinned bands use Professional's small card: no image, an eyebrow and a two-line title.
- Blog strip on every Workshop page: "Written between projects", Home's 16:9 card (four across, no description), link "See all posts". Workshop posts first, then the newest from elsewhere.
- Section links read "See all …".
- **Open facts: hold launch (round 2 pick A).** Nothing marked [confirm] goes live; it sits on a launch checklist until Mark says yes. Until then the mock may show it as it does now.

## /workshop

No all-projects timeline here any more (Mark: it made the sub-pages less important). The full lists live on Builds, Designs and Code.

1. Header (A)
   - Kicker: Woodworker · Maker · Tinkerer
   - Title: Workshop
   - Intro: Furniture, printed parts and the code behind them. Built on weekends, mostly by hand.
2. Tiles (B)
   - Builds: Built by hand: beds, tables, benches and the odd flaming rig. (count: "11 builds")
   - Designs: Drawn to share: the plans behind the builds. (count: "2 coming soon" [confirm, see facts])
   - Code: Written for the shop: software for making things. (count: "1 project")
3. Featured (C): one featured card (mock `featuredCard`) for the entertainment center.
4. In progress (C): small cards, no images: New furniture series, MAV Grid, and the first Designs teasers once named [confirm]. No "see all" link (there is no all-projects page now).
5. Blog strip.

## /workshop/builds

- Intro (C): If I can't buy it, I build it.
- Pinned (B), small cards: Entertainment center with a mounted TV, Dining room table, Entryway bench.
- Filters (round 1 C): All · Has video · Has plans · In progress, with counts. Search and year menu stay.
- Year timeline of every build, framed photo card with its one line (round 1 kept the card). Lines other than the entertainment center's are [confirm].
- Blog strip.

## /workshop/designs

- Intro (C): Plans to make, change and make better.
- Coming-soon cards for real designs only (round 1 C). The mock's "Dining table plans" and "Parametric storage bin" are placeholders [confirm names].
- Filters (round 1 A): All · Plans · 3D models.
- Blog strip.

## /workshop/code

- Intro (C): Software for the shop, in the open.
- Keep the page with one card (round 2: as is). Workshop tooling is removed (round 1 A).
- MAV Grid line (round 1 C): Every storage system invents its own grid. MAV Grid is one open grid for all of them.
- Blog strip.

## Project pages (/workshop/<sub>/<project>/)

- Body (round 1 C): a build log with steps and photos, only where there is a real log or video; otherwise just the lede. The shared invented "How it came together" text goes.
- Body heading (round 1 C): The build
- Fact panel (round 1 C): Category, Year, Status, Materials, Time, Tools, Dimensions, Cost. Empty rows are hidden.
- Related strip (round 2 A): "More from the workshop", three small cards, link "See all builds" (or the project's own sub-page).
- Entertainment center keeps "Watch the time-lapse on Reddit".

## Placeholders (2026-11-22, Mark: mark them and close this review)

Anything below is a **placeholder**: the mock keeps its current stand-in, shown with the site's placeholder marker, and it is held from launch until Mark supplies the real fact. No new review round is planned; Mark fills these in when he has them, and whichever thread is working on that page applies them.

| Where | Placeholder | Needs from Mark |
| --- | --- | --- |
| Builds timeline, every card except the entertainment center | Year | The real year |
| Builds cards except the entertainment center | One-line description | His line, or facts |
| Builds filters | Has video / Has plans counts | Which builds have each |
| /workshop In progress band, Designs page and tile count | "Dining table plans", "Parametric storage bin" | The first 1-3 real designs |
| Designs page | Free/paid/license, file host | His answer |
| Code page, MAV Grid card and page | What MAV stands for, scope, public link | His answer |
| Builds › New furniture series | Pieces and video location | His answer |
| Project pages | Build log steps; Materials, Time, Tools, Dimensions, Cost | Per project, when written |
| Project pages | Shared "How it came together" text (invented) | Remove; replaced by build logs |
| Home "Made in the workshop" row | Parametric storage bin card | A real build |
| /workshop header | "tinkerer" in the kicker, "Built on weekends, mostly by hand" | Confirm |
| Builds copy | "rough lumber" wherever it appears | Rough lumber or dimensioned boards |

## Held for launch (Mark has not answered yet)

1. Years for every project except the entertainment center (2021); pyro board 2017 is from its video.
2. Rough lumber or dimensioned boards.
3. Which builds have video or a time-lapse, and which have plans (Builds filters).
4. The first one to three real designs.
5. Design files: free, paid or licensed; where they live.
6. MAV Grid: what MAV stands for, what it covers, public link.
7. Code vs Professional › Software for agentic templates and other tooling repos.
8. New furniture series: which pieces, where the videos live.
9. Per-project materials, time, tools, dimensions and cost.
10. Home's "Made in the workshop" row shows the placeholder parametric storage bin; swap for a real build?
11. Entertainment center line wording.
12. Whether "tinkerer" fits the kicker.

## Later change (2026-11-22, from the Blog review)

No hosted blog posts at launch, so /blog/entryway-bench/ is gone. The entryway bench project page drops its "full build log is on the blog" link until a real log exists, and Workshop blog strips show external posts only. See page-review/blog/final.md.
