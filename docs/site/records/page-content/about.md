> [!NOTE]
> Record of the page-content review as approved. Where it differs from [03 · Page specifications](../../product/03-page-specs.md) or [04 · Clients](../../product/04-clients-sharing-embeds.md) (for example the client sign-in wording, header Get in touch, kickers and breadcrumbs, all revised on 2026-11-23), those documents win. Paths such as `page-review/…` refer to the project's shared files, not this repository.

# About and footer pages: FINAL content (Mark's picks, 2026-11-21 10:31 and 10:37 PM ET)

Source: Mark's picks in the About page review (https://claude.ai/artifact/U8LgbaZzbMJGeFkwCGADJY, db `review/about`). Option previews are in `page-review/about/content.mjs`. Every **[confirm]** stays a visible placeholder; launch waits for Mark's yes on each one.

Mark left every fact question blank, so the facts that options depended on are placeholders, and claims the picks dropped are cut.

## /about

1. **Header (B):** kicker About · title **Hi, I'm Mark.** · lede: By day I help AI run on less. The rest of the time I'm building furniture or chasing light somewhere far from home. Art: about.
2. **Bio (B, story first, three paragraphs beside the headshot):**
   - [confirm: how Mark got into making AI efficient, one or two sentences]. That question has been my job ever since.
   - It took me from Burst and Aisle411 to six years at Neural Magic, where I grew from engineering manager to CTO, and on to Red Hat when it acquired Neural Magic in January 2025. Today I build open-source tools in the vLLM project: LLM Compressor, GuideLLM and Speculators.
   - The same itch shows up off the clock. I build furniture, design and print parts, and plan trips around the photos I want to take, from Antarctica to Burning Man.
   - Cut (not in B): "lead open-source work", "helped see the company through its acquisition", "several times faster without giving up accuracy", the Burst and Aisle411 descriptions, schooling. Schooling stays on Professional.
3. **Find me elsewhere (A):** all eight profile cards as now (GitHub, LinkedIn, Google Scholar "811 citations", X, Instagram, Reddit, Medium, alphaXiv). Facebook not added. [confirm: 811 citations, Medium handle]

## Contact popup (every Get in touch button)

1. **Heading and intro (B):** title **Say hi** · Whether it's a project, a talk or a question about a build, I'd like to hear about it. I reply to every message [confirm: how fast, or drop the timing].
2. **Reasons to write (C):** removed. One open message box; no promise of commissions or shoots.
3. **Form (kept as now):** Name, Email, Message (plus hidden spam trap) · button **Send message** · note: Protected by a privacy-friendly spam check. No tracking.

The header and footer button label stays "Get in touch"; only the popup title changes.

## /colophon

1. **Header (C):** kicker Colophon · title Colophon · lede: **Built by hand, like the furniture.** Art: home.
2. **Type and color (C):** a visual block, not prose: three type samples (Inter Display for headings, Source Serif 4 for reading, Geist Mono for dates and code) and five swatches with hex: Teal #489D99, Teal text #387A77, Navy #121B30, Page #F8FAFC, Dark page #0B1220.
3. **Build (B):** heading Build, short list: Generator [confirm] · Hosting [confirm] · Photos [confirm: storage] · Source github.com/markurtz/markurtz [confirm: public].
4. **Photos and films (B):** All photos and films are mine. Public photos are shared under CC BY-NC, so you can use them for non-commercial work with credit. Ask if you'd like to use one another way. The stand-in credits table and stand-in films section go at launch (keep them in the mock while stand-ins remain). Mark's note: the license also goes in the footer (see Footer).

## /privacy

1. **Header (A):** kicker Privacy · title Privacy · lede: What this site collects, why, and how long it keeps it. Art: home.
2. **Body (A, one table):**

| What | Why | How long |
| --- | --- | --- |
| Server logs | Keep the site running | [confirm: 14 days] |
| Page counts | See what people read | Anonymous, [confirm: tool, or none] |
| Contact messages | Reply to you | In my email only |
| Client access log | Check and revoke access | [confirm: 90 days] |

   Keep one line under the table: Videos load from YouTube's privacy-enhanced domain, and only after you press play. Open: whether Speaking keeps its own copy of that note (asked the Professional thread's question in the review; unanswered).

## Footer (every page)

- Invitation line and button: from the Home final ("Want to build something together?" · Get in touch).
- Links: Uses · Colophon · Privacy · **Clients** (renamed from Client sign-in).
- Base row (C): **© 2026 Mark Kurtz · Photos CC BY-NC · Code on GitHub** (this carries Mark's "license in the footer" note). Profile icons unchanged; no Facebook.

## /uses (round 2 picks, 2026-11-21 10:37 PM ET)

1. **Header (B):** kicker Uses · title **My kit** · lede: What I reach for at the desk, in the shop and on the road. Updated [confirm: month year]. Art: home. No "no affiliate links" promise (affiliate links are a maybe; if added, disclose them [confirm: where]).
2. **Groups (C), in this order:** Desk · Software · Woodshop · 3D printing and electronics · Camera and editing.
3. **Cards (B):** the icon card in the `.profiles` grid, with the item name, the exact model on the second line, and one short line on why Mark uses it. Every model and why is [confirm]; until then show the item name with "[confirm]" lines, or hide the group if it has no items yet.
4. **Gear:** all placeholder. The Camera and editing group is the same kit as Studio's "What I shoot with" line and the work-page facts panel; keep the three in sync.

## Placeholders to fill before launch

| Where | What |
| --- | --- |
| About bio | How Mark got into efficient AI |
| About profiles | 811 citations, Medium handle |
| Contact popup | Reply timing |
| Colophon build | Generator, host, photo storage, whether source is public |
| Privacy | Log retention, analytics tool, client log retention |
| Uses | All gear (models and whys), updated date, affiliate disclosure if any |
