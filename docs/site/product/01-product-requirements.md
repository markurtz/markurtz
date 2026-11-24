# 01 · Product requirements

Status: **Locked** unless a line says otherwise. Last updated 2026-11-23.

## 1. What the site is

One home on the web for Mark Kurtz: researcher, engineer and maker. It gathers work that today
lives in many places (GitHub, papers, conference channels, Red Hat Developer, Medium, Reddit,
Instagram) into one place he owns, and it gives his photography clients a private way to see,
download and share their photos.

**Theme (Locked, 2026-11-22): "Take it apart. Make it better."** The same habit in three
materials: code and math, wood and circuits, light. Every section is something made, named for
where it happened ("Built in the open", "Made in the workshop", "Captured on the road"). The site
closes every page with the same answer: "Want to build something together?"

**Idea and character (Locked, brand system 1.0):** exploration; curious, rigorous, hands-on. The
look is a modern personal site, not a document: statement type, real photos, hand-drawn marker
marks drawn live by the same marker over a quiet field of teal lines.

## 2. Audiences and what each needs

| Audience | Arrives from | Needs within three clicks of home | Primary page |
| --- | --- | --- | --- |
| Recruiter, hiring manager, engineer | LinkedIn, GitHub, a talk | Career at a glance, proof of impact, a résumé to save, a way to reach him | `/professional` |
| Event organiser | A talk recording | Past talks by tier, a bio, a contact form | `/professional/speaking` |
| Researcher | A citation, Google Scholar | Papers and patents, filters by topic and year, citation text, arXiv links | `/professional/research` |
| Open-source user | GitHub, a blog post | Repositories with role, status and live stars | `/professional/software` |
| Maker | Reddit, YouTube | Builds with photos, logs, plans and files | `/workshop/*` |
| Photo, video or travel visitor | Instagram | Trips as photo and film works, licensed for non-commercial use | `/studio` |
| Reader | Feeds, social posts | Every post, hosted or external, in one timeline with feeds | `/blog` |
| Photography client | A link Mark sends | Their photos in order, downloads if allowed, a way to share some with family | `/clients` |
| Someone a client shared with | A link from the client | Just the photos shared, view only unless allowed more | `/s/<id>` |
| Mark | — | Publish by merging files; deliver a shoot with a CLI and a small admin | `/admin` |

## 3. Goals and non-goals

### Goals

- **PRD-G1** Present the professional record (roles, software, research, talks) accurately and
  attractively enough to serve as the canonical link in every bio.
- **PRD-G2** Show the making side (furniture, designs, maker software) and the photography side
  (trips, films) as equals of the professional side, through three equal doors on the home page.
- **PRD-G3** Be the canonical home for writing: hosted posts plus every external post in one
  timeline with feeds.
- **PRD-G4** Deliver client photo and film work privately, with no accounts: the link is the key.
- **PRD-G5** Be fast, accessible and private by default, and cheap to run (free or near-free tiers).
- **PRD-G6** Be easy for Mark to keep current: content is files in git, a monthly update takes
  minutes, and nothing needs a CMS.

### Non-goals

- No booking, pricing, shop or paid offers. The contact popup deliberately offers no commissions
  or shoots (Locked, About review).
- No accounts, passwords or email sign-in for clients (Locked, 2026-11-23).
- No comments, likes, newsletters or third-party trackers.
- No tag or topic pages; filters are query strings on the list pages (Locked, P1.4).
- No "Now" page and no redirects for paths that were never live (Locked, 2026-11-21).
- No YouTube hosting for Mark's own films; only talk recordings stay on YouTube (Locked, 2026-11-21).

## 4. Product principles

1. **The link is the key.** Anything private opens from a link; nothing asks for a password.
2. **One template, many genres.** Every list page shares one layout (pinned band, filters,
   year rail, cards), and adapts only its cards.
3. **Filters are addresses.** Every filtered view is a shareable URL on the same page.
4. **Works without JavaScript.** Scripts add search, filters, the viewer, video and motion; the
   content and links are all in the HTML.
5. **Never invent facts.** Unknown facts are held with a visible marker and block launch.
6. **One hand.** Monogram, icons and page art are drawn in the same chisel-marker stroke.
7. **Show the work, not the chrome.** No boxes around page headers, no navy bands except the
   cinema band, hairline cards, teal for marks and links only.

## 5. Functional requirements

IDs are stable. "Must" is required for launch, "Should" is expected at launch unless it slips,
"Later" is designed for but not built first.

