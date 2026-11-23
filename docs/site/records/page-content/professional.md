> [!NOTE]
> Record of the page-content review as approved. Where it differs from [03 · Page specifications](../../product/03-page-specs.md) or [04 · Clients](../../product/04-clients-sharing-embeds.md) (for example the client sign-in wording, header Get in touch, kickers and breadcrumbs, all revised on 2026-11-23), those documents win. Paths such as `page-review/…` refer to the project's shared files, not this repository.

# Professional pages: final content (2026-11-22)

Approved by Mark on 2026-11-22 after five review rounds (review page https://claude.ai/artifact/3cQ1mdk4bNUGUhHx8P7x2F; answers in db `review/professional`, `-r2` … `-r5`). Covers `/professional/`, `/professional/software/`, `/professional/research/` and `/professional/speaking/`. Preview source: `page-review/professional/build.mjs` and `content.mjs` (round 5).

Anything marked **[confirm]** is a placeholder Mark still has to fill in. Keep it in place, clearly marked. **Launch policy (Mark, round 4 C): keep these as written, and launch waits for Mark's yes on every one.** The full list is in "Open facts" at the end.

Shared rules across all four pages (they match Home's `final.md`):

- **Small card, used everywhere:** the icon card (mock `compactCard` / `.cp`: icon tile, eyebrow, title). No images. It's used for every Pinned band and for every "Built here" row on role cards.
- **Pinned band** sits directly under the page header, with **24px of space** before the filter toolbar. Note: the mock today puts the toolbar *above* the pinned band, but Mark reviewed and approved pinned-first.
- **Blog strip** at the bottom of every page: **"Written between projects" · "See all posts"**, using Home's uniform card (four across, 16:9 media, eyebrow, two-line title, no description). It shows Professional posts, preferring the page's own sub-section.
- Section names come from Home: **Built in the open** (Software), **Published and patented** (Research), **Shared on stage** (Speaking).

## /professional

**Header**
- Kicker: Researcher · Engineer · Speaker
- Headline: Research, open source and the stage.
- Intro: AI research, open-source software and talks. Red Hat today; formerly CTO of Neural Magic.
- Buttons: Work with me (primary, arrow) · Download résumé

**Tiles** (cover art `covers/<x>-2.svg`)
- Software: "Built in the open where I can." · 10 repositories
- Research: "Published and patented: ICML, ACL, ICLR and more." · 10 papers · 6 patent filings [confirm counts]
- Speaking: "Shared on stage: keynotes, talks and webinars." · 28 recordings [confirm count]

**Experience** (heading only, no intro; role cards in the year rail; each card shows up to 6 "Built here" items as icon cards)
- **Red Hat** · 2025–now · Now
  - Member of Technical Staff · Jan 2025 – now
  - Bullets: Efficient AI research and open source. / Creator of Speculators. / LLM Compressor and GuideLLM, carried over from Neural Magic. [confirm: lead, maintain or contribute]
  - Built here: speculators (Software) · Microscaling FP4 quantization (ICLR 2026) · Latency model for speculative decoding (arXiv) · GenAI at Scale (InfoQ Dev Summit Boston)
- **Neural Magic** · 2019–2025
  - Chief Technology Officer · Mar 2024 – Jan 2025
  - Director of Machine Learning · 2021 – 2024 [confirm dates]
  - Engineering Manager, Machine Learning · 2019 – 2021 [confirm dates]
  - Bullets: CTO through the acquisition by Red Hat. / Grew ML to 20+ engineers and researchers. [confirm] / Creator of SparseML, Sparsify, LLM Compressor and GuideLLM.
  - The MLPerf "1000×" line is cut.
  - Built here: llm-compressor · guidellm · Give Me BF16 or Give Me Death (ACL 2025) · The Optimal BERT Surgeon (EMNLP 2022) · Sparse ImageNet transfer (CVPR 2022) · Activation sparsity (ICML 2020)
- **Earlier roles:** one card each, title and dates, plus one line in Mark's words.
  - Burst, Inc. · 2016–2019 · Lead Software / ML Engineer [confirm title, dates] · [confirm: Mark's line] · Built here: US 10,743,042 and US 10,362,340 (granted patents)
  - Aisle411 · 2015–2016 · Senior Software / ML Engineer [confirm title, dates] · [confirm: Mark's line]
  - Answers.com · 2013–2015 · Software Engineer [confirm title, dates] · [confirm: Mark's line]
  - Mueller Prost · 2010–2013 · Data Analyst / Software Engineer [confirm title, dates] · [confirm: Mark's line]

**Education** (degrees and years only, no lines, no glider video)
- Washington University in St. Louis · MS, Robotics Engineering (2014 – 2016) · BS, Mechanical Engineering (2013 – 2015) [confirm years]
- Fontbonne University · BS, Applied Mathematics (2010 – 2013) [confirm years]

**Blog strip:** Written between projects · See all posts

**Meta description:** AI researcher, open-source engineer and speaker. Efficient AI at Red Hat; former CTO of Neural Magic.

## /professional/software/

- Header: Professional › Software · **Software** · "Built in the open where I can. Free to use."
- Pinned (icon cards): llm-compressor · guidellm · speculators
- Filters: All 10 · Active 6 · Research libraries 6 · Developer tools 4 · Archived 3 · **Not public [confirm count]** · search · year select
- **Layout (round 5 C):** a year timeline, newest first, like Research and Speaking. Full repository cards (`repoCard`) grouped under each year (2026, 2025, 2024, 2021, 2020, using each repo's start year). Earlier work that isn't open source sits in its own year in the same rail as a repository-style card with a lock icon and a **"Not public"** badge, no GitHub link. Placeholders: [confirm: project], [confirm: one line], [confirm: where], [confirm: year]. There is no separate "Before open source" list.
- Repository descriptions are taglines (set B):
  - llm-compressor: Smaller models, same answers.
  - guidellm: Know your load before you buy the hardware.
  - speculators: Faster generation, same outputs.
  - agens: Agents get scheduling, memory and tools.
  - rustarium: Run Python and WASM safely from Rust.
  - git-versioned: Let Git set your version.
  - disdantic: Pydantic models that know their subclasses.
  - sparseml: Where LLM Compressor started.
  - deepsparse: GPU speed on the CPU you have.
  - sparsify: Sparsity without the code.
- Blog strip: Written between projects · See all posts

## /professional/research/

- Header: Professional › Research · **Research** · "Published and patented: ICML, ACL, ICLR and more."
- Pinned (icon cards): Microscaling FP4 (ICLR 2026) · Give Me BF16 or Give Me Death (ACL 2025) · Inducing and Exploiting Activation Sparsity (ICML 2020)
- Filters: All 13 · Conference papers 6 · Preprints 3 · Patents 4 · search · year select
- Entries (year rail, `researchEntry` compact): kind badge, venue, citations on the top line; title (links to the paper); authors with M. Kurtz in bold. No result line and no link chips. A small **Cite** button (copy icon) sits on the right of the top line on papers; patents don't get one.
- Blog strip: Written between projects · See all posts

## /professional/speaking/

- Header: Professional › Speaking · **Speaking** · "Shared on stage: keynotes, talks and webinars."
- Pinned, labelled **Featured** (icon cards): GenAI at Scale · Lossless LLM inference acceleration with Speculators · State of LLM Compression from Research to Production (Home's three)
- Filters: All 17 · Talks 8 · Lectures 2 · Webinars 6 · Podcasts 1 · search · year select
- Recordings: year rail, three across, `talkCard` (thumbnail, eyebrow kind · year, title, venue), as in the mock.
- Blog strip: Written between projects · See all posts

## Open facts (launch waits for Mark's yes)

1. Neural Magic: "Grew ML to 20+ engineers and researchers"?
2. LLM Compressor and GuideLLM today: lead, maintain or contribute?
3. Neural Magic: dates for Director of ML and Engineering Manager (the 2021 split is a guess).
4. Earlier roles: the four titles and date ranges, plus one line each in Mark's words.
5. Education: the year for each degree.
6. Research: are 10 papers, 811 citations and 6 patent filings still current?
7. Research: the missing 10th paper, the third Neural Magic patent and the pending application.
8. Research: the full author list for the 2026 speculative decoding latency paper.
9. Speaking: was InfoQ Dev Summit a keynote?
10. Speaking: the 11 missing recordings (links).
11. Speaking: the venue for "Pruning Deep Learning Models for Success in Production".
12. Speaking: move the YouTube privacy note to the Privacy page? (belongs to the About/footer thread's Privacy page)
13. Software: which personal repositories belong (agens, rustarium, git-versioned, disdantic)?
14. Software: the earlier projects that aren't public: name, where, year and one line each.
