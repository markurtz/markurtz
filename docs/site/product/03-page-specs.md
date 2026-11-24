# 03 · Page specifications

Status: **Locked** (all page content finalised 2026-11-21 to 2026-11-22; header and role lines
revised 2026-11-23). Copy in quotes is final unless marked **Held**. The exact copy and the review
history for each page are in [records/page-content/](../records/page-content/); the mock (v51+)
is the rendered reference.

Contents: [Shared parts](#shared-parts) · [Home](#home) · [Professional](#professional) ·
[Workshop](#workshop) · [Studio](#studio) · [Blog](#blog) · [About and footer pages](#about-and-footer-pages) ·
[Edge pages](#edge-pages) · [Clients](#clients) · [Machine files](#machine-files)

---

## Shared parts

### Page header (PG-1)

Every inner page opens with the banner-style header, on the page background with **no box,
outline or panel** (Locked 2026-11-22). Text is left-aligned with the site header's lockup.

Top to bottom:

1. **Role line** in Geist Mono: three words separated by " · ". The first word is the home line's
   best fit (Researcher, Engineer or Creator), then two role nouns (Locked 2026-11-23, table below).
2. **Title** in Inter 800, about 2.1 to 3.6 rem. On sub-pages the title is a **path title**:
   "Professional / Software", where "Professional" links up and the slash is muted (option B,
   Locked 2026-11-23). Studio work and photo pages use it too ("Studio / Iceland / Photo 2 of 3").
3. **Lede**: one muted Inter sentence.
4. **Meta** (optional): smaller muted line, e.g. "date · Mark Kurtz · 6 min read".
5. **Actions** (optional): the page's button pair.
6. **Art**: the page's marker-drawn art ([33](../design/33-page-art-motion.md)), in the right column only, on the
   page background, beside the text: the title, lede and buttons fill the left side, and the art is
   never full width or behind them. On tablets and phones it becomes a band above the text.
   The teal marker draws the subject live once; the animation stops as soon as the subject locks in
   place in ink (white in dark mode). It does not loop.

Pages with their own tops: the home hero, Studio work pages with a film (cinema band), 404,
link-expired, and the client "Open your photos" card.

Role lines (Locked 2026-11-23):

| Page | Role line |
| --- | --- |
| Home | Researcher · Engineer · Creator |
| Professional | Researcher · Engineer · Speaker |
| Software | Engineer · Builder · Maintainer |
| Research | Researcher · Author · Inventor |
| Speaking | Researcher · Speaker · Teacher |
| Workshop | Creator · Woodworker · Maker |
| Builds (and build projects) | Creator · Woodworker · Builder |
| Designs (and design projects) | Creator · Designer · Modeler |
| Code (and code projects) | Engineer · Programmer · Toolmaker |
| Studio | Creator · Photographer · Filmmaker |
| Studio work | Creator · Traveler · Photographer (or Filmmaker when it has a film) |
| Blog | Creator · Writer · Storyteller |
| About | Engineer · Woodworker · Photographer |
| Uses | Creator · Tools · Gear |
| Colophon | Engineer · Type · Build |
| Privacy | Engineer · Logs · Counts |
| 404 | Engineer · Missing · Moved |
| Link expired | Engineer · Expired · Revoked |
| Clients | Creator · Clients · Private |
| Client gallery | Creator · Private · Shareable |
| Share page | Creator · Shared · Photos |

### The shared list template (PG-2)

Software, Research, Speaking, Builds, Designs, Code, Studio and Blog are one component that
adapts its cards to the genre.

| Part | Behaviour |
| --- | --- |
| **Pinned band** | Directly under the page header, then 24 px of space before the toolbar. Soft teal-tinted band, label with a star ("Pinned"; "Featured" on Speaking; "Favorites" on Studio). Always the **small icon card**: icon tile or 64 px thumb, eyebrow, two-line title, no image on Professional and Workshop. Every pinned item also appears at full size in the timeline. |
| **Toolbar** | One segmented switch with a count per option in mono ("All 10 · Active 6 …"), then search (about 260 px) and the year menu on the same row; they wrap under it on narrow screens. Then a count line ("N posts"), except on Studio. |
| **Jump bar** | Above every timeline with three or more stops: a hairline track with teal dots sized by item count and mono labels; the stop in view is highlighted; stops filtered away fade; phones show end labels and the current one only. |
| **Year rail** | Every item newest first. Each year is a large muted numeral in a 96 px left rail beside that year's cards, no year headings. On phones the year stacks above its cards. Year groups carry `id="y-YYYY"`. |
| **In progress** | An "In progress" or "Coming soon" badge on the card, in the timeline and in the pinned band. No separate page. |
| **Cards** | Per genre: repo card (Software), research entry (Research), talk card (Speaking), framed photo card (Workshop, Blog), title-on-photo card (Studio). Sizes per item: compact, standard, featured ([31](../design/31-components.md#cards)). |
| **Empty result** | "No posts match that. Try a different search, or clear all filters." (wording per page) with a Clear filters button. |
| **Blog strip** | "Written between projects" with "See all posts", using Home's card, four across, posts from this page's section first. Studio uses "What I shoot with" instead. |

### Home card (PG-3)

One card for every home row and every blog strip: framed, 16:9 media, a small pill top-left of the
media for type cues (language, Paper/Patent, In progress, Film, source ↗), an eyebrow (one line,
ellipsis) and a title clamped to two lines (always reserving two). No description. Four across
from 960 px, two from 640 px, one below.

### Contact popup (PG-4)

Opened by the footer's Get in touch, by every section header's primary button, and by `#contact`.

- Title "Say hi". Intro: "Whether it's a project, a talk or a question about a build, I'd like to
  hear about it. I reply to every message **[Held: reply timing, or drop it]**."
- Fields: Name, Email, Message (floating labels), a hidden trap field, a privacy-friendly challenge.
- Button "Send message". Note: "Protected by a privacy-friendly spam check. No tracking."
- Success replaces the form with a thank-you line; errors are in words next to the field.
- No list of reasons to write, no offer of commissions or shoots.

### Footer (PG-5)

- Left: "Want to build something together?" and a small primary **Get in touch**.
- Right: Uses · Colophon · Privacy · Clients, then profile icon buttons with accessible names and
  tooltips: GitHub, LinkedIn, Google Scholar, X, Instagram, Reddit, Medium, alphaXiv, RSS.
- Base row: small lockup; "© 2026 Mark Kurtz · Photos CC BY-NC · Code on GitHub".

---

## Home

`/` · Locked 2026-11-22 (mock v15, rounds 1 to 3). Theme "Take it apart. Make it better."

| # | Section | Content |
| --- | --- | --- |
| 1 | Hero | Role line "Researcher · Engineer · Creator"; title **Mark Kurtz**; intro "Efficient AI at Red Hat. Former CTO of Neural Magic, acquired by Red Hat. Published researcher and open-source creator. Woodworker, photographer and tinkerer on the side."; headshot, no caption; **no buttons**. The header is transparent over the hero gradient until scroll. Hero art: the T4 monogram, signed in by the teal marker tip on load. |
| 2 | Stats | 9.2k GitHub stars · 10 papers, cited 811 times · 6 patent filings · 28 recorded talks. Stars summed across repos Mark created, fetched at build; the rest from content (**Held**: confirm counts). |
| 3 | Doors | Heading "Take it apart. Make it better." Intro "Same curiosity, different materials: code and math, wood and circuits, light." Three doors with art: **Professional** "Code and math: understanding how AI works, then building faster models, new techniques and useful software." **Workshop** "Wood, filament and circuits: furniture, printed parts and electronics for around the house." **Studio** "Light: photos and films of places and moments, from the Antarctic Peninsula to Black Rock City." Link word "Explore". |
| 4 | Built in the open | Intro "Open-source projects I've created, from research libraries to everyday developer tools." llm-compressor, guidellm, speculators, rustarium (eyebrow owner · role). "See all software". Tinted band. |
| 5 | Shared on stage | GenAI at Scale; Lossless LLM inference acceleration with Speculators; State of LLM Compression from Research to Production; Neural Magic keynote at Cerebras AI Day (eyebrow tier · year). "See all talks". |
| 6 | Published and patented | Microscaling FP4 (ICLR 2026); "Give Me BF16 or Give Me Death"? (ACL 2025); Inducing and Exploiting Activation Sparsity (ICML 2020); US 11,797,855 (eyebrow venue, citations when known). "See all research". Tinted band. |
| 7 | Made in the workshop | New furniture series; Parametric storage bin (**Held**: invented, swap for a real item); Pet shelf; Entryway bench (eyebrow sub-section · year). "See all projects". |
| 8 | Captured on the road | Antarctica; Burning Man; Iceland to Greenland eclipse cruise; Egypt and Jordan (eyebrow place · year; Film pill; preview plays on hover). "See all studio work". Tinted band. |
| 9 | Written between projects | Four newest posts (external at launch): Speculators; Fly Eagle(3) fly; The hidden cost of large language models; GuideLLM (eyebrow section · month year; source pill). "See all posts". |
| 10 | Footer invitation | Site-wide. |

Order follows the doors and alternates text-heavy and image-heavy rows.

---

## Professional

Locked 2026-11-22 (five rounds). **Held** items are listed as "[confirm]" in content; launch waits
on every one.

### `/professional/` (PG-10)

- Role line "Researcher · Engineer · Speaker"; title **Professional**; lede "AI research,
  open-source software and talks. Red Hat today; formerly CTO of Neural Magic." Buttons **Work with
  me** (primary, opens contact) and **Download résumé** (prints the page).
- Tiles (hairline text cards, no art: icon, name, arrow, one-line description, count; hovering one
  redraws the page-top art as that page, [33 § 7](../design/33-page-art-motion.md#7-behaviour)): Software "Built in the open where I can." · 10 repositories; Research
  "Published and patented: ICML, ACL, ICLR and more." · 10 papers · 6 patent filings; Speaking
  "Shared on stage: keynotes, talks and webinars." · 28 recordings.
- **Experience**: role cards on the year rail (by start year): organisation, years, titles with
  dates, bullets, and up to six "Built here" icon cards. Red Hat (2025–now), Neural Magic
  (2019–2025, three titles), then Burst, Aisle411, Answers.com, Mueller Prost (titles, dates and one
  line each **Held**). "All from <org>" links to `?role=<org>` on the lists.
- **Education**: degrees and years only. WashU MS Robotics Engineering and BS Mechanical
  Engineering; Fontbonne BS Applied Mathematics (years **Held**).
- Blog strip. Meta description: "AI researcher, open-source engineer and speaker. Efficient AI at
  Red Hat; former CTO of Neural Magic."
- Print: hides header art, navigation, footer, buttons and blog strip; one column; links printed
  as text.

### `/professional/software/` (PG-11)

- Path title "Professional / Software"; lede "Built in the open where I can. Free to use."
- Pinned: llm-compressor, guidellm, speculators.
- Filters: All · Active · Research libraries · Developer tools · Archived · Not public, plus search
  and year.
- Year rail of full repo cards by each repo's start year. Card: owner/name, tagline, role,
  language, stars, latest release, status (Active or Archived). Taglines (Locked, set B):
  llm-compressor "Smaller models, same answers." · guidellm "Know your load before you buy the
  hardware." · speculators "Faster generation, same outputs." · agens "Agents get scheduling,
  memory and tools." · rustarium "Run Python and WASM safely from Rust." · git-versioned "Let Git
  set your version." · disdantic "Pydantic models that know their subclasses." · sparseml "Where
  LLM Compressor started." · deepsparse "GPU speed on the CPU you have." · sparsify "Sparsity
  without the code."
- **Not public** work sits in its own year as a repo-style card with a lock icon and a "Not
  public" badge, no GitHub link (entries **Held**).
- Stars and release fetched at build time from the GitHub API; the build keeps the last good
  value if the API fails.

### `/professional/research/` (PG-12)

- Lede "Published and patented: ICML, ACL, ICLR and more."
- Pinned: Microscaling FP4 (ICLR 2026); Give Me BF16 or Give Me Death (ACL 2025); Inducing and
  Exploiting Activation Sparsity (ICML 2020).
- Filters: All · Conference papers · Preprints · Patents.
- Compact entries in the year rail: top line kind badge, venue and citations, with a small **Cite**
  button (papers only) that copies a formatted citation; linked title; authors with **M. Kurtz** in
  bold. No result line, no link chips.

### `/professional/speaking/` (PG-13)

- Lede "Shared on stage: keynotes, talks and webinars."
- Pinned, labelled **Featured**: the three home talks.
- Filters: All · Talks · Lectures · Webinars · Podcasts.
- Three-across thumbnail cards in the year rail: thumbnail, eyebrow kind · year, title, venue.
  Playing a talk swaps the thumbnail for a `youtube-nocookie.com` embed on click.

---

## Workshop

Locked 2026-11-22 (two rounds).

### `/workshop/` (PG-20)

Its own layout, not the list template.

1. Header: role line "Creator · Woodworker · Maker"; title **Workshop**; lede "Furniture, printed
   parts and the code behind them. Built on weekends, mostly by hand." (**Held**: confirm). Buttons
   **Build with me**, **See my tools**.
2. Tiles, the same hairline text cards as Professional with no art (hover redraws the page top as
   that page; name, colon, what's there, count): Builds "Built by hand: beds, tables, benches and the
   odd flaming rig." · Designs "Drawn to share: the plans behind the builds." · Code "Written for the
   shop: software for making things."
3. Featured: the entertainment center (short split featured card).
4. In progress: small cards, no images (New furniture series, MAV Grid, first real designs). No
   "see all".
5. Blog strip, Workshop posts first.

### `/workshop/builds/` (PG-21)

Lede "If I can't buy it, I build it." Pinned: entertainment center, dining room table, entryway
bench. Filters: All · Has video · Has plans · In progress. Year rail of framed photo cards with
one line each (years and lines other than the entertainment center **Held**).

### `/workshop/designs/` (PG-22)

Lede "Plans to make, change and make better." Coming-soon cards for real designs only (the mock's
two are **Held** placeholders). Filters: All · Plans · 3D models.

### `/workshop/code/` (PG-23)

Lede "Software for the shop, in the open." One card: MAV Grid, "Every storage system invents its
own grid. MAV Grid is one open grid for all of them." (**Held**: what MAV stands for, scope, link).

### Project page `/workshop/<page>/<project>/` (PG-24)

- Path title "Builds / Entryway bench"; lede; meta.
- **The build**: steps with photos, only where a real log or video exists. Otherwise only the lede.
- Fact panel: Category, Year, Status, Materials, Time, Tools, Dimensions, Cost. Empty rows hidden.
- Downloads (designs) or repository link (code); external links such as "Watch the time-lapse on
  Reddit" for the entertainment center.
- "More from the workshop": three small cards and "See all builds" (or the project's sub-page).

---

## Studio

Locked 2026-11-22; per-photo pages and share buttons added 2026-11-23.

### `/studio/` (PG-30)

- Role line "Creator · Photographer · Filmmaker"; title **Studio**; lede "Photo and video from the
  places I've been lucky enough to reach, from the Antarctic Peninsula to Black Rock City."
  Buttons **Shoot with me** (Open: wording), **See my kit**.
- Pinned **Favorites**: three works (**Held**: Mark's three).
- Filters by place: All · Polar · Europe · Americas · Africa and Middle East, with counts; search
  "Search places"; year menu; no count line.
- Year rail of title-on-photo cards, two across (large grid). Line over the title: region and month,
  "Nevada · August 2026" (months **Held**). Works with three or more photos show a mosaic. Films
  show as a still poster with the play mark and length; **no hover preview on this list**.
- Foot: **What I shoot with**, a line naming camera and lenses, "See my kit" to `/uses/` (kit
  **Held**). This replaces the blog strip.

### Work page `/studio/<work>/` (PG-31)

1. Top: a film work opens with the **cinema band** (navy, up to 1100 px wide at 16:9, native
   controls, poster), with the path title and meta under the film inside the band. A photo work
   uses the page header with its first photo.
2. Meta: Place · Month Year · "Film and N photos" ("Film and" only when there is a film).
3. Lede, plain facts: "N days in <place>, <dates>." (**Held** per work).
4. One first-person moment opens the story (**Held**; the mock's scene sentences are invented and go).
5. Facts panel: Where · When · Camera · Lenses · Edited in. Empty rows hidden.
6. Photos: justified rows on the **day-by-day timeline rail** built from capture dates (the same
   component as the client gallery), with short story paragraphs between rows when written.
7. Every photo and film carries **Copy link · Embed · More** ([04](04-clients-sharing-embeds.md#studio-photos-and-films)).
8. Licence line: "Photos and the film on this page are licensed CC BY-NC."
9. **More from Studio**: three small cards, newest first, "See all studio work". No previous/next.

### Single photo and film pages `/studio/<work>/<n>/`, `/studio/<work>/film/` (PG-32)

- Path title "Studio / <Work> / Photo 2 of 6" (or "Film").
- The photo or film large, with the three buttons, caption "<Photo n> · See all of <Work> ·
  CC BY-NC", and previous/next links within the work.
- `og:image` is that photo cropped to 1200 × 630 (the film's poster for films).

### Embed page `/embed/studio/<work>/<n | film>/` (PG-33)

A bare page: just the photo or film, filling the frame, and a credit line "<Title> · Mark Kurtz ↗"
linking to the photo's page. No header, footer or scripts beyond the film player. `noindex`,
framable from any origin.

---

## Blog

Locked 2026-11-22. **Launches with external posts only**; the hosted-post template stays.

### `/blog/` (PG-40)

- Role line "Creator · Writer · Storyteller"; title **Blog**, no kicker; lede "Compression, sawdust
  and long trips. Everything I've written, in one timeline." (Open: is "Compression" the right
  word). Meta "Subscribe: RSS · Atom · JSON". Buttons **Write with me**, **Subscribe**.
- Pinned band of two or three posts (**Held**: which).
- Filters show sections only (All · Professional · Workshop · Studio, with counts); picking one
  reveals its sub-labels. Search "Search posts", year menu, "N posts".
- Every post under Mark's name plus team posts he wrote, including the four missing Red Hat
  Developer articles. External cards carry an approved one-line summary (**Held**) and "Read on
  <source> ↗".

### Post `/blog/<slug>/` (PG-41)

- Path title is section › sub-label (no "Blog"). A one-sentence hook under the title, which is also
  the card summary and meta description. Meta: date · Mark Kurtz · N min read.
- Body in Source Serif 4 at 68 ch; every image captioned; code highlighted at build; math by KaTeX.
- Ends with a tinted "More from the <Section>" strip (Home's card, same section, newest first) and
  "See all <Section> posts" to `/blog/?section=…`.
- Share image: the post's cover cropped to 1200 × 630, else the Blog banner.
- Open: can text-only posts skip a cover; co-authors in the meta line; should Workshop and Studio
  posts link to their project page.

---

## About and footer pages

### `/about/` (PG-50)

- Role line "Engineer · Woodworker · Photographer"; title **Hi, I'm Mark.**; lede "By day I help AI
  run on less. The rest of the time I'm building furniture or chasing light somewhere far from home."
- Bio, three paragraphs beside the headshot (story first; schooling stays on Professional):
  1. "**[Held: how Mark got into making AI efficient]**. That question has been my job ever since."
  2. "It took me from Burst and Aisle411 to six years at Neural Magic, where I grew from engineering
     manager to CTO, and on to Red Hat when it acquired Neural Magic in January 2025. Today I build
     open-source tools in the vLLM project: LLM Compressor, GuideLLM and Speculators."
  3. "The same itch shows up off the clock. I build furniture, design and print parts, and plan trips
     around the photos I want to take, from Antarctica to Burning Man."
- **Find me elsewhere**: eight profile cards: GitHub, LinkedIn, Google Scholar ("811 citations",
  **Held**), X, Instagram, Reddit, Medium (handle **Held**), alphaXiv.

### `/uses/` "My kit" (PG-51)

Lede "What I reach for at the desk, in the shop and on the road." plus an updated date. Five groups,
in order: Desk, Software, Woodshop, 3D printing and electronics, Camera and editing (anchors
`#uses-<group>`). Icon cards with the item, its exact model and one line on why. Empty groups
hidden. Camera and editing must match Studio's "What I shoot with" and work-page facts. Any affiliate
links are disclosed. Every item **Held**.

### `/colophon/` (PG-52)

Lede "Built by hand, like the furniture." Type and colour block: three type samples (Inter
Display for headings, Source Serif 4 for reading, Geist Mono for dates and code) and five swatches
(Teal #489D99, Teal text #387A77, Navy #121B30, Page #F8FAFC, Dark page #0B1220). Build list:
Generator, Hosting, Photos, Source (**Held**). "All photos and films are mine. Public photos are
shared under CC BY-NC, so you can use them for non-commercial work with credit. Ask if you'd like to
use one another way." Stand-in credits and stand-in films are removed at launch.

### `/privacy/` (PG-53)

Lede "What this site collects, why, and how long it keeps it." One table:

| What | Why | How long |
| --- | --- | --- |
| Server logs | Keep the site running | **Held** (14 days proposed) |
| Page counts | See what people read | Anonymous; tool **Held** (or none) |
| Contact messages | Reply to you | **Held** |
| Client access log | Keep client links safe | **Held** |

One line under it: videos load from YouTube's privacy-enhanced domain only after you press play.

---

## Edge pages

### `/404` (PG-60)

Title "This page isn't here"; lede "The address may be mistyped, or the page has moved. Try one of
these, or search the blog." The three doors and a large search box (searches `/blog/`). Art: the
digits 404. `noindex`.

### `/link-expired/` (PG-61)

Title "Gone, but not lost"; "This link was turned off. Ask whoever sent it, or write to me and I'll
sort it out." Buttons **Contact Mark** (popup) and **See Studio**. Art: hourglass. `noindex`.

---

## Clients

Full behaviour in [04-clients-sharing-embeds.md](04-clients-sharing-embeds.md).

| Page | Copy |
| --- | --- |
| `/clients/` with no stored link | Card with lock art; role line; title "Open your photos"; "Use the link I sent you. The link is the key: there is no account and no password." Field "Paste your link" with hint "The whole link from my message, or the code after its #." Button **Open**. "No link, or it stopped working? Write to me." |
| `/clients/` with a link | Title "Your photos"; lede "Everything your link opens, and every link you've made from it." Button **Forget this browser**. "Your link lets you" with the three permission checks. "This browser keeps your link so you don't have to open it again. Forgetting it here doesn't turn it off; open the link again any time." Sections **From Mark** (collection cards: "2 new · More on the way", "N photos so far") and **Links you've made** (summary line; each link with name, photos, what it allows, Active or Turned off, Copy, Turn off). Note: "A link works until you turn it off. Turning it off ends access everywhere it was opened, along with any links made from it." |
| `/clients/g/<id>/` | Path title "Your photos / <Gallery>"; lede "Every photo from <the shoot>, in the order it happened. Copy a link to any of them, or download them all."; meta "N photos so far · N new · Next delivery <note>". Buttons **Your photos**, **Download all** (if allowed). Toolbar: All/New switch, dropdown checkbox menus (Part of the day, Where, Who, Kind), **Select all N**. Count line "N photos, in the order taken". Timeline rail of moments. Select bar "N selected · Clear · Make a link". |
| `/s/<id>/` | Role line; title = the share's name; "Photos by Mark Kurtz, shared with you. See more of my work". Note "This link lets you view[, download][, and copy a link to any one photo]. It works until the person who sent it turns it off." Download button if allowed. |

---

## Machine files

| File | Contents |
| --- | --- |
| `/sitemap.xml` | Every indexed public page, with `lastmod` from git |
| `/robots.txt` | `Disallow: /clients/` and `/admin/`; **`/s/` is allowed** so preview bots can unfurl shares (they carry `noindex`); sitemap line |
| `/llms.txt` | Plain-language summary of who Mark is and links to each section; private pages left out; placeholders stripped |
| Feeds | RSS, Atom, JSON with full content for hosted posts and link entries for external ones |
