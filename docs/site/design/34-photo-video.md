# 34 · Photography and video

Status: **Locked** (brand system 1.0; components final 2026-11-21; video hosting 2026-11-21;
Studio final 2026-11-22; share buttons 2026-11-23).

## 1. Photos

- **Untouched presentation.** Photos are shown as Mark edited them: no filters, overlays, rounded
  crops inside galleries or forced aspect ratios in justified rows. Cards crop with `object-fit:
  cover` around the photo's focus point.
- **Justified rows** on work pages and client galleries; title-on-photo cards and mosaics on
  `/studio`; framed cards on Workshop and Blog.
- **Order is time.** Work pages and client galleries sit on the day-by-day (or hour-by-hour)
  timeline rail built from capture times.
- **Alt text** is required for every public photo before launch; captions are optional and short.
- **Location data** is stripped from every public derivative.
- **Stand-ins**: until Mark's own sets are in, the mock uses credited stand-ins (Wikimedia Commons,
  Unsplash). All go before launch.

## 2. Licence

Public photos and films are **CC BY-NC** (Locked). Shown on every work page ("Photos and the film
on this page are licensed CC BY-NC."), in the footer base row, on `/colophon/`, in the "Copy credit
line" action, and in oEmbed `license_url`. Client work is not licensed publicly; shares are view
only unless downloads are allowed.

## 3. Films

Mark's own films (shoot films, trip edits, build time-lapses) are hosted on the site, not on
YouTube. Talk recordings stay on YouTube, loaded on click.

| Where | How it plays |
| --- | --- |
| Home row | Card with Film pill; muted preview on hover |
| `/studio` | Still poster with play mark and length; no hover preview |
| Work page | Cinema band at the top: navy, up to 1100 px at 16:9, native controls, poster |
| Viewer | In the same set as photos, with a play mark; pauses when the viewer moves on |
| Workshop project | Time-lapse or process clip in the build log |
| Blog post | Inline film with native controls |
| Client gallery | Beside the photos, same access rules |
| Share | One film, view only, download if allowed |

Files per film ([12 § 3](../data/12-media-storage.md#3-films)): MP4 (H.264, faststart, about
1080p), poster, a short muted preview clip, captions for speech, a one-line description for silent
films. No streaming service.

## 4. Single-item pages and previews

Every Studio photo and film has its own page (`/studio/<work>/<n>/`, `/film/`) so it can be
linked, embedded and previewed. Each has a **1200 × 630 crop** as its `og:image`, cropped around
the focus point. Client shares preview their first item the same way when "Show a preview" is on.

## 5. Sharing actions

Copy link, Embed and More on every photo and film in Studio and Clients, on cards, on item pages
and in the viewer. Full behaviour in
[04 § 6](../product/04-clients-sharing-embeds.md#6-the-three-buttons-on-every-photo-and-film).

## 6. Kit

The camera, lenses and editing tools are one list in `uses.yaml` (Camera and editing). It feeds
`/uses/`, Studio's "What I shoot with" foot and the facts panel on every work page, so the three
never disagree. All **Held** until Mark lists his kit.
