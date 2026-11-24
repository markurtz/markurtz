# 22 · Routes and API

Status: routes **Locked** ([02](../product/02-information-architecture.md)); API shapes **Default**.

## 1. Page routes

All public routes are prebuilt. Trailing slashes are on (`trailingSlash: true`), matching the mock.

| Route | Source | Params from | Notes |
| --- | --- | --- | --- |
| `/` | `pages/home.mdx` + lists | — | |
| `/professional/` | `professional/*` | — | Print CSS |
| `/professional/{software,research,speaking}/` | yaml lists | — | Search index JSON emitted beside |
| `/workshop/` | `workshop/index.mdx` | — | |
| `/workshop/[page]/` | project folders | `builds`, `designs`, `code` | |
| `/workshop/[page]/[project]/` | project folder | every folder | |
| `/studio/` | work folders | — | |
| `/studio/[work]/` | work folder | every folder | |
| `/studio/[work]/[item]/` | `photos.json` | `1…n` and `film` | `og:image` = `og.jpg` of the item |
| `/embed/studio/[work]/[item]/` | same | same | `noindex`, `frame-ancestors *` |
| `/blog/` | posts + `external.yaml` | — | |
| `/blog/[slug]/` | hosted posts | every non-draft post | Unlisted: built, `noindex`, excluded from lists |
| `/about/`, `/uses/`, `/colophon/`, `/privacy/` | pages | — | |
| `/link-expired/` | — | — | `noindex` |
| `not-found` (404) | — | — | `noindex` |
| `/clients/` | shell | — | `noindex`, `no-store` |
| `/clients/g/[id]/` | shell | any (not prebuilt per id) | Rendered as one static shell served for every id by a rewrite |
| `/s/[id]/` | shell + dynamic head | path id | `generateMetadata` loads only `name`, item count, `show_preview`, active |
| `/s/[id]/embed/` | shell | any | |
| `/s/[id]/og.jpg` | route handler | path id | Redirect to presigned crop or the Clients banner |
| `/admin/**` | server components | — | `requireAdmin()` |

## 2. Machine routes

| Route | Content |
| --- | --- |
| `/blog/feed.xml`, `/blog/atom.xml`, `/blog/feed.json` | Full content for hosted posts, link entries for external posts (D5) |
| `/sitemap.xml` | Indexed public pages, `lastmod` from git |
| `/robots.txt` | `Disallow: /clients/`, `Disallow: /admin/`, `Disallow: /api/`; `/s/` allowed (CL-23); sitemap line |
| `/llms.txt` | Summary and section links; placeholders stripped |
| `/oembed` | oEmbed JSON for Studio item URLs |
| `/.well-known/security.txt` | Contact for security reports |

## 3. API

All client-area endpoints take `Authorization: Bearer <token>`, return JSON, and answer every
access failure with `404 {"error":"link_unavailable"}`. Request bodies are validated with Zod.
Responses carry `Cache-Control: no-store`.

### `GET /api/links/current`

Who am I: the link the bearer token opens.

```json
{
  "link": { "id": "Xk2p9QmZ1aBc", "name": "Smith wedding", "isRoot": true,
            "can": { "download": true, "single": true, "sets": true } },
  "collections": [{ "id": "k7Qm2xPa", "title": "Wedding gallery", "count": 412, "new": 38,
                    "nextDelivery": "full reception, about Dec 5", "cover": { "thumb": "<signed url>" } }],
  "made": [{ "id": "…", "name": "Family", "scope": "filter", "count": 64,
             "can": { "download": false, "single": true, "sets": false }, "showPreview": true,
             "active": true, "createdAt": "2026-11-23T15:00:00Z", "children": 2 }]
}
```

### `GET /api/collections/:id`

Items the token covers in that collection, in timeline order, with signed URLs (one hour).

