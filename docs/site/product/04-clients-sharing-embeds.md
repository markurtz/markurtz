# 04 · Clients, sharing and embeds

Status: **Locked** 2026-11-23 (link-only access, mock v48; share buttons and embeds, mock v51;
buttons in the photo viewer requested the same day). This document supersedes the access-code and
sign-in wording in the structure spec and in the Studio page final.

## 1. What the client area is for

A general area for hosted work: photography first, films beside the photos, files later. Mark
delivers a shoot; the client sees every photo in the order it happened, downloads them if allowed,
and shares some of them with family and friends without Mark's help. Nothing in it is public,
except what a client deliberately shares.

## 2. The model: the link is the key

There are **no accounts, passwords, access codes or sign-in pages** for clients.

- **CL-1** Every client address is opened by a **link**. A link is an address plus a signed token
  (a JWT) after `#`: `https://<domain>/clients/#<token>` for links Mark makes, and
  `https://<domain>/s/<id>/#<token>` for shares made from them.
- **CL-2** The part after `#` never reaches the server on page load, server logs, `Referer`
  headers or link-preview bots. The page script reads it.
- **CL-3** The browser keeps the token in a cookie so the client does not need the link again;
  the script sends it to the API in an `Authorization: Bearer` header. "Forget this browser"
  deletes it. Forgetting does not turn the link off.
- **CL-4** The token in the link and the server's record must both agree: a valid signature alone
  never grants access; the link must exist and be active in the database on every request, so
  turning a link off takes effect on the next request ([21](../engineering/21-access-security.md)).
- **CL-5** There is no difference between "a link" and "a code": the token is the only secret.
  Pasting the whole link, or just the part after `#`, into "Paste your link" works the same.

## 3. What a link allows

Every link states three permissions. Each is off unless granted (Locked 2026-11-23):

| Permission | Lets the holder | Shown as |
| --- | --- | --- |
| **Download** | Save full-size originals, one by one or all as a zip | "Download · Save the full-size photos" |
| **Share single photos** | Copy a link to any one photo or film | "Share single photos · Copy a link to any one photo or film" |
| **Make new shares** | Select photos and make a new link from them | "Make new shares · Pick photos and make a new link from them" |

Viewing is always allowed. Rules:

- **CL-10** A link never allows more than the link it was made from. The share sheet disables a
  permission the holder does not have.
- **CL-11** A link covers either a **collection** (everything in it, including later deliveries),
  a **selection** (a fixed list of items), a **filter** of a collection that "keeps updated", or a
  **single item**.
- **CL-12** Turning a link off ends it everywhere it was opened, **and every link made from it**,
  however deep. Turned-off links open `/link-expired/`.
- **CL-13** Links last until turned off. There is no expiry by default (Locked P5.7). Mark can set
  an expiry in `/admin` (Default).
- **CL-14** A link made by a client belongs to the link it was made from. The holder of a link sees
  and can turn off every link made from it ("Links you've made"); Mark sees all of them.

## 4. Link previews for shares

Preview bots (Slack, iMessage, X, WhatsApp) never see the `#` part, so a share address carries a
random **path id**: `/s/<id>/#<token>` (Locked 2026-11-23).

- **CL-20** With the path id alone, the server renders only `og:` tags: title "<Share name>",
  description "N photos by Mark Kurtz, shared with you.", and a **1200 × 630 preview crop of the
  first photo**. Nothing else: no list of items, no full-size media.
- **CL-21** Each share has a "Show a preview when the link is pasted" option, **on by default**,
  noting "a small copy of the first photo, visible to whoever has the link". Off: the preview shows
  the generic Clients banner.
- **CL-22** The full page (all items, full sizes, downloads) needs the token.
- **CL-23** `/s/` is **allowed** in `robots.txt` so bots can fetch the preview; every share page
  sends `noindex` and stays out of the sitemap. `/clients/` stays disallowed.
- **CL-24** `/clients/#<token>` links from Mark use the generic Clients banner as their preview.

## 5. Pages

### 5.1 `/clients/`: Open your photos / Your photos

