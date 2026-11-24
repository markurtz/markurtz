# 33 · Page art and motion

Status: **Locked** by Mark on 2026-11-24, 2:02 PM CT (Build Six). This replaces the Layers
network art, the elastic web and its motion everywhere: page headers, home doors, cards, edge
pages and banners. Two points are **Open** (§ 8). Handoff source: `imagery/rebuild/final/`
in project files ([sources](../records/sources.md#imagery)); approved review page "Page Art
Build Six".

## 1. The idea

Everything on the site is drawn by one marker. "markurtz" sounds like "markers", and the
monogram is Mark's signature, so the page art is the same hand at work: **the monogram's teal
marker tip draws each page's subject live**, over a quiet field of rising teal lines, then the
subject does its job and settles. On page tops it then **stops**, locked in place. Link cards rest
as the finished still and play the draw once when hovered or focused.

Polished, professional and clean: no web, halo, glow or fade.

## 2. Parts of a picture

| Part | Rule |
| --- | --- |
| **Subject** | Mark's drawn J1 chisel-marker subjects, unchanged, at medium size (about half the frame height). Cards use the same treatment as headers. |
| **Field** | Quiet teal rising lines at about 7.5°, 50% strength. Rows have breaks with end dots and small 45° steps. |
| **Shared rows** | 70% of the rows are the exact same pattern in every picture, so all page art reads as one family. |
| **Motif rows** | Rows 1, 4 and 8 of every 10 carry the subject's **group motif** (table below). Always the same rows. |
| **Clear room** | Every row stops before the subject's outline and starts again after it, each with an end dot. |
| **Marker line** | One smooth line comes in from off the left edge, curves down into the subject's top-left corner, draws the subject, leaves from its bottom-right corner on a smooth curve and runs off the right edge. It stays attached to its corner while the subject moves. |

Group motifs, derived from the subject key (no content field needed):

| Group | Motif | Subjects |
| --- | --- | --- |
| Professional | Gantt bars | professional, software, research, speaking |
| Workshop | Ruler | workshop, builds, designs, code |
| Studio | Focus marks | studio |
| General | Dashes and dots | home, about, blog, 404, link-expired, clients-sign-in |

## 3. Colour

| Element | Dark theme | Light theme | Token |
| --- | --- | --- | --- |
| Field lines | #50AFAA | #387A77 | `--plate-line` |
| Marker line and tip | #7CCBC6 | #2F8C87 | `--mk` |
| Subject at rest | ink #EDEEF1 | ink #121B30 | `currentColor` |

**Teal means live** (**Open**, see § 8): the marker line is always teal; the subject is teal while
it is being drawn and while it works, then settles to ink.

Banners are fixed dark (navy `#0B1220`).

## 4. Draw order

- One pass in logical order with the fewest marker lifts. Pieces that touch continue from where the
  last ended; the tip lifts only between separate pieces.
- Small details ride along with the line beside them (the briefcase latch with the seam, knobs,
  feet, window buttons). Thin bars are drawn along both long edges at once (saw base, hourglass
  caps, dresser top).
- **The marker draws only the frame where the content has its own motion:**

| Subject | Marker draws | Then |
| --- | --- | --- |
| Software | The window | The cursor types the characters |
| Code | Only the connecting lines | The cursor types |
| Research | The axis | Points land, the trend line draws |
| Designs | The box | Bore and dimension appear once; nothing is removed |
| Link expired | Frame and glass | Sand falls and builds the lower pile |
| Home | The connecting lines | The monogram signs in with its own tip |
| 404 | 4, then 0, then 4 | |
| Builds | The dresser | Leaves from the bottom-right corner of the body |

## 5. Timing

Every picture runs exactly **6.0 s**. Page tops and edge pages play the first four phases once
and stop at the settled frame; the undraw and blank phases apply only where a picture repeats (cards):

| Phase | Length |
| --- | --- |
| Line in, subject, line out | At one even marker speed, **0.36 icon units per ms** (an icon unit is 1/100 of the subject's larger side), identical in every picture |
| Working motion | The time left, 0.9 to 2.6 s, capped per subject |
| Settle to ink | 0.25 s |
| Hold | Short, whatever remains. **On page tops the picture stops here for good.** |
| **Undraw** | 0.8 s: line in, then the subject in drawing order, then line out, each rubbed out along its own stroke, left to right. No fade, no wipe. |
| Blank | 0.3 s |

## 6. Working motions

Unchanged picks from 2026-11-23 (held internally as `PICK` in `art-motion.js`; not a user choice):

| Subject | Motion |
| --- | --- |
| Home | Quick sign (S): the monogram signs in with the teal tip |
| Professional | Off to work: the briefcase opens, shuts, lifts and swings on its handle |
| Software, Code | Typewriter: the cursor types `< / >` |
| Research | Scatter, then sweep |
| Speaking | Roll: one full wave per loop |
| Workshop | Dust only: the saw spins up, throws dust, coasts down |
| Builds | Drawers one by one |
| Designs | Bore cut and dimension |
| Studio | Focus and shutter |
| Blog | Page drifts under the writing pencil |
| About | Look around |
| 404 | The zero spins (rocks); the fours bounce |
| Link expired | Shake and fall; the sand pile grows |
| Client sign-in | Open, hold, shut |

## 7. Behaviour

- **ART-1** Page tops and edge pages **play once and stop** (Mark, 2026-11-24, replaces "loop while
  visible"). The marker draws the subject, it works, it settles in ink (white in dark mode), and the
  animation ends there: no undraw, no repeat, no further work. Playback starts when the art first
  comes into view and does not restart on scroll or tab return.
- **ART-1b** Page-top art sits in the **right column only**, beside the text, never full width and
  never behind the title, lede or buttons. The title, lede, meta and buttons fill the left column.
- **ART-2** Link cards with art (Home rows, blog strips, cover cards anywhere) **animate on hover,
  not scroll** (Mark, 2026-11-24, settles D16). At rest each card shows the finished still. On
  pointer hover or keyboard focus the marker draws the subject once from blank, it works and
  settles, then holds; leaving the card returns it to the still. Scrolling never moves card art.
  Touch screens show the still only.
- **ART-2b** Sub-page tiles on Professional and Workshop carry **no drawing** (Mark, 2026-11-24,
  pick D "Page top shows them"). Each tile is a hairline text card: icon, name, arrow, one-line
  description and count (for example "10 repositories"). Hovering or focusing a tile redraws the
  page-top art as that sub-page's subject (Software, Research, Speaking; Builds, Designs, Code),
  played once to its settled still; leaving the tile row draws the section's own subject back.
- **ART-3** Pictures rig lazily within 300 px of the viewport and pause off screen.
- **ART-4** `prefers-reduced-motion: reduce` and no JavaScript show the **finished still**: subject
  in ink, both lines drawn, no movement.
- **ART-5** Replay (hover) restarts the clock; never re-mount.

## 8. Open

| # | Point | Current behaviour |
| --- | --- | --- |
| O2 | "Teal means live" is the art thread's reading, shown in builds four to six without objection | As in § 3 |

## 9. Files and sizes

| Use | Size | File |
| --- | --- | --- |
| Page-header still | 1920 × 660, subject centre at 68% of the width, transparent | `heroes/<subject>.svg` (12: home, professional, software, research, speaking, workshop, builds, designs, code, studio, blog, about) |
| Card cover still | 640 × 384 (5:3), centred | `covers/<subject>.svg` (7: software, research, speaking, builds, designs, code, blog). One per subject; the old `-1/-2/-3` variants are retired. |
| Edge still | 960 × 440, centred | `edge/{404,link-expired,clients-sign-in}.svg` |
| Banner | 1200 × 630, navy filled, subject at 70%, **no text** | `banners/{default,professional,workshop,studio,blog}.svg` and `png/banners/*.png` |

Stills are the resting frame and use `currentColor` for the subject, so set `color` on the
container. Formats follow the SVG-first rule ([32](32-mark-icons.md#formats)); PNG only for banners.

## 10. Runtime and markup

| File | Role |
| --- | --- |
| `page-art.js` (~20 KB) | Draws and animates every picture (page tops once, cards on hover) (`PageArt.init(root)`, `PageArt.still(subject, aspect, x)`) |
| `page-art.css` (~1 KB) | Colours for both themes |
| `field2.js` (~10 KB) | Field generator (`Field2.build`) |
| `art-motion.js` (~91 KB) | Engine for each subject's working motion (`ArtMotion.rig`, `pose`); its web group is hidden by `page-art.css` |
| `subjects.js` (~165 KB) | The 15 drawn subjects; **split per page in production** so a page inlines only its own |

```html
<div class="page-art" data-page-art="software" data-page-art-mode="once"></div>  <!-- page top: plays once, stops -->
<div class="page-art" data-page-art="builds" data-page-art-mode="hover"
     data-page-art-aspect="1.6667"></div>                               <!-- card: draws on hover -->
<a class="tile" href="/professional/software/" data-page-art-target="software">…</a> <!-- tile: redraws the page top -->
```

- The element sizes itself from its `aspect-ratio`; the picture fills it with
  `preserveAspectRatio="xMidYMid slice"`, subject centred. In page headers the element is the
  right-hand grid cell of `.ph` (about 46% of the header width at 1024 px and up), not an absolutely
  positioned full-width layer; the text column holds the left side.
- `data-page-art-aspect`: `2` (headers and edge pages, default) or `1.6667` (cards).
- `data-page-art-mode`: `once` (page tops and edge pages, default), `hover` (link cards) or `loop`
  (review pages only; not used on the site). `scroll` is retired.
- `data-page-art-target` on a tile names the subject the page-top art redraws as on hover or focus.
- Do not use `data-art-motion` or call `ArtMotion.init` on these elements.

## Retired

The elastic web (mesh, anchors, `WEB_STROKE`, `restyle`), the art's own Layers network, loop
candidates as a user choice, page-top looping while visible (Build Six, reversed by Mark the same
day), full-width header art, card art that follows scroll, cover art on sub-page tiles, cover variants `-2/-3`, the scrim gradient in hero
SVGs, the left-side signal pulse, and the art round 7 requests of 2026-11-23 (superseded by the
rebuild).
