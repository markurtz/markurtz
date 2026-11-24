# 31 · Components

Status: **Locked** (Component Workbench final 2026-11-21; page-header, header and share-button
changes through 2026-11-23). Reference markup and CSS: the mock's `src/components.mjs` and
`src/styles/site.css`; earlier workbench source in `components-workbench/` with section line
numbers in `component-decisions.md` ([sources](../records/sources.md)).

## Site header

- 68 px bar. Lockup left (monogram tile + "markurtz" with a teal k). Links right: Professional,
  Workshop, Studio, Blog, About, in muted ink, 0.95 rem, weight 500.
- Current section: ink, weight 600, a 2 px teal line along the bottom edge (`inset 0 -2px 0`).
  Replaces the earlier pill nav.
- Then the theme button. **No Get in touch** (removed 2026-11-23).
- Under 760 px: links fold into a menu button that opens a full-width panel.
- Gains a hairline border once the page scrolls. On the home page it is transparent over the hero
  until scroll.

## Footer

Side by side on the page background with a hairline on top (not navy). Left: invitation and a
small primary **Get in touch**. Right: Uses · Colophon · Privacy · Clients, then the profile icon
buttons with names and tooltips. Base row: small lockup left, "© 2026 Mark Kurtz · Photos CC BY-NC ·
Code on GitHub" right.

## Page header (`.ph`)

On the page background, no box. Min height `clamp(300px, 30vw, 440px)`. Text column up to 54% (660 px),
gap 14 px: role line (Geist Mono 500, `clamp(.82rem, …, .95rem)`, tracking .04em, muted), path
title (`.ph-title`; parent part `.ph-up` muted 700, separator `.ph-sep` in `--color-line-strong`),
lede (`.ph-lede`, display font, muted), meta, actions. Art (`.page-art`, `data-page-art="<subject>"`) right-aligned at ~64% width,
on the field of rising teal lines; the marker draws the subject live and it loops while visible ([33](33-page-art-motion.md)). Below 1024 px the art
becomes a band above the text.

## Buttons, pills and badges

| Part | Spec |
| --- | --- |
| Button | 8 px radius, 44 px min height, display font 600. Primary teal fill; secondary hairline; quiet text-only. Icon before label at 1 em. |
| Round icon button | 36 px (44 px touch target via padding), used for theme, item actions, viewer controls |
| Filter pill / segment | Pill radius, mono count |
| Badge | Pill, 0.75 rem, weight 600, hairline; "In progress", "Coming soon", "Not public" (with lock), "Paper", "Patent", "New" |
| Source pill | On media: "Red Hat ↗" |
| Link chip | Small hairline chip for paper links (Featured only) |
| Status dot | 8 px, success or muted |

## List toolbar

One row: segmented switch (sunken track, segments with mono counts, current segment raised),
then search (~260 px, icon inside, placeholder per page) and the year menu, right-aligned; wraps
below on narrow screens. Blog: picking a section reveals its sub-label segments. Client gallery:
All/New switch, four dropdown checkbox menus with counts, "Select all N".

## Pinned band (`.pin-band`)

Teal-tinted sunken band with a star label (Pinned / Featured / Favorites), 24 px above the toolbar,
holding small cards in an auto-fill grid (250 px min).

## Year rail (`.rail`, `.rail-y`)

Two columns: a 96 px rail with the year as a large muted numeral, then that year's cards. No
headings over hairlines. On phones the year sits above its cards. Each group has `id="y-YYYY"`.

## Jump bar

Above every timeline with three or more stops: hairline track; teal dots sized by item count; mono
labels; the stop in view highlighted; filtered-away stops faded. Phones show the two end labels
and the current one.

## Cards