- With no stored token: the "Open your photos" card ([03](03-page-specs.md#clients)). Opening a
  link stores the token and removes the `#…` from the address bar (`history.replaceState`).
- With a stored token: "Your photos": what this link allows (three checks), **From Mark**
  (collections the link covers, each with "N new · More on the way" and "N photos so far"), and
  **Links you've made**.
- **Links you've made** lists, per link: name, photo stack and count, the source collection, date,
  the three permissions, "Show a preview" state, Active or Turned off, **Copy** and **Turn off**.
  Turn off asks for confirmation inline ("Turn off? Everyone with this link, and any links made
  from it, loses access." · Turn off · Keep) before it acts.
- A summary line counts links and how many are active.

### 5.2 `/clients/g/<id>/`: one collection

- **CL-30 Order.** Every photo in capture order on the **timeline rail**, scaled to the range of
  the photos: clock times for a single day, days for a trip, months for anything longer, with a
  range bar on top. Moments group photos (for a wedding: Getting ready, Ceremony, Portraits,
  Reception).
- **CL-31 Filters.** Mark tags photos ahead of time in five facets: **Part of the day**, **Where**,
  **Who**, **Kind**, **Delivery** (New). The toolbar shows an All/New switch and dropdown checkbox
  menus for the other four. Picks within a facet combine with OR, across facets with AND. Filters
  live in `?f=`. The count line reads "N photos, in the order taken"; "Clear filters" resets.
- **CL-32 Select.** A check circle on each photo (no hearts or favourites). "Select all N" selects
  only what is showing. A sticky bar shows "N selected · Clear · Make a link". Selection controls
  appear only when the link allows **Make new shares**.
- **CL-33 Make a link** (share sheet): thumbnails of the selection; **Name** (prefilled from the
  filter, e.g. "Family"); "What the link lets them do" with the three permissions (Share single
  photos on by default, others off, unavailable ones disabled) and the note "Anyone with the link
  can view. A link never allows more than yours does."; **Keep it updated** (only when made from a
  filter: "add new photos that match <filter> as Mark delivers them"); **Show a preview** (on);
  buttons **Make link** and Cancel. The new link is copied and appears under "Links you've made".
- **CL-34 Deliveries.** Mark delivers in batches. New photos carry a **New** badge until the
  holder has seen them; the meta line notes the next delivery ("Next delivery <note>").
- **CL-35 Download all** (when allowed) requests a short-lived link to a zip.
- **CL-36 Films** sit in the same timeline and viewer as photos, with a play mark.

### 5.3 `/s/<id>/`: a share

Shows exactly what the share covers, view only plus what it allows. One item shows large; several
show as justified rows. "See more of my work" links to `/studio/`. No path back to the source
collection.

### 5.4 `/link-expired/`

For any turned-off or unknown token. Same answer for "turned off", "never existed" and "malformed",
so nothing can be guessed.

## 6. The three buttons on every photo and film

Every photo and film, in Studio and in Clients, carries the same three round buttons in its top
right, on cards, on its own page **and in the full-screen photo viewer** (Mark, 2026-11-23: the
viewer currently shows only Copy link and Close and must show all three).

### Studio photos and films

| Button | Action |
| --- | --- |
| **Copy link** | Copies `https://<domain>/studio/<work>/<n>/` (or `/film/`); a toast confirms "Link copied". |
| **Embed** | Copies an iframe snippet for `/embed/studio/<work>/<n>/`, with width, height and `title`. A popover shows the snippet with Copy. |
| **More** | Menu: **Share…** (the device share sheet, `navigator.share`, hidden where unsupported) · **Open its page** · **Copy credit line** ("<Title> by Mark Kurtz · CC BY-NC · <url>"). |

### Client photos and films

| Button | Action |
| --- | --- |
| **Copy link** | One click makes a new **view-only** single-item share from the current link and copies `/s/<id>/#<token>`. The toast offers **Change**, which opens the share sheet for that link. Shown only when the link allows **Share single photos**. |
| **Embed** | Makes a view-only share and copies an iframe snippet for `/s/<id>/embed/#<token>`. The popover warns: "Anyone who can see the page you put this on can open the photo." Same permission as Copy link. |
| **More** | **Share…** (device share sheet with a new view-only link) · **Download** (only when the link allows it) · **Make a link with options…** (opens the share sheet). |

### In the viewer

The viewer (dark, photo first, filmstrip) shows the three buttons top right, before Close, for the
current item; they follow the item as the viewer moves. Keyboard: `C` copies the link, `E` opens
Embed (Should).

## 7. Embeds

- **CL-40** Studio embeds are public pages at `/embed/studio/<work>/<n | film>/`: the media filling
  the frame and a credit "<Title> · Mark Kurtz ↗" linking to the item page. `noindex`;
  `Content-Security-Policy: frame-ancestors *`; no cookies.
- **CL-41** Client embeds are `/s/<id>/embed/#<token>`: the same bare page for a share. Because the
  token is in the snippet, anyone who can read the host page can open it; the popover says so.
  Turning the share off breaks the embed.
- **CL-42** An oEmbed endpoint (`/oembed?url=…&format=json`) returns `type: "photo"` or `"video"`
  (rich iframe) for Studio items so blogs and site builders turn a pasted link into the embed. Item
  pages advertise it with `<link rel="alternate" type="application/json+oembed">` (Should).

## 8. Mark's side: `/admin`

Small and functional (Default layout):

- **Collections**: create, rename, set cover, tag items with the five facets, reorder, mark a
  delivery batch, set the next-delivery note, archive.
- **Links**: create the root link for a collection with its three permissions, copy it, see the
  tree of links made from it with last-opened time, turn any of them off.
- **Enquiries**: contact-form messages.
- **Access log**: opens, failures, views, downloads, link creation and turn-off, filterable.
- **Sign-in for Mark**: **Open** (email one-time code for his address only, already built in
  PR #3, or a passkey).

## 9. Still open

| # | Question |
| --- | --- |
| 1 | How clients hear about a new batch: Mark messages them himself (Default), an optional "email me when new photos arrive" field, or the New badge only. |
| 2 | Real gallery name for the demo ("Wedding gallery" is a placeholder). |
| 3 | `/admin` sign-in method. |
| 4 | Whether files (non-media) are in scope at launch, or photos and films only (Default: photos and films). |
