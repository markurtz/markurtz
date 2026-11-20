# Client galleries

The client area lets you deliver a shoot privately: a gallery opens with a passcode or for invited people who sign in by email, clients can mark favorites, build their own collections and share those with a link, and you control downloads and expiry.

It is off until the backend is configured. See [deploy.md](deploy.md) for the one-time setup, then set `FEATURE_CLIENT_GALLERIES=true`.

## Deliver a shoot

1. Sign in at `/admin` with an email listed in `ADMIN_EMAILS`.
2. Create a gallery with a short link name (the slug). On its page, under Passcode, set one, or leave the field empty to have four words generated. **The passcode is shown once.** Copy it then; only a hash is stored.
3. Upload from the folder of exported photos:

   ```bash
   pnpm photos upload ./exports/smith-wedding --gallery smith-wedding --archive
   ```

   This needs the production values in `.env.local` (database, R2). It uploads the original plus a preview and thumbnail for each photo into the **private** bucket, resumes if interrupted, and with `--archive` also builds one zip for "Download all".

4. In the admin page for the gallery, choose a cover, set an expiry date if you want one, and switch the status to **Published**.
5. Send the client the link (`/clients/g/<slug>`) and the passcode, preferably through two different channels.

## Access options

| Option          | How it works                                                                                                                                                                                                                                                    |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Passcode        | Anyone with the link and passcode. Five tries from one address lock it out for 15 minutes, and 100 tries an hour from everyone together close the gallery's passcode entry for the rest of the hour. A passcode you type yourself needs at least 12 characters. |
| Invited clients | Add an email under "Invited clients". They sign in at `/clients/sign-in` with a code sent by email and see every gallery they are invited to. Their collections belong to them personally.                                                                      |
| Change passcode | Setting a new passcode signs out everyone who used the old one, immediately. By default it also stops every share link clients made in the gallery, so nobody keeps a way back in. Untick the box to leave the links working.                                   |
| Expiry          | After the date the gallery stops opening for clients. You can still see it as admin.                                                                                                                                                                            |
| Downloads       | "Allow downloads" controls whether originals can be downloaded at all.                                                                                                                                                                                          |

## What clients can do

- Browse and open photos full screen, and mark favorites.
- Select photos and add them to a named collection.
- Share a collection with a link that shows only those photos, optionally with its own passcode and expiry, and stop sharing at any time.
- Download single photos, a selection, or everything (when downloads are allowed).

## Share links are separate from the passcode

A share link opens one collection without the gallery passcode, and whoever has the link can pass it on. You stay in control of them:

- The gallery page in the admin lists every client collection, marks the shared ones, and has **Stop sharing** and **Delete** for each.
- Changing the gallery passcode stops all of its share links unless you untick that option.
- Removing an invited client stops the share links of the collections they made.
- A share link never outlives the gallery: when the gallery expires or is unpublished, its links stop too.

## Downloads

Single photos and small selections download straight from the browser as a zip. Selections above 40 photos are streamed to a file the client chooses, which works in Chrome and Edge on a computer. For whole galleries, upload with `--archive` so "Download all" serves one prebuilt zip that works everywhere, including phones.

Downloaded originals are the files you uploaded, unchanged. They keep their camera details and, if your export included it, GPS location. The previews shown in the browser have location removed. If location should not reach clients or the people they share with, remove it when exporting from your photo software.

## What protects the photos

- Client photos are stored in a private bucket with no public address. The site hands out short-lived signed links only after checking access on every request.
- Private pages are never cached, never indexed, and send no referrer.
- Share links and passcodes are stored only as hashes. A lost passcode cannot be recovered, only replaced.
- The admin "Log" page shows unlocks, failed attempts and downloads.

> [!IMPORTANT]
> Anyone who can view a photo can save or screenshot it. Passcodes and expiry control who gets in, not what they do afterwards.

## Gated pages

`/p/<key>` pages work the same way for a single private page. Because this repository is public, treat anything in `content/private/` as visible to people who look at the source: use gated pages for unlisted material, not for secrets. Create the gate and its passcode under Admin, Gates, and set `FEATURE_GATED_PAGES=true`.
