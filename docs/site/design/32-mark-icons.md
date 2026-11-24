# 32 · Mark and icons

Status: **Locked**. Monogram T4 on 2026-11-22 (9:57 PM ET); icon style J1 on 2026-11-23
(5:41 AM ET). Source of the art and icons: `imagery/final/` in project files
([sources](../records/sources.md#imagery)). Review board linked there.

## 1. One hand

The monogram, the icons and the page-art subjects are drawn the same way: **one chisel marker
stroke**, leaning, like a signature. Icons and art subjects add small ink dots at every corner and
line end; the monogram does not. The teal marker tip belongs to the monogram alone.

## 2. Monogram (T4)

- One continuous marker stroke reading as both a cursive **M** and a **K**: the first strokes make
  the M, the stem is the base of the K, and the K's arm turns sharply into the leg just short of the
  stem.
- **No loops**, no triangle in the K (Mark: it read as a bug), no second letterform, no connector
  pieces. Rejected: two-letter marks, extra loops, split and connector versions.
- A **teal marker tip** rests at the end of the stroke.
- On a navy tile for the app icon and lockup; plain (`currentColor`) where a tile does not fit.
- No joint dots on the monogram, in any use (static or animated).
- In page art the same teal tip draws every subject; on the home hero the monogram signs itself in ([33](33-page-art-motion.md)).

Generator: `mk-study.mjs` (`MK_FINAL = "t4"`, `mkBody()`), read by `gen-art.mjs`.

## 3. Wordmark and lockup

"markurtz" in Inter with the **k in teal**, beside the monogram tile. Small lockup in the footer
base row.

## 4. Icons (J1)

- **49 custom glyphs** on a 24 px grid, plus the GitHub and LinkedIn brand marks (the only
  third-party marks):

  `arrow-right arrow-left arrow-up-right chevron-right chevron-down menu x check plus search filter
  grid copy download link printer sun moon monitor briefcase hammer try-square bench nozzle camera
  image film play layers box code terminal file book graduation mic pen quote rss user mail message
  at heart lock pin calendar clock star`

- Each glyph is one chisel marker stroke in a **single colour** (`currentColor`), **leaning 10°**
  (`SLANT_DEG`), with ink dots (`circle.n`) at every corner and line end.
- No teal and no second colour, so an icon reads the same on any background, including teal
  buttons. The old "on-fill" rules (hiding dots, heavier line) are retired.
- Detail grows with size: `sm` for ≤ 20 px, `md` for 21–28 px, `lg` above 28 px (nib widths
  `MARKER_NIB`). CSS sets the rendered size.
- Markup: `<svg class="icon">` with `<g class="icon-lines">` (offset thin copies of the path,
  `stroke="currentColor"`) and `<g class="icon-dots">`. `.icon { overflow: visible }` so slanted
  glyphs are not clipped.
- Accessibility: decorative icons `aria-hidden="true"`; an icon-only button carries its name on the
  button (`aria-label`) and a tooltip.
- Section aliases (`ALIASES`): professional → briefcase, workshop → try-square, studio → camera,
  software → layers, research → file, speaking → mic, builds → bench, designs → nozzle, blog → pen,
  about → user, contact → mail, clients → lock, external → arrow-up-right, place → pin,
  date → calendar, pinned → star, theme → sun, photo → image, video → film.
- One helper serves the site: `icon(name, label = "", size = "sm")` → `<Icon>` in React.
- `lint.mjs` checks glyph bounds and spacing; run it after any glyph change.

History, for context only: graph-solid → dots with teal lines (2026-11-21) → theme D slant
(2026-11-22) → J1 marker (2026-11-23).

## 5. Favicons and app icons

| File | Use |
| --- | --- |
| `favicon.svg` | `<link rel="icon" type="image/svg+xml">` |
| `favicon.ico` (16, 32, 48) | Fallback `<link rel="icon" sizes="any">` |
| `mark.svg` | Lockup tile; manifest `any` icon |
| `mark-plain.svg` | No tile, `currentColor` |
| `app-icon.svg`, `app-icon-maskable.svg` | Manifest icons |
| `png/mark/apple-touch-icon.png` (180) | iOS home screen |
| `png/mark/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Manifest PNG fallbacks |
| `site.webmanifest` | name "Mark Kurtz", short name "markurtz", background #0B1220, theme #121B30 |

## Formats

Mark's rule (2026-11-21): **SVG first** wherever it works, plus `favicon.ico`. PNG copies exist
only where SVG is not read: apple-touch-icon (180), manifest fallbacks (192, 512, maskable 512),
and `og:image` / `twitter:image` banners (1200 × 630). No JPEG or WebP for icons or art. Page
heroes, covers and edge art are SVG only.

## 6. Share banners

1200 × 630 (`banners/{default,professional,workshop,studio,blog}.svg`, PNG copies in
`png/banners/`): Build Six art only, navy filled, subject at 70%, **no text**. A wordmark or copy
can be added later if wanted.
Used as `og:image` for pages without their own image.
