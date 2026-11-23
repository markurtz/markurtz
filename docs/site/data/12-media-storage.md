# 12 · Media pipeline and storage

Status: buckets, CLI and video files **Locked** (plan §10, video 2026-11-21); widths and formats
**Default**.

## 1. Where media lives

| Store | Access | Holds |
| --- | --- | --- |
| Git (`public/`) | Public, built into the site | Icons and page art (SVG), favicons, PNG copies where required, fonts |
| **Public bucket** (Cloudflare R2, `media.<domain>`) | Public, long cache, CORS for the site | Studio and Workshop photo derivatives, film MP4s, posters and preview clips, og:image crops, design files, self-hosted talk thumbnails |
| **Private bucket** (R2) | No public access; presigned URLs only, minutes long | Client originals, client derivatives, client films, zips, share preview crops |
| YouTube | Third party | Talk recordings only |
| Laptop (`~/Exports/<item>/`) | Mark | Export folders the CLI uploads from |

No location data ever reaches a public derivative. Originals are stored byte for byte, privately.

## 2. Photos

Every derivative is sRGB, auto-rotated, metadata stripped.

| Use | Widths (long edge for private) | Format | Notes |
| --- | --- | --- | --- |
| Public photos | 480, 800, 1200, 1600, 2400 | AVIF and WebP | `srcset` with explicit `width`/`height`; the mock uses 800 and 1600 WebP |
| Client thumbnails | 640 | WebP | Timeline rail |
| Client previews | 2560 | WebP | Viewer |
| Client originals | as shot | as shot | Download only |
| Blur placeholder | — | ThumbHash string | Stored in `photos.json` / `items.thumbhash` |
| **Preview crop** (og:image) | 1200 × 630 | JPEG, quality 82 | Cropped around `focus`; one per Studio photo, one per share with previews on |

Keys:

```text
public:   studio/<work>/<photoId>/<width>.<avif|webp>
          studio/<work>/<photoId>/og.jpg
          workshop/<page>/<project>/<photoId>/<width>.<avif|webp>
          files/<project>/<filename>
private:  collections/<collectionId>/<itemId>/original.<ext>
          collections/<collectionId>/<itemId>/preview.webp
          collections/<collectionId>/<itemId>/thumb.webp
          collections/<collectionId>/archive.zip
          shares/<linkId>/og.jpg
```

Ids are UUIDs, so keys are not guessable even in the public bucket.

## 3. Films

Locked 2026-11-21: plain MP4 files from own storage, no streaming service, about 1080p.

| File | Spec |
| --- | --- |
| Main | MP4, H.264 High, AAC, `+faststart`, ~1080p long edge, CRF ~21 (≈ 6–8 Mb/s) |
| Poster | First strong frame, AVIF/WebP at 1600 and 800, plus `og.jpg` 1200 × 630 |
| Preview clip | Muted, looping, 6 to 10 s, 480p, H.264, < 1 MB; loads on first hover only |
| Captions | WebVTT for any film with speech; a one-line text description for silent films |

Keys mirror photos: `studio/<work>/film/{main.mp4, preview.mp4, poster-<w>.<fmt>, og.jpg, captions.vtt}`;
client films use the private bucket with the same names.

## 4. The media CLI

One command for everything, run on Mark's laptop (`scripts/media/`, `pnpm media …`).

```bash
pnpm media upload ./exports/iceland --studio iceland-2025          # public Studio work
pnpm media upload ./exports/bench   --workshop builds/entryway-bench
pnpm media upload ./exports/smith   --collection k7Qm2xPa [--delivery "first look"]
pnpm media film   ./exports/iceland/film.mov --studio iceland-2025 [--captions film.vtt]
pnpm media og     --studio iceland-2025 [--item 3 --focus 0.4,0.3]   # recrop a preview
pnpm media talks                                                      # fetch and self-host talk thumbnails
pnpm media upload … --dry-run | --concurrency 6 | --archive
```

For each file the pipeline reads dimensions, capture time and EXIF; computes a ThumbHash; renders
derivatives with `sharp` (films with `ffmpeg`); uploads through the `MediaStorage` interface
(`r2` or `local` driver); then either writes `photos.json` beside the content (public, committed to
git) or inserts `items` rows and a `deliveries` row (private). Uploads are idempotent by content
hash, so a re-run resumes. `--archive` builds the collection zip.

`MediaStorage` (from PR #3, unchanged): `put`, `signedGetUrl`, `delete`, `exists`.

## 5. Delivery to the browser

| Case | How |
| --- | --- |
| Public photo | `<img srcset sizes width height>` from `media.<domain>`; the page's first image `fetchpriority="high"`, the rest `loading="lazy"`; ThumbHash placeholder. No Vercel image optimiser. |
| Public film | `<video preload="none" poster>`; preview clip `src` set on first hover; touch devices keep the poster |
| Client thumb and preview | The API signs URLs after the access check, one hour, returned with the item list |
| Client single download | `GET /api/clients/download?item=<id>` with the bearer token: re-check access and Download, log, redirect to a 5-minute presigned URL with `Content-Disposition: attachment` |
| Client download all | Prebuilt `archive.zip` when present, else a zip streamed in the browser from presigned URLs (`client-zip`); needs a CORS `GET` rule on the private bucket for the site origin |
| Share preview crop | `/s/<id>/og.jpg` route: checks the link is active and `show_preview`, then redirects to a 10-minute presigned URL of `shares/<id>/og.jpg`; else the Clients banner |

## 6. Formats rule for marks and art

SVG first everywhere it works, plus `favicon.ico`. PNG only where required: `apple-touch-icon`
(180), manifest icons (192, 512, maskable 512), and `og:image`/`twitter:image` banners (1200 × 630).
No JPEG or WebP for icons or art ([32](../design/32-mark-icons.md#formats)). Photo preview crops are
JPEG because every preview bot reads it.
