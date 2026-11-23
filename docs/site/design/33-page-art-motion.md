# 33 · Page art and motion

Status: subjects **Locked** 2026-11-21; art style A (marker subject over the network) **Locked**
2026-11-23; loops **Locked** 2026-11-23 (all picks made); the elastic web is **in progress**
(round 6 shipped in mock v50; round 7 requested 2026-11-23, below). Runtime source:
`site-mock/src/scripts/art-motion.js`, kept in sync with `imagery/motion/art-motion.js`.

## 1. What the art is

**"Layers"**: a quiet network of slate and teal strands and nodes, with one subject per page
resting on it like a weight on a web. The subject is drawn in the J1 hand (one chisel marker
stroke with dots at corners and ends; the monogram without dots). No centre marker.

| Use | Size | Where |
| --- | --- | --- |
| Page-header art | 1920 × 660 | `.ph-art`, right-aligned, faded on every edge, subject in ink |
| Card covers | 640 × 384 (three compositions per kind) | Professional and Workshop tiles, external posts |
| Edge art | 960 × 440 | 404, link-expired, "Open your photos" |
| Share banners | 1200 × 630 | og:image (PNG copies) |
| Home doors | Hero art cropped (`viewBox 900 10 1000 625`) | Home |

## 2. Subjects

| Page | Subject | Loop (picked) |
| --- | --- | --- |
| Home | the T4 monogram | Cards: **B** quick rewrite. Page top: **S**, signed in from empty by the teal marker tip, ending where the tip rests |
| Professional | briefcase | **A** off to work: opens, shuts, then lifts and swings on its handle. The lid moves as its own rectangle; the band line is duplicated so one stays with the base and one rises with the lid; web shows through the handle |
| Software | app window with code | **A** typewriter: `< / >` types in, then out, with a teal caret |
| Research | trade-off frontier | **B** scatter, then sweep: points land in any order; the line sweeps through and lights the frontier points |
| Speaking | waveform | **B** roll: one full wave per loop |
| Workshop | circular saw | **B** dust only: spins up, hums and throws dust, coasts to a stop |
| Builds | dresser | **A** one by one: drawers slide out in turn, then all close; the web stretches as they pull out |
| Designs | CAD part with a bore | **A** sketch and extrude: edges sketch in, the bore is cut, the dimension is added; the top face clears once the box closes |
| Code | brackets | **A** typewriter (as Software) |
| Studio | mirrorless camera | **B** focus and shutter: the lens focuses, the shutter presses and blinks in the lens |
| Blog | pencil writing a line | **A** page drifts: writes along the line as the page drifts, lifts in an arc back to the start |
| About | person | **C** look around: the head looks left and right, shoulders follow |
| 404 | the digits 404 | **B**: the zero rocks 45° each way and back; the fours bounce in turn |
| Link expired | hourglass | **A** shake and fall: shakes as the last grains fall; never flips |
| Client sign-in / Open your photos | lock | **B** open, hold, shut: unlocks, stays open, snaps shut |

`PICK` in `art-motion.js` holds these; `data-art-motion-loop` overrides per picture.

## 3. Motion rules

- **ART-1 Loops.** Every motion is a loop that starts and ends on the approved still.
- **ART-2 Page-top art** (`.ph-art`, edge art) plays **one cycle on load** (3.2 s), then rests.
- **ART-3 Everything else** advances its loop with scroll: 1400 px of scrolling per loop, backward
  when scrolling up, stopping where it is when scrolling stops.
- **ART-4 Strength** "Subtle" (k = 0.6), mode "Parts + signal": the subject's working part moves,
  and a colour ring runs through the network.
- **ART-5 Cost.** Only pictures on screen update; each frame changes only transforms and the
  strand paths. Target ≥ 50 fps on a mid-range laptop (the review page holds about 54).
- **ART-6 Reduced motion** shows the stills. No JavaScript shows the static SVG files.
- **ART-7 Markup.** `<div class="ph-art" data-art-motion="<subject>" data-art-motion-view="page">`
  with the hero inlined, or `<img src="…/covers/<kind>-2.svg" data-art-motion="<subject>">`, which
  the script swaps for inline SVG. Any CSS styling those images as `img` must include `svg`.

## 4. The elastic web (rounds 4 to 6)

At runtime the art's own network is hidden and replaced by one generated web:

- **One symmetric triangular mesh**, densest at the centre and opening toward the edges (an even
  lattice pulled in radially, `rho → rho · (0.42 + 0.58 rho)`), fading out toward the edges.
- **Pieces are weights.** Each subject part pulls the web toward it (Gaussian pull); strands catch
  on at points all along every line, so the web is **skinned to the piece**: it moves with the
  piece and stretches out to the still web further away. Pieces pull hard.
- **Elastic response.** Every change overshoots a little and settles (a damped kernel), the same
  mechanics on every picture; because the response is a function of loop phase, loops still meet
  their stills.
- **Enclosed space is clear.** Inside closed shapes (the saw blade and guard, camera body, lock
  shackle, pencil, app window, the 4s and the 0, CAD faces once closed) there is no web, checked
  where the piece is now and at rest. Line drawings keep web through them (monogram, research,
  code). Shapes that close a space but are not solid keep web (the briefcase handle).
- **In-place spins don't drag the web** (saw blade, lens rings, the key).
- **Colour** comes from two sources (round 6): a smooth **ring** that runs in from the outside each
  loop and settles into the **resting gradient** (more colour and density in the middle, lighter at
  the edges), plus **stress**: strands colour in where they are stretched by a piece or still
  moving after a piece arrives or moves.
- Static art files (no JavaScript) still show the original generated network.

## Open: art round 7

Requested by Mark on 2026-11-23 (in the mock thread, which owns the work). Requirements, in his
words where possible:

| # | Requirement |
| --- | --- |
| R7-1 | **Edge to edge.** The network takes up the full surrounding image, edge to edge, so the lines pull from the edges and stay anchored there, and the strands **fade fully out by the time they reach the edge**. |
| R7-2 | **One base network.** Every image shares the same base network underneath, so they are uniform, but it stretches, shapes and colours differently based on the content within it at any moment. |
| R7-3 | **Marker or pencil strokes.** Generate a few options with network strokes drawn like a marker or pencil, to iterate toward a better match with the site's theme. |
| R7-4 | **Lock**: the shackle (top curved bar) is not filled in as an object; the network should surround that piece completely. |
| R7-5 | **No vanishing strands.** Software app window: pieces of the web disappear at the top, as if a strand vanishes when its vertex is covered. Once an object is stuck into the network, those vertices are **fixed to the object**; strands must not disappear. |
| R7-6 | **Saw**: same disappearing edges. And as the saw vibrates, the surrounding connection points move with it. |
| R7-7 | **Camera**: same disappearing edges outside the main body. |
| R7-8 | **Pencil**: keeps its connections (same disappearing problem), but the network is nowhere near edge to edge and centres only on the pencil. |

When round 7 lands, update § 4 and the decision log.

## 5. Generating the art

`imagery/final/gen-art.mjs` runs the Layers generator (`round-5/network-icons.html`) in Chromium
and writes `out/`: `mark/`, `heroes/<page>.svg`, `covers/<kind>-<1..3>.svg`, `edge/`,
`banners/`, and PNG copies in `png/`. `art-joints.mjs` applies the J1 subject stroke (option A).
In the production repo this becomes `pnpm art`, writing to `public/art/`.