| Card | Used on | Anatomy |
| --- | --- | --- |
| **Small (icon) card** `.cp` | Pinned bands, "Built here", In progress, related strips | 64 px icon tile or thumb, eyebrow, title (2 lines) |
| **Home card** `.hm-c` | Home rows, blog strips | Framed; 16:9 media with a type pill; eyebrow (1 line); title (2 lines reserved); no description; 4/2/1 across at 960/640 px |
| **Repo card** | Software | GitHub-style: owner/name, tagline, role, language dot, stars, release, Active/Archived; "Not public" variant with lock and no link |
| **Research entry** `.rc` | Research | Year in the rail only; top line kind badge · venue · citations, Cite button right; linked title; authors with Mark bold. Featured adds a figure and the key result in a teal-ruled quote |
| **Talk card** | Speaking | 16:9 thumbnail with play mark, eyebrow kind · year, title, venue; three across |
| **Framed photo card** `.gc` | Workshop, Blog | Photo on top (4:3), panel with eyebrow, title, one line; image zooms on hover |
| **Title-on-photo card** `.gc--over` | Studio | Photo fills the card at 12 px radius, dark gradient, eyebrow and title over it, count badge top right ("5 photos"); 2 across on `/studio` |
| **Mosaic** `.gc-mos` | Works with ≥ 3 photos | One large photo (2/3 width, full height) and two stacked; the last carries "+N"; a film is the large tile |
| **Featured (short split)** `.ft2--split` | Workshop hub | Full row; photo left 5/12, max 300 px tall; eyebrow, title 1.3–1.6 rem, two-line description, facts on one line, "Read the build" |
| **Profile card** | About, Uses | Icon card with name, handle or model, one line |

Sizes per item: compact, standard, featured (P1.2). Hover on every card: border turns teal, no
lift.

## Photo layouts

- **Justified rows** (`<JustifiedRows>`): rows filled edge to edge at a target height (about 280 px
  desktop, 180 px phone), photos never cropped or retouched ("untouched", Locked), 3 px gaps.
- **Photo timeline** (`<PhotoTimeline>`): the year-rail look for moments; rail labels in the unit
  that fits the span (clock times, "Day 3", months); a range strip on top places each moment.

## Item actions

Three 36 px round buttons (Copy link, Embed, More) on a translucent dark chip at the top right of
each photo or film. J1 icons in white. Toast at the bottom centre, `role="status"`, 3 s, with an
optional "Change" action. Embed popover: snippet in a mono read-only field and Copy. More: menu
with 2 to 3 items ([04 § 6](../product/04-clients-sharing-embeds.md#6-the-three-buttons-on-every-photo-and-film)).

## Viewer (`dialog.pv`)

Always dark (navy-950 at 96%). The photo fills the dialog. 44 px round previous and next at the
sides; Copy link, Embed, More and Close top right; bottom gradient with caption, mono "4 / 6" and a
filmstrip of thumbnails (current outlined in teal). Strip hidden under 600 px. Films play in
place with native controls kept clear of the strip.

## Video

| Part | Spec |
| --- | --- |
| Card | No play button; a mono "▶ 0:12" tag top left; muted preview loops on hover (loaded on first hover); posters on touch. Exception: `/studio` shows a still poster with play mark and length, no hover. |
| Cinema band `.cin` | Full-width navy-950 band; film up to 1100 px at 16:9 with native controls and poster; path title and "Place · Month Year · Film and N photos" under it in light text |
| Talk embed | Thumbnail with play mark; on press, `youtube-nocookie.com` iframe in place |

## Forms

Floating labels (Locked). Labels always present; hints under the field; errors in words under the
field in `--color-danger` with an icon; required fields marked in words. Checkboxes as rows with a
muted explanation ("Download · Save the full-size photos"). Dialog sheet for share options.

## Fact panel

Two-column definition list in a hairline card: label (muted, mono) and value. Empty rows are not
rendered.

## Edge cards

404, link-expired and "Open your photos" use a centred card (max ~560 px) with the edge art on top
(960 × 440) at 12 px radius, then role line, title, text and actions.
