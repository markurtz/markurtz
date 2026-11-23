# 06 · Open decisions and launch blockers

Everything still waiting on Mark, in one place, as of 2026-11-23. Launch waits on every **Fact**
item (policy: Professional round 4, option C). **Decision** items have a default that the build
uses until Mark says otherwise. When an item is answered, update the content or the document it
names, delete the row here, and add a line to the [decision log](../records/decision-log.md).

## Decisions (a default is in place)

| # | Area | Question | Default until answered |
| --- | --- | --- | --- |
| D1 | Domain | Which domain is primary? `productionUrl` is `https://example.com`. | Build and previews on the Vercel URL |
| D2 | Admin | `/admin` sign-in: email one-time code to Mark's address, or a passkey? | Email code (built in PR #3) |
| D3 | Clients | How clients hear about a new batch | Mark messages them; New badge in the gallery |
| D4 | Studio | Keep "Shoot with me", or wording like "Explore with me" (may read as an offer of paid shoots) | "Shoot with me" |
| D5 | Blog | Feeds carry external posts, or hosted only? | Both |
| D6 | Blog | Is "Compression" the right word in the Blog lede? | Keep |
| D7 | Blog | Can text-only posts skip a cover? Co-authors in the meta line? Workshop and Studio posts link to their project? | Banner as cover; author line Mark only; link to project yes |
| D8 | Blog | Does model-release work need its own label? | No |
| D9 | Blog | Show the LinkedIn reaction count on the State of ML card? | No |
| D10 | Workshop | Design files: free, paid or licensed; where they live | Free, on the site's public storage |
| D11 | Workshop | Agentic templates and tooling repos: Code or Professional › Software? | Professional › Software |
| D12 | Privacy | Page-count tool, or none | None at launch |
| D13 | Privacy | Does Speaking keep its own YouTube note? | Privacy page only |
| D14 | Hosting | Vercel Hobby or Pro (Hobby terms exclude commercial use; paid client work may need Pro) | Hobby until the first paid delivery |
| D15 | Clients | Files (non-media) at launch? | Photos and films only |
| D16 | Art | Network strokes as marker or pencil: options to be generated in art round 7 ([33](../design/33-page-art-motion.md#open-art-round-7)) | Current smooth strokes |

## Facts (launch blockers)

### Home and About

| # | Where | Needs |
| --- | --- | --- |
| F1 | Home stats, About profiles | Confirm 10 papers, 811 citations, 6 patent filings, 28 recorded talks |
| F2 | About bio, paragraph 1 | How Mark got into making AI efficient (one or two sentences) |
| F3 | About profiles | Medium handle |
| F4 | Contact popup | Reply timing, or drop the clause |

### Professional (14)

| # | Needs |
| --- | --- |
| F10 | Neural Magic: "Grew ML to 20+ engineers and researchers"? |
| F11 | LLM Compressor and GuideLLM today: lead, maintain or contribute? |
| F12 | Neural Magic: dates for Director of ML and Engineering Manager |
| F13 | Burst, Aisle411, Answers.com, Mueller Prost: titles, dates and one line each |
| F14 | Degree years |
| F15 | Counts current (see F1) |
| F16 | The missing tenth paper, the third Neural Magic patent and the pending application |
| F17 | Full author list for the 2026 speculative-decoding latency paper |
| F18 | Was InfoQ Dev Summit a keynote? |
| F19 | The 11 missing talk recordings |
| F20 | Venue for "Pruning Deep Learning Models for Success in Production" |
| F21 | Which personal repos belong (agens, rustarium, git-versioned, disdantic) |
| F22 | Earlier non-public projects: name, where, year and one line each |

### Workshop

| # | Needs |
| --- | --- |
| F30 | Year for every build except the entertainment center (2021) |
| F31 | One-line description for every build except the entertainment center |
| F32 | Which builds have video or a time-lapse, and which have plans |
| F33 | The first one to three real designs (replacing "Dining table plans" and "Parametric storage bin") |
| F34 | MAV Grid: what MAV stands for, scope, public link |
| F35 | New furniture series: which pieces, where the videos live |
| F36 | Per project: build log, materials, time, tools, dimensions, cost |
| F37 | "Rough lumber" or "dimensioned boards"; "Tinkerer"; "Built on weekends, mostly by hand" |
| F38 | Entertainment center line wording |
| F39 | A real item for the home row in place of the parametric storage bin |

### Studio

| # | Needs |
| --- | --- |
| F40 | Real places (10 of 14 guessed) and dates for every work |
| F41 | Month of each trip |
| F42 | Confirm the region grouping |
| F43 | What "25 for 25" was |
| F44 | Per work: days and dates, the opening moment, story paragraphs |
| F45 | Camera, lenses, editing tools (Studio foot, facts panel, Uses) |
| F46 | The three Favorites |
| F47 | Which works have a film and its length; Kennebec on YouTube or hosted |
| F48 | Mark's own photos and films for every work (all are stand-ins) |

### Blog

| # | Needs |
| --- | --- |
| F50 | Which posts to pin |
| F51 | Which of the 11 Neural Magic team posts Mark wrote; the Burst post byline; is "The Challenges of EfficientNets" his |
| F52 | The four missing Red Hat Developer articles |
| F53 | Approve a one-line summary per external post |

### Colophon, Privacy, Uses

| # | Needs |
| --- | --- |
| F60 | Colophon build list: generator, host, photo storage, whether the source is public |
| F61 | Privacy retention: server logs (14 days proposed), client access log (90 days proposed) |
| F62 | Uses: every item, model and why; the updated date; where affiliate links are disclosed |

### Clients

| # | Needs |
| --- | --- |
| F70 | Real gallery name for the first delivery |

## Engineering blockers (not Mark's)

| # | Blocker | Document |
| --- | --- | --- |
| E1 | Fix the three High review findings before client galleries switch on (rate-limit race, DB backup artifact on the public repo, revocable shares) | [21](../engineering/21-access-security.md#8-review-findings-from-pr-3) |
| E2 | Bring PR #3 in line with the routes, schema and access model here | [24](../engineering/24-build-test-deploy.md#gap-against-pr-3) |
| E3 | Viewer shows only Copy link and Close; add Embed and More (in progress in the mock) | [04 § 6](04-clients-sharing-embeds.md#6-the-three-buttons-on-every-photo-and-film) |
| E4 | Art round 7: edge-to-edge web, one shared base network, strands fixed to the subject, per-subject fixes | [33](../design/33-page-art-motion.md#open-art-round-7) |
| E5 | Self-host fonts (the mock loads Google Fonts) | [30](../design/30-design-system.md#3-typography) |