### 5.1 Global

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-1 | Site header on every page: lockup, the five menu links (Professional, Workshop, Studio, Blog, About), theme button; menu button on phones. No Get in touch in the header (2026-11-23). | Must |
| PRD-2 | Footer on every page: "Want to build something together?" with Get in touch; links Uses · Colophon · Privacy · Clients; profile icon buttons; base row "© 2026 Mark Kurtz · Photos CC BY-NC · Code on GitHub". | Must |
| PRD-3 | A "Say hi" contact popup opened by the footer button, by each section header's primary button, and at `#contact`. Name, Email, Message, privacy-friendly challenge and a hidden trap field. | Must |
| PRD-4 | System, light and dark themes; choice remembered per browser; no flash of the wrong theme. | Must |
| PRD-5 | Every inner page opens with the banner-style page header (path title, role line, lede, meta, actions, art). | Must |
| PRD-6 | Page art is drawn live by the marker in 6 s: page tops play once and stop when the subject locks in ink, in the right column beside the text; link cards draw on hover, not scroll; sub-page tiles carry no art and redraw the page top on hover; reduced motion and no-JS show the finished still. | Must |
| PRD-7 | Every list page uses the shared template ([03 § list template](03-page-specs.md#the-shared-list-template-pg-2)). | Must |
| PRD-8 | Search over titles, descriptions and labels on list pages, client-side, from a build-time index. | Must |
| PRD-9 | Feeds: `/blog/feed.xml` (RSS), `/blog/atom.xml`, `/blog/feed.json`. | Must |
| PRD-10 | `/sitemap.xml`, `/robots.txt`, `/llms.txt`; private and unlisted pages left out. | Must |
| PRD-11 | Link previews (Open Graph and Twitter) for every public page, using the section banner or the item's own 1200 × 630 crop. | Must |
| PRD-12 | Print stylesheet turns `/professional` into a one-page-style résumé ("Download résumé"). | Must |
| PRD-13 | Cross-page fades with view transitions where supported. | Should |

### 5.2 Professional

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-20 | `/professional`: experience in résumé order as role cards on the year rail, each with titles and dates, 3 to 5 bullets and up to six "Built here" cards linking to items; education with degrees and years only. | Must |
| PRD-21 | Software: repo cards with owner/name, tagline, role, language, live stars, latest release, status; "Not public" cards for closed earlier work. Stars fetched at build time. | Must |
| PRD-22 | Research: papers and patents together; kind badge, venue, citations, authors with Mark in bold; Cite button on papers. | Must |
| PRD-23 | Speaking: thumbnail cards three across in the year rail; YouTube loads only after a click, from the privacy-enhanced domain. | Must |
| PRD-24 | Every item names its role (`org`), so `?role=neural-magic` filters any Professional list to one role. | Must |
| PRD-25 | Home stats: GitHub stars summed across repos Mark created, fetched at build; other stats from content. | Must |

### 5.3 Workshop

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-30 | `/workshop` hub with three tiles (Builds, Designs, Code) and counts, one featured project, an In progress band. | Must |
| PRD-31 | One page per project with lede, optional build log, fact panel (empty rows hidden), downloads or repo link, and "More from the workshop". | Must |
| PRD-32 | Designs offer downloadable files (PDF, STL, STEP) once Mark decides free, paid or licensed. | Later (Open) |
| PRD-33 | Build time-lapses and process clips play in the site's own film player. | Should |

### 5.4 Studio

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-40 | `/studio` list filtered by place (Polar, Europe, Americas, Africa and Middle East) with a Favorites pinned band and title-on-photo cards. | Must |
| PRD-41 | One page per work (`/studio/<name-year>/`): film in a cinema band when there is one, plain-facts lede, a first-person moment, facts panel, justified photo rows on a day-by-day timeline, CC BY-NC line, "More from Studio". | Must |
| PRD-42 | One page per photo and per film (`/studio/<work>/<n>/`, `/studio/<work>/film/`) with its own 1200 × 630 preview crop. | Must |
| PRD-43 | Every photo and film has three buttons, Copy link, Embed and More, on cards, on its own page and in the photo viewer. | Must |
| PRD-44 | Embeddable bare pages at `/embed/studio/<work>/<n|film>/` with a credit line linking back, plus an oEmbed endpoint. | Must (embed) / Should (oEmbed) |

### 5.5 Blog

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-50 | One timeline of hosted and external posts; external cards carry a source badge and open the original. | Must |
| PRD-51 | Section filters (Professional, Workshop, Studio); picking one reveals its sub-labels. | Must |
| PRD-52 | Hosted post template: trail section › sub-label, one-sentence hook, meta, captioned images, "More from the <Section>" strip. Launch with **external posts only**; the template stays for the first real post. | Must |
| PRD-53 | Unlisted posts readable by link but left out of lists, search, feeds and sitemap. | Must |
| PRD-54 | Cross-posting of hosted posts to Dev.to and Hashnode as drafts with canonical URLs. | Later |

### 5.6 About and footer pages

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-60 | `/about` "Hi, I'm Mark." with a three-paragraph bio beside the headshot and eight profile cards. | Must |
| PRD-61 | `/uses` "My kit", five groups of icon cards; Camera and editing stays in sync with Studio's "What I shoot with" and work-page facts. | Must |
| PRD-62 | `/colophon` with type samples, five swatches, build facts and photo licence; stand-in credits removed at launch. | Must |
| PRD-63 | `/privacy` as one table (server logs, page counts, contact messages, client access log) with why and how long. | Must |
| PRD-64 | `/404` with the three doors and a search box; `/link-expired` for turned-off client links. | Must |

### 5.7 Clients

Detailed in [04-clients-sharing-embeds.md](04-clients-sharing-embeds.md).

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-70 | No sign-in. Every client address works from a link that carries a signed token after `#`. | Must |
| PRD-71 | Each link states three permissions: Download, Share single photos, Make new shares. A link never allows more than the link it was made from; turning one off ends every link made from it. | Must |
| PRD-72 | Client gallery: photos in capture order on the timeline rail, multi-select filters, Select, Download all, per-photo buttons, New badges and next-delivery note. | Must |
| PRD-73 | "Your photos" page lists what the link opens and every link made from it, each with Copy and Turn off (confirmed inline). | Must |
| PRD-74 | Share pages `/s/<id>#<token>` with a link preview when the share allows it. | Must |
| PRD-75 | `/admin` for Mark: collections, items, links, enquiries, access log. | Must |
| PRD-76 | Tell clients about a new batch. | Open |

## 6. Quality requirements

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-1 | Core Web Vitals at the 75th percentile, mobile | LCP ≤ 2.0 s, INP ≤ 200 ms, CLS ≤ 0.1 |
| NFR-2 | Home page transfer | < 500 KB total, < 150 KB JS, < 200 KB above-the-fold images, fonts ≤ 150 KB (three families, Locked) |
| NFR-3 | Accessibility | WCAG 2.2 AA; landmarks, one `h1`, skip link, visible focus, labelled fields, errors in words, 44 px targets, forced colours |
| NFR-4 | Works without JavaScript | All content and navigation; filters fall back to the full list |
| NFR-5 | Widths | 320 px to 2560 px with no horizontal scroll; 12/8/4 columns at desktop/tablet/phone |
| NFR-6 | Privacy | No third-party requests before consent-worthy actions (YouTube loads on click); cookieless page counts or none |
| NFR-7 | Security | Private media only through short-lived signed URLs; no secret in the static build; `noindex` + `no-referrer` on private pages ([21](../engineering/21-access-security.md)) |
| NFR-8 | Cost | Runs on free tiers at launch; paid client work may require Vercel Pro (Open) |
| NFR-9 | Upkeep | A monthly update (one new item and a stats refresh) takes under 15 minutes |
| NFR-10 | Search engines and AI | Valid structured data (Person, ScholarlyArticle, CreativeWork, BlogPosting, VideoObject); `llms.txt` |

## 7. Launch criteria

The site goes live when all of these hold:

1. Every **Held** item in [06-open-decisions.md](06-open-decisions.md) is answered or removed.
2. No stand-in photo, film or credit remains (Studio, Workshop, client demo).
3. Fonts are self-hosted WOFF2, subset.
4. The three High findings from the PR #3 review are fixed and verified before client galleries
   switch on: the unlock rate-limit race, the database backup artifact on a public repo, and
   share links that cannot be revoked (the link model in [21](../engineering/21-access-security.md) closes the third by design).
5. CI passes: lint, types, unit, integration, end-to-end, accessibility (axe), link check,
   Lighthouse budgets.
6. The domain is chosen and `productionUrl` is set.
7. The CSP moves from report-only to enforced after one week without violations.

## 8. Success measures

Low-key and privacy-preserving (no per-person tracking):

- Bio links point to the home page and visitors reach a section within one click (page counts by path).
- Each monthly update ships with no layout regressions (visual snapshots in CI).
- Client deliveries: zero support emails about access per shoot; every turned-off link stops working within one request.
- Lighthouse scores stay ≥ 95 in all four categories on home, a list page and a work page.
