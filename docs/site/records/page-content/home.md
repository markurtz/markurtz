> [!NOTE]
> Record of the page-content review as approved. Where it differs from [03 · Page specifications](../../product/03-page-specs.md) or [04 · Clients](../../product/04-clients-sharing-embeds.md) (for example the client sign-in wording, header Get in touch, kickers and breadcrumbs, all revised on 2026-11-23), those documents win. Paths such as `page-review/…` refer to the project's shared files, not this repository.

# Home page: FINAL content (approved by Mark 2026-11-21 9:47 PM ET; mock v15)

Source: Mark's picks in the Home page review (https://claude.ai/artifact/Fm1vHBtEQgcJEz1RZVheJa, db `review/home`), with his notes applied. Build with the mock's existing components; the option previews are in `page-review/home/build.mjs` (option C or A as noted).

## Theme

The doors set the idea: **take it apart, make it better**, in three materials (code and math, wood and circuits, light). Every section below the doors is something made, so each title is a past participle plus where it happened: *Built in the open, Shared on stage, Published and patented, Made in the workshop, Captured on the road, Written between projects*. The footer answers it: *Want to build something together?* Every "see all" link uses the same form: **See all …**.

## Order and why

1. Hero: who, in one breath.
2. Stats: proof right away.
3. Doors: the map of the site.
4. Built in the open (Software): ties straight to the GitHub stars stat.
5. Shared on stage (Talks): video thumbnails break up the text-heavy software cards.
6. Published and patented (Research): text-heavy, so it sits between two visual sections.
7. Made in the workshop (Projects): compact photo cards, the turn to the hands-on side.
8. Captured on the road (Studio): the most visual section, placed late to pull people down the page.
9. Written between projects (Blog): ties everything together, mixing all three sides.
10. Footer invitation.

This follows the door order (Professional, then Workshop, then Studio) and alternates text-heavy and image-heavy sections.

## 1. Hero (C, intro generalized per Mark's note)

- Kicker: Researcher, Engineer, Creator
- Title: Mark Kurtz
- Intro: Efficient AI at Red Hat. Former CTO of Neural Magic, acquired by Red Hat. Published researcher and open-source creator. Woodworker, photographer and tinkerer on the side.
- Buttons: none (removed 2026-11-22; the doors right below are the click-throughs, and Get in touch is in the header and footer).
- Headshot caption: none.

## 2. Stats strip (C)

| Number | Label |
| --- | --- |
| 9.2k | GitHub stars |
| 10 | papers, cited 811 times |
| 6 | patent filings |
| 28 | recorded talks |

Stars are summed across repos Mark created (llm-compressor 3,981, guidellm 1,801, speculators 972, sparseml 2,141, sparsify 323), read 2026-11-22. On the real site, fetch at build time.

## 3. Doors (A)

- Heading: Take it apart. Make it better.
- Intro: Same curiosity, different materials: code and math, wood and circuits, light.
- Professional: Code and math: understanding how AI works, then building faster models, new techniques and useful software.
- Workshop: Wood, filament and circuits: furniture, printed parts and electronics for around the house.
- Studio: Light: photos and films of places and moments, from the Antarctic Peninsula to Black Rock City.
- Link word: Explore

## Cards in the six sections (round 3, option C)

Bands: tinted backgrounds alternate starting with Built in the open (tinted: Built in the open, Published and patented, Captured on the road; page color: Shared on stage, Made in the workshop, Written between projects), so Software reads as separate from the doors.

Every section below the doors uses the same card and the same layout: **one row of four cards**, so every section takes the same height (about 415px at desktop width; Software is a little taller because of its intro line).

- Card: framed card, 16:9 media on top, then an eyebrow line (one line, ellipsis) and a title (clamped to two lines, always reserving two lines). No description line.
- Media changes by type: cover art for software and research, the YouTube thumbnail with a play button for talks, the first photo for projects, studio and hosted posts, cover art for external posts.
- A small pill in the top-left of the media for type cues: language for software, Paper/Patent for research, In progress/Coming soon badges for projects, Film for studio works with a film, the source with an outbound arrow for external posts.
- Grid: 4 across from 960px, 2 across from 640px, 1 below. Reference markup and CSS: `hc()` and `.hm-row`, `.hm-row4`, `.hm-c` in `page-review/home/build.mjs` (option C).

## 4. Built in the open (Software)

- Intro: Open-source projects I've created, from research libraries to everyday developer tools.
- Cards: llm-compressor, guidellm, speculators, rustarium (eyebrow `owner · role`, cover art software-1..3)
- Link: See all software

## 5. Shared on stage (Talks)

- Cards: GenAI at Scale (InfoQ Dev Summit Boston, 2025), Lossless LLM inference acceleration with Speculators (2025), State of LLM Compression from Research to Production (2025), Neural Magic keynote at Cerebras AI Day (2024)
- Eyebrow: tier · year
- Link: See all talks

## 6. Published and patented (Research)

- Cards: Microscaling FP4 Quantization (ICLR 2026), "Give Me BF16 or Give Me Death"? (ACL 2025), Inducing and Exploiting Activation Sparsity (ICML 2020, 277 citations), US 11,797,855 (granted patent)
- Eyebrow: venue (plus citations when known), or "Granted patent"
- Link: See all research

## 7. Made in the workshop (Projects)

- Cards: New furniture series, Parametric storage bin [placeholder: invented for the mock; swap for a real build or design when Mark names one, see page-review/workshop/final.md], Pet shelf, Entryway bench
- Eyebrow: subsection · year
- Link: See all projects

## 8. Captured on the road (Studio)

- Cards: Antarctica, Burning Man, Iceland to Greenland eclipse cruise, Egypt and Jordan (first photo, Film pill where there is a film; plays on hover can stay)
- Eyebrow: place · year
- Link: See all studio work

## 9. Written between projects (Blog)

- Cards, newest first (no hosted posts at launch, per the Blog review 2026-11-22): Speculators: Standardized, production-ready speculative decoding; Fly Eagle(3) fly: Faster inference with vLLM & speculative decoding; The hidden cost of large language models; GuideLLM: Evaluate LLM deployments for real-world inference. All Red Hat Developer, with the source pill and cover art.
- Eyebrow: section · month year
- Link: See all posts

## 10. Footer invitation (C, site-wide)

- Line: Want to build something together?
- Button: Get in touch

## Still open (Mark has not answered)

- Confirm 811 citations, 10 papers, 6 patent filings, 28 talks are current.
- Studio works are the mock's picks with stand-in photos until Mark's own are in.
- "Parametric storage bin" in Made in the workshop is a placeholder invented for the mock (Workshop review, 2026-11-22).
