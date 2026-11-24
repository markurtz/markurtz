# markurtz.com: site documentation

This folder is the complete written record of Mark Kurtz's personal site as decided up to
**23 November 2026**: what it is for, every page, the data behind it, how it is built and
secured, and how it looks and moves. It is written so an engineer, a designer or an AI coding
agent can build the production site from these documents and the mock alone, without the
conversations that produced them.

> [!IMPORTANT]
> These documents describe the **target** site. The implementation in PR #3 was built before
> most of these decisions were made and differs in routes, access model and schema. The gap and
> the migration path are listed in [engineering/24-build-test-deploy.md](engineering/24-build-test-deploy.md#gap-against-pr-3).

## How to read this set

| # | Document | Read it when you need |
| --- | --- | --- |
| | **Product** | |
| 01 | [Product requirements](product/01-product-requirements.md) | Why the site exists, who it serves, numbered requirements, launch criteria |
| 02 | [Information architecture](product/02-information-architecture.md) | The site map, every address, navigation, query strings, user flows |
| 03 | [Page specifications](product/03-page-specs.md) | What is on every page, section by section, with its final copy |
| 04 | [Clients, sharing and embeds](product/04-clients-sharing-embeds.md) | The private client area, link permissions, share links, embeds and link previews |
| 05 | [Voice, copy and placeholders](product/05-voice-copy-placeholders.md) | How the site talks, the role-word lines, how unconfirmed facts are held |
| 06 | [Open decisions and launch blockers](product/06-open-decisions.md) | Everything still waiting on Mark, in one list |
| | **Data** | |
| 10 | [Content model](data/10-content-model.md) | Git content: folders, every record type and field, labels, validation |
| 11 | [Database schema](data/11-database-schema.md) | Postgres tables for collections, items, links, events and enquiries |
| 12 | [Media pipeline and storage](data/12-media-storage.md) | Photo and film derivatives, buckets, keys, preview images, the media CLI |
| | **Engineering** | |
| 20 | [System architecture](engineering/20-system-architecture.md) | The moving parts, rendering modes, hosting and trust boundaries |
| 21 | [Access control and security](engineering/21-access-security.md) | Link tokens (JWT), permissions, revocation, rate limits, headers, threat model |
| 22 | [Routes and API](engineering/22-routes-api.md) | Every route with its render mode and headers, and every API endpoint |
| 23 | [Front-end implementation](engineering/23-frontend.md) | Component inventory, list template behaviour, viewer, share buttons, enhancement rules |
| 24 | [Build, test and deploy](engineering/24-build-test-deploy.md) | Tooling, CI, tests, budgets, environments, the gap against PR #3, launch checklist |
| | **Design** | |
| 30 | [Design system](design/30-design-system.md) | Tokens: colour, type, spacing, layout, radius, motion, themes |
| 31 | [Components](design/31-components.md) | Visual rules for header, footer, page header, cards, toolbar, rail, viewer, forms |
| 32 | [Mark and icons](design/32-mark-icons.md) | The MK monogram, wordmark, J1 marker icons, favicons, formats |
| 33 | [Page art and motion](design/33-page-art-motion.md) | Marker-drawn page art (Build Six): field, subjects, the 6 s draw (once on page tops), files and runtime |
| 34 | [Photography and video](design/34-photo-video.md) | Photo treatment, galleries, films, captions and licensing |
| | **Records** | |
| R | [Decision log](records/decision-log.md) | Every locked decision with its date, newest first |
| R | [Sources](records/sources.md) | Where the mock, spec, review pages and assets live |

## Sources of truth, in order

When two sources disagree, the higher one wins.

1. Mark's latest message on the point (recorded in the [decision log](records/decision-log.md)).
2. These documents.
3. The static mock, v51 or later ([sources](records/sources.md#mock)). The mock is the visual and
   behavioural reference: its markup, CSS and scripts are the closest thing to production code.
4. The "Mark Kurtz Site Structure" spec (Claude Doc). Its client-area section predates the
   23 November switch to link-only access and is superseded there by
   [04-clients-sharing-embeds.md](product/04-clients-sharing-embeds.md).
5. The page-content finals (`page-review/<page>/final.md`), for exact copy.
6. The implementation plan in [docs/plans/website-implementation-plan.md](../plans/website-implementation-plan.md),
   for stack choices not revisited since.

## Status labels used throughout

| Label | Meaning |
| --- | --- |
| **Locked** | Mark approved it. Change only with his say-so. |
| **Default** | An engineering choice made on his behalf. Safe to change if a better option appears; note it in the decision log. |
| **Open** | Waits on Mark. Listed in [06-open-decisions.md](product/06-open-decisions.md). |
| **Held** | Content that is in the mock as a stand-in and must not go live until Mark supplies the real fact. |

## Requirement IDs

Requirements carry stable IDs so tests, issues and pull requests can cite them:
`PRD-*` product, `IA-*` structure, `PG-*` page, `CL-*` clients, `DATA-*` content and schema,
`SEC-*` security, `FE-*` front end, `NFR-*` quality, `DS-*` design, `ART-*` art and motion.

## Keeping this set current

- A pull request that changes behaviour updates the document that describes it, in the same PR.
- A new decision from Mark goes into the [decision log](records/decision-log.md) first, then into
  the document it touches.
- Never invent biography, employers, dates or publications. Unknown facts are **Held** and use the
  placeholder convention in [05-voice-copy-placeholders.md](product/05-voice-copy-placeholders.md).