```json
{ "collection": { "id": "k7Qm2xPa", "title": "…", "range": { "unit": "time", "from": "13:30", "to": "18:00" } },
  "facets": { "stage": ["Getting ready", "Ceremony"], "where": ["…"], "people": ["…"], "type": ["…"] },
  "moments": [{ "id": "m-ceremony", "label": "3:05 PM", "sub": "Ceremony · Garden", "at": 0.29, "items": ["<itemId>", "…"] }],
  "items": [{ "id": "…", "kind": "photo", "w": 2560, "h": 1707, "thumb": "<signed>", "preview": "<signed>",
             "takenAt": "…", "facets": { "stage": ["Ceremony"] }, "new": true, "alt": "…" }],
  "nextCursor": null }
```

Paginated at 200 items (`?cursor=`). Shares receive the same shape narrowed to their scope.

### `POST /api/links`

Make a share from the current link.

```json
{ "name": "Family", "scope": "selection", "items": ["<id>", "…"],
  "filter": null, "follow": false,
  "can": { "download": false, "single": true, "sets": false }, "showPreview": true }
```

`scope` is `selection`, `filter` (with `filter` and `follow: true`) or `item` (one id). Returns
`201 { "id", "url": "https://<domain>/s/<id>/#<token>", "embed": "<iframe …>" }`. Requires
`can_make_shares`, or `can_share_single` when `scope = "item"` with all `can` false.
Rate-limited per link.

### `PATCH /api/links/:id`

Rename, change `showPreview`, or lower permissions on a link made from the current link. Raising
a permission above the parent's is refused with `422`.

### `DELETE /api/links/:id`

Turn off a link made from the current link (or the current link itself if it is a child, from its
parent's holder). Idempotent. Returns `204`.

### `GET /api/download`

`?item=<id>` → `302` to a 5-minute presigned URL with `Content-Disposition: attachment`.
`?collection=<id>&all=1` → `302` to the prebuilt zip, or `200` with a list of presigned URLs for
in-browser zipping. Requires Download on the whole chain. Logs `download` / `download_all`.

### `POST /api/contact`

`{ name, email, message, trap, turnstileToken, source }` → validates, verifies Turnstile, rejects
a filled `trap` silently with `200`, rate-limits, stores an `enquiries` row, emails Mark through
Resend. Returns `200 { ok: true }` or `422` with field errors in words. Works without JavaScript as
a normal form post that redirects to `#contact-sent`.

### `GET /oembed`

`?url=https://<domain>/studio/<work>/<n>/&maxwidth=…&format=json` →

```json
{ "version": "1.0", "type": "rich", "provider_name": "Mark Kurtz", "provider_url": "https://<domain>",
  "title": "Iceland, photo 2", "author_name": "Mark Kurtz", "width": 1200, "height": 800,
  "html": "<iframe src=\"https://<domain>/embed/studio/iceland-2025/2/\" width=\"1200\" height=\"800\" title=\"Iceland, photo 2 by Mark Kurtz\" loading=\"lazy\" style=\"border:0\"></iframe>",
  "thumbnail_url": "https://media.<domain>/studio/iceland-2025/<id>/800.webp", "thumbnail_width": 800, "thumbnail_height": 533,
  "license_url": "https://creativecommons.org/licenses/by-nc/4.0/" }
```

Only Studio URLs are accepted; client shares are not discoverable through oEmbed.

### Admin

Server actions under `src/server/actions/admin/*`, each beginning `await requireAdmin()`:
`createCollection`, `updateCollection`, `tagItems`, `markDelivery`, `createRootLink`,
`updateLink`, `turnOffLink`, `reissueLink` (bumps `token_version`), `archiveCollection`,
`markEnquiryHandled`.

## 4. Errors

| Case | Response | Page |
| --- | --- | --- |
| Unknown public path | 404 | `/404` with doors and search |
| Bad, unknown, expired or turned-off token | API 404 `link_unavailable` | `/link-expired/` |
| Rate limited | API 429 with `Retry-After` | "Too many tries. Wait a few minutes and open the link again." |
| Server error | 500 | `error.tsx`: "Something broke on my side. Try again, or write to me." |
