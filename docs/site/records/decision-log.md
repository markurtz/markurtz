# Decision log

Every locked decision, newest first. Times are US Eastern. "Mock vN" is the mock version that
first showed it. Add new decisions at the top, then update the document they touch.

## 2026-11-24

| Decision | Detail | Docs |
| --- | --- | --- |
| **Jump links replace the year timeline** (3:20 PM CT) | The clickable year timeline above card lists (full-width line with dots) is retired on all 11 pages that had it. In its place: a quiet row of small mono "Jump to" year links (days on trip pages) beside the count, the year in view in ink with a teal underline. Rail years stay pinned while their cards scroll by, from 900 px up. The year menu stays a filter. Review https://claude.ai/artifact/LjPpy5PxtQo1m1V2svENWu | [31](../design/31-components.md#jump-links-jump), [03](../product/03-page-specs.md) |
| **Card art on hover; tiles without art** (settles D16) | Link cards on Home and everywhere else animate on hover or focus, not on scroll; at rest they show the still. Professional and Workshop sub-page tiles are hairline text cards (icon, name, arrow, one-line description, count) with no drawing; hovering one redraws the page-top art as that page. Same on both hubs; counts kept | [33 § 7](../design/33-page-art-motion.md#7-behaviour), [31](../design/31-components.md), [03](../product/03-page-specs.md) |
| **Page-top art plays once, on the right** | Page-top art plays through once and stops as soon as the subject locks in place in ink (white in dark mode); no undraw or loop. The art sits in the right column, with the title and buttons filling the left; never full width. Replaces "page tops loop while visible" from Build Six | [33 § 7](../design/33-page-art-motion.md#7-behaviour), [03](../product/03-page-specs.md#page-header-pg-1), [31](../design/31-components.md) |
| **Page art rebuilt: Build Six** (2:02 PM CT) | Replaces Layers art, the elastic web and its motion. The monogram's teal marker draws each J1 subject live over a field of rising teal lines (70% shared rows, motif rows 1/4/8 of 10 by group, rows stop at the subject outline); one marker line in from the left, out to the right; fewest lifts; marker draws only the frame where content has its own motion; every picture loops in 6.0 s at one marker speed (0.36 icon units/ms); undraw along each stroke, no fade; page tops loop while visible (superseded later the same day: play once); reduced motion shows the finished still; one cover per subject; banners without text. Open: cards follow scroll, teal-means-live. Supersedes the art round 7 requests | [33](../design/33-page-art-motion.md) |

## 2026-11-23

| Decision | Detail | Docs |
| --- | --- | --- |
| Photo viewer gets all three buttons | Copy link, Embed and More in the single photo/video viewer, not just Copy link and Close | [04 § 6](../product/04-clients-sharing-embeds.md#6-the-three-buttons-on-every-photo-and-film) |
| Art round 7 requested (superseded 2026-11-24 by Build Six) | Edge-to-edge web anchored at the edges and fading out by them; one shared base network; marker or pencil stroke options; per-subject fixes (lock, app window, saw, camera, pencil) | [33](../design/33-page-art-motion.md#retired) |
| Embed and More buttons (mock v51) | Every photo and film: Copy link, Embed (iframe of `/embed/…`), More (Share…, Open its page / Download, Copy credit line / Make a link with options) | [04](../product/04-clients-sharing-embeds.md) |
| Web round 6 (mock v50) (superseded 2026-11-24 by Build Six) | Colour = resting gradient + inward ring + stress; 404 zero rocks ±45°; briefcase lid as its own rectangle, web through the handle; designs top face clears when the box closes; drawers stretch the web | [33](../design/33-page-art-motion.md) |
| Web round 5 (mock v49) (superseded 2026-11-24 by Build Six) | Densest at the centre; web skinned to pieces; stronger pull; no web inside closed shapes | [33](../design/33-page-art-motion.md) |
| **Clients: link only, no sign-in** (mock v48) | Every link = `/clients/#<JWT>` or `/s/<id>#<JWT>`; JWT kept in a cookie and sent in the Authorization header; no link/code distinction; three permissions per link (Download, Share single photos, Make new shares), never more than the source, turning off cascades; copy-link button on every photo and film; per-item Studio pages with og crops; path id so preview bots can unfurl; "Show a preview" per share; `/s/` allowed in robots (noindex) | [04](../product/04-clients-sharing-embeds.md), [21](../engineering/21-access-security.md) |
| Role lines | Every page's line leads with Researcher, Engineer or Creator, then two role nouns | [03](../product/03-page-specs.md#page-header-pg-1) |
| Parent link option B (mock v44) | Path title "Professional / Software", also on Studio work tops; no separate breadcrumb | [03](../product/03-page-specs.md) |
| Professional page title | "Professional" | [03](../product/03-page-specs.md#professional) |
| All art loops picked (mock v41) | Picks per subject; home page top signed in by the marker tip | [33](../design/33-page-art-motion.md#6-working-motions) |
| Art motion = loops (mock v39) (superseded 2026-11-24 by Build Six) | Every motion loops from and to the still; page-top plays once on load; other art loops with scroll | [33](../design/33-page-art-motion.md#7-behaviour) |
| Page art option A (5:49 AM) (superseded 2026-11-24 by Build Six) | Subject in the J1 marker stroke with dots over the unchanged network | [33](../design/33-page-art-motion.md) |
| Icons J1 (5:41 AM) | One-colour chisel marker stroke, 10° lean, ink dots at corners and ends, no teal | [32](../design/32-mark-icons.md#4-icons-j1) |
| Header without Get in touch (mock v36) | Contact via footer and page-header primary buttons | [02](../product/02-information-architecture.md#2-navigation) |

## 2026-11-22

| Decision | Detail | Docs |
| --- | --- | --- |
| Monogram T4 (9:57 PM) | One marker stroke, cursive M into K, arm turns sharply into the leg short of the stem, no loops, teal tip | [32](../design/32-mark-icons.md#2-monogram-t4) |
| Client gallery (mock v26–v28) | Select instead of hearts; per-photo share; five-facet multi-select filters in `?f=`; timeline rail; delivery batches with New badges; inline confirm on Turn off; jump bars | [04](../product/04-clients-sharing-embeds.md) |
| Section header buttons (mock v23) | Work with me / Download résumé; Build with me / See my tools; Shoot with me / See my kit; Write with me / Subscribe | [02](../product/02-information-architecture.md#2-navigation) |
| About, Uses, Colophon, Privacy, footer final | Copy per page review | [03](../product/03-page-specs.md#about-and-footer-pages) |
| Blog final | External posts only at launch; section filters reveal sub-labels; post template kept | [03](../product/03-page-specs.md#blog) |
| Studio final | Place filters, Favorites, "What I shoot with", work pages with facts and moment, More from Studio | [03](../product/03-page-specs.md#studio) |
| Professional final | Four pages; Software as a year timeline with Not public cards; Cite button; launch waits on every [confirm] | [03](../product/03-page-specs.md#professional) |
| Workshop final | Hub with tiles, featured and In progress; three list pages; project pages with build log and fact panel | [03](../product/03-page-specs.md#workshop) |
| Home final (rounds 2–3) | One home card in rows of four; no hero buttons; tinted bands; transparent header over the hero | [03](../product/03-page-specs.md#home) |
| Page header (mock v10) | Banner type stack on the page background, no box; art right, faded | [03](../product/03-page-specs.md#page-header-pg-1) |
| Scroll motion approved (superseded 2026-11-24 by Build Six) | "Parts + signal" at Subtle | [33](../design/33-page-art-motion.md) |

## 2026-11-21

| Decision | Detail | Docs |
| --- | --- | --- |
| Home final (9:47 PM) | Theme "Take it apart. Make it better."; six made-things sections | [03](../product/03-page-specs.md#home) |
| Imagery set approved (superseded 2026-11-24 by Build Six) | Layers art, subjects per page, SVG-first format rule | [32](../design/32-mark-icons.md), [33](../design/33-page-art-motion.md) |
| Self-hosted films | MP4 + poster + preview clip; hover preview on cards; cinema band | [34](../design/34-photo-video.md) |
| Shared components final (5:10 PM) | Underline header, segmented toolbar, pinned band + year rail, card set, mosaic, short-split featured, side-by-side footer, filmstrip viewer | [31](../design/31-components.md) |
| Site structure: all 34 picks locked (11:45 AM) | See the P-table below | [02](../product/02-information-architecture.md) |
| Menu and names | Professional, Workshop, Studio, Blog, About; Workshop = Builds/Designs/Code; Speaking; no Now; no redirects | [02](../product/02-information-architecture.md) |

### Structure picks (P1.1 to P6.5)

| ID | Choice | Pick |
| --- | --- | --- |
| P1.1 | Year addresses | `?year=2025` filter |
| P1.2 | Card sizes | Compact, Standard, Featured |
| P1.3 | In-progress items | Badges on cards |
| P1.4 | Labels | Labels, topics and tags all filter through the query string; no pages |
| P1.5 | Filters in the address | Query parameters |
| P2.1 | Experience layout | Résumé order, work linked under each role |
| P2.2 | How a role finds its work | Each item names its role |
| P2.3 | Software cards | Repo cards with live stats |
| P2.4 | Research cards | Feed entries |
| P2.5 | Speaking layout | Thumbnail grid in tiers |
| P2.6 | Single-item addresses | An anchor per item |
| P3.1 | Workshop pages | Builds, Designs, Code |
| P3.2 | A Workshop project | A page per project |
| P3.3 | Studio work addresses | Name and year |
| P3.4 | Studio filters | Photo, Video, Travel, Creative (later replaced by place filters, 2026-11-22) |
| P4.1 | Posts on other sites | Same card, source badge, opens the original |
| P4.2 | Blog strip | Featured first, else latest |
| P4.3 | About with contact | Bio, profiles, then the form (later: form is a popup) |
| P4.4 | Unlisted pages | Allowed |
| P4.5 | Where social bios point | Every bio to the home page |
| P4.6 | Feeds | Full set |
| P5.1 | Collection addresses | Short random ids |
| P5.2 | How someone signs in | Access code only (superseded 2026-11-23: link only) |
| P5.3 | How a code travels | A link that fills it in (superseded: the link is the key) |
| P5.4 | Who can share | Holders Mark allows, plus public share links for collections and single items |
| P5.5 | Kinds of hosted work | Photos, video and files |
| P5.6 | Downloads | Set per collection (now per link) |
| P5.7 | How long access lasts | Never expires unless turned off |
| P5.8 | Enquiries on the sign-in page | A link to contact |
| P6.1 | Content folders | Mirror the site |
| P6.2 | Repeated records | One YAML list per kind |
| P6.3 | Posts, projects and works | A folder per item |
| P6.4 | Private material | Never in the repo |
| P6.5 | Large media | Outside git, uploaded with the CLI |

## 2026-11-20

| Decision | Detail | Docs |
| --- | --- | --- |
| Brand system 1.0 (all 68 choices) | Exploration idea; teal/navy/slate from the lecture deck; Inter Display, Source Serif 4, Geist Mono; 18 px fluid scale; 68 ch; 12/8/4 columns; 4 px spacing; 8 px radius; hairlines; justified untouched photos; CC BY-NC public photos; floating labels; first person | [30](../design/30-design-system.md) |
| Implementation plan (PR #1) | Next.js 16 on Vercel, Velite, Supabase + Drizzle, R2, CLI media pipeline, POSSE syndication | [20](../engineering/20-system-architecture.md) |
| Repo standards (PR #2) | From Mark's template-apache2.0; ESLint + Prettier; Node 24; supply-chain settings | [24](../engineering/24-build-test-deploy.md) |
