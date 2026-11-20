# Public photo albums

Public albums are the photography and travel pages under `/photos`. (Private client galleries are covered in [client-galleries.md](client-galleries.md).)

## Create an album

```bash
pnpm new album "Iceland 2026"
pnpm photos upload ./exports/iceland --album iceland-2026
```

The first command creates `content/albums/iceland-2026/index.mdx`, where the title, date, location and description live. The second resizes every image in the folder to web sizes (WebP at 640, 1280 and 2560 pixels wide), strips location data, reads the camera details, and writes `photos.json` next to the album file. Add `--dry-run` to see what would happen. Re-running the upload skips photos that are already there.

Then edit `photos.json` to add `alt` text and captions, pick a `cover` in `index.mdx`, and commit.

## Where the files go

| `STORAGE_DRIVER` | Images are written to                                     | Use it when                                       |
| :--------------- | :-------------------------------------------------------- | :------------------------------------------------ |
| `local`          | `public/media/albums/<slug>/`, committed with the site    | A few small albums and no storage account yet.    |
| `r2`             | The public R2 bucket, served from `NEXT_PUBLIC_MEDIA_URL` | Anything beyond that. Keeps the repository small. |

Originals are never uploaded for public albums, only the resized copies.

> [!CAUTION]
> Never put client or private photos in a public album or anywhere under `public/`. Everything in this repository is public.
