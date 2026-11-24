# 05 · Voice, copy and placeholders

Status: **Locked** (brand system 1.0, page reviews 2026-11-21 to 22, role lines 2026-11-23).

## 1. Voice

- **First person, direct, with proof.** "I build open-source tools in the vLLM project", followed by
  the link, not adjectives.
- **Curious, rigorous, hands-on.** Short declaratives. Professional pages lean short, bold and
  compact.
- **One theme everywhere:** "Take it apart. Make it better." Section titles are a past participle
  plus where it happened: *Built in the open, Shared on stage, Published and patented, Made in the
  workshop, Captured on the road, Written between projects.*
- **Plain words.** "Turn off", not "revoke"; "link", not "token"; "Your photos", not "Dashboard".
- **No selling.** No offers of commissions, shoots or consulting; the contact popup just says hi.
- **No promises the site can't keep.** No "no affiliate links" promise; no reply-time promise until
  Mark gives one.

## 2. Copy rules

| Rule | Example |
| --- | --- |
| Sentence case for every title, button and label | "See all studio work", not "See All Studio Work" |
| One link wording for lists | **See all …** |
| Buttons are verbs | Send message, Make link, Turn off, Download all |
| Middle dot `·` separates meta | "ICLR 2026 · 12 citations" |
| Role lines: three single words | "Creator · Woodworker · Builder" |
| Path titles use " / " | "Professional / Software" |
| Numbers: digits; thousands with a comma; stars abbreviated | 811, 3,981, 9.2k |
| Dates: "August 2026", "Jan 2025 – now" (en dash) | |
| External links end with ↗ and name the destination | "Read on Red Hat Developer ↗" |
| Empty states say what happened and what to do | "No posts match that. Try a different search, or clear all filters." |
| Errors in words, next to the field | "Enter an email address like name@example.com." |
| Alt text describes the photo; decorative art has `alt=""` | |

## 3. Role lines

Three words in Geist Mono at the top of every page header. The first word is the home line's best
fit (**Researcher**, **Engineer** or **Creator**), then two role nouns. The full list is in
[03 § page header](03-page-specs.md#page-header-pg-1). New pages follow the same rule; the line is a
role, not a description.

## 4. Facts and placeholders

Rule (Mark, every page review): **never invent biography, employers, dates, numbers or
publications.** Policy for unknown facts (Professional round 4, option C): keep the wording, mark
the fact, and **launch waits for Mark's yes on every one**.

### The markers

| Marker in content | Means | Renders in the mock / previews |
| --- | --- | --- |
| `⟦text⟧` | A held value: a stand-in that must be replaced | Amber dotted underline (`.tbd`) |
| `[confirm: question]` | An open fact with the question to ask | Amber mono tag (`.tbd--ask`) |
| `tbd: ["year", "desc", …]` on a record | These fields of this record are held | The field renders with the `.tbd` style |

### Build behaviour

- **Preview and development builds** render markers visibly, as above.
- **Production builds fail** if any marker remains in published content (`content:check-held`),
  listing file, field and question. This is the launch gate in [01 § 7](01-product-requirements.md#7-launch-criteria).
- Markers are stripped from attributes, `<title>`, feeds, `llms.txt` and structured data in every
  build, so a preview never leaks "[confirm" into a share card.
- When Mark supplies a fact: edit the content and delete the marker. Nothing else changes.

### Stand-in media

Photos and films that are not Mark's own are stand-ins, credited on `/colophon/` while they
remain. The headshot and talk thumbnails are his. The production build fails if any media key
listed in `media/credits.json` as a stand-in is referenced.

## 5. Copy ownership

| Copy | Owner | Where it lives |
| --- | --- | --- |
| Page headers, ledes, section titles | Locked by Mark | `content/pages/*.mdx`, `content/**/index.mdx` front matter |
| Item lines (taglines, summaries) | Mark approves each | The item's record |
| External post summaries | Mark approves each (**Held**) | `content/blog/external.yaml` |
| Studio moments and story paragraphs | Mark writes | `content/studio/<work>/index.mdx` |
| Build logs | Mark writes | `content/workshop/<page>/<project>/index.mdx` |
| Interface strings (buttons, empty states, errors) | This document and [03](03-page-specs.md) | `src/lib/strings.ts` (one file) |
