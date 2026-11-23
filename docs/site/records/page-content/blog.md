> [!NOTE]
> Record of the page-content review as approved. Where it differs from [03 · Page specifications](../../product/03-page-specs.md) or [04 · Clients](../../product/04-clients-sharing-embeds.md) (for example the client sign-in wording, header Get in touch, kickers and breadcrumbs, all revised on 2026-11-23), those documents win. Paths such as `page-review/…` refer to the project's shared files, not this repository.

# Blog pages: final content (Mark's picks, 2026-11-22)

Source: Mark's picks in the Blog page review (https://claude.ai/artifact/VgN6YsvV14dvmBvvLNw6kr, db `review/blog`). All 14 sections picked; no facts answered and no notes. Previews and markup are in `page-review/blog/content.mjs` and `build.mjs`.

## Shared with Home, Professional, Workshop and Studio

- Page header: mock `pageHeader()` (no box, art on the right). /blog uses art `blog`; a post uses its sub-label art, else its section's, else `blog`.
- Pinned band uses the small icon card, above the filters.
- Section links read "See all …".
- Unconfirmed facts show the placeholder marker ([confirm] or the amber dotted underline) and are held from launch.
- Section pages keep their "Written between projects" blog strip (Home and Workshop final.md). The end of a post is different (below); Mark picked that.

## Launch decision: no hosted posts

Mark picked **external posts only at launch** and **remove both mock posts**. So:

- Delete `/blog/entryway-bench/` and `/blog/antarctica-notes/` and their entries in `content/site.mjs`.
- Home's "Written between projects" row (Home final.md §9) lists both. Replace them with the next newest external posts: Speculators, Fly Eagle(3) fly, The hidden cost of large language models, GuideLLM.
- The Workshop entryway bench project page links "the full build log is on the blog". Drop that link until a real log exists.
- Feeds and llms.txt lose the two hosted entries.
- The post template below stays in the build for the first real post.

## /blog

1. Header (C)
   - No small kicker. Title: **Blog**
   - Intro: **Compression, sawdust and long trips. Everything I've written, in one timeline.**
   - Under the intro (from section 7, C): **Subscribe: RSS · Atom · JSON**, linking /blog/feed.xml, /blog/atom.xml, /blog/feed.json.
2. Filters (A): the segmented switch shows sections only: **All · Professional · Workshop · Studio**, with counts. Picking a section reveals its sub-labels (for Professional: Software, Research). Search "Search posts", year menu "All years". Count line: **"N posts"** (drop "newest first").
3. Pinned (A): label **Pinned**, two or three hand-picked pieces from anywhere. Placeholder picks until Mark names his [confirm]:
   - We ran over half a million evaluations on quantized LLMs, here's what we found (Red Hat Developer, Oct 2024)
   - 2022 State of Competitive ML: The Downfall of TensorFlow (Medium, Mar 2023)
   - LLM Compressor is here: Faster inference with vLLM (Red Hat Developer, Aug 2024)
4. Hosted posts (A): none at launch (above).
5. Which external posts (B): everything under Mark's name, plus the team posts he wrote.
   - Add the 4 missing Red Hat Developer articles: Compressed Granite 3.1 (Jan 2025), 2:4 Sparse Llama FP8 (Dec 2024), Deploy Llama 3 8B with vLLM (Jun 2024), How well do quantized models handle long-context tasks? (Feb 2024). URLs are in the inventory (`site-structure/site-decisions.html`, Writing).
   - Keep the 2 Medium posts and the r/woodworking post (Mark did not ask to drop it).
   - Neural Magic team-byline posts: add the ones Mark authored or drove [confirm which of the 11]. Burst 2018 post [confirm byline]. Hold all of these from launch until confirmed.
6. Cards (B): the full-width post card gains a **one-line summary on every external post**, drafted from the original article and approved by Mark. Until approved, the line is a placeholder held from launch [confirm]. Link words stay "Read on <source> ↗". Labels as in the mock: tool launches Professional · Software, other Red Hat and Medium pieces Professional · Research, the Reddit post Workshop · Builds.
7. No results (C): **"No posts match that."** then **"Try a different search, or clear all filters."** (link on "clear all filters").

## Post template (/blog/<slug>/), for future posts

1. Trail (A): **section › sub-label**, e.g. "Workshop › Builds", each linking to that section's page. No "Blog" in the trail.
2. Summary under the title (B): **one sentence on the problem or the hook** (why read it). It is also the card summary and the search description.
3. Meta line (A): **"<Month D, YYYY> · Mark Kurtz · N min read"**.
4. Images (A): **every image gets a short caption** saying what it shows.
5. End of the post (B): a tinted strip titled **"More from the <Section>"** (More from Professional / the Workshop / the Studio) with **"See all <Section> posts"** linking /blog?section=…, using Home's 16:9 card (four across, no description), posts from the same section only, newest first.
6. Share image (B): **the post's own cover photo**, cropped to 1200 × 630. Posts without a cover fall back to the Blog banner.
7. Mock posts (A): removed (above).

## Open facts (Mark has not answered; all held from launch)

| Where | Question |
| --- | --- |
| /blog header | Is "Compression" the right word for his field here? (Asked as efficient AI vs model compression vs LLM inference.) |
| Pinned | Which posts to pin; show "479 reactions on LinkedIn" on the State of ML card? |
| External posts | Which Neural Magic team posts he wrote; Burst post byline; is "The Challenges of EfficientNets" under his name? |
| Cards | Approve a one-line summary per external post (to draft); does model-release work need its own label? |
| Feeds | Carry external posts, or hosted only? (Mock carries both; keep until told.) |
| Post template | Can text-only posts skip a cover? Co-authors in the meta line? Should Workshop and Studio posts end with a link to their project page? |
