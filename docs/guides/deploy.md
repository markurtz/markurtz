# Deploying and going live

The public site needs only Vercel. The private areas (client galleries, gated pages) add Supabase and Cloudflare R2. Everything below is on free plans unless noted, and none of it has been created for you: these are the steps only the account owner can do.

## 1. Public site on Vercel

1. In Vercel, import the `markurtz/markurtz` repository. The defaults are right (Next.js, `pnpm build`).
2. Add the environment variable `NEXT_PUBLIC_SITE_URL` with your final address, for example `https://example.com`.
3. Set `productionUrl` in [`site.config.ts`](../../site.config.ts) to the same address. The profile README and blog syndication use it.

Every pull request gets a preview deployment and every merge to `main` goes to production.

> [!IMPORTANT]
> Vercel's free Hobby plan is for non-commercial use. Paid client photography is commercial, so plan on Vercel Pro (about $20 a month) before delivering paid shoots through the client area. The personal site alone is fine on Hobby.

## 2. Domain: keep Squarespace as registrar, move DNS to Cloudflare

Squarespace stays the place you renew the domain. Cloudflare answers DNS, which is free and is also what R2 needs for a media subdomain.

1. In Cloudflare, add the domain (free plan). It imports the existing records. **Check that every email record (MX, SPF/TXT, DKIM) was copied** before continuing, or mail will stop.
2. In Squarespace, open the domain, choose custom nameservers and enter the two Cloudflare gave you. In the same place, turn off DNSSEC first if it is on (turn it back on from Cloudflare afterwards).
3. In Vercel, add the domain to the project. It shows the records to create.
4. In Cloudflare DNS, create them with the proxy **off** (grey cloud, "DNS only"):

   | Type  | Name  | Value                                                      |
   | :---- | :---- | :--------------------------------------------------------- |
   | A     | `@`   | The address Vercel shows (currently `76.76.21.21`)         |
   | CNAME | `www` | The target Vercel shows (currently `cname.vercel-dns.com`) |

5. Wait for Vercel to show the domain as valid, then choose which of the bare and `www` names redirects to the other.

Nameserver changes can take up to a day. The site keeps working at its `vercel.app` address meanwhile.

## 3. Database and sign-in on Supabase

1. Create a project. Note the database password.
2. Under Connect, copy the **transaction pooler** string into `DATABASE_URL` and the **direct** string into `DATABASE_URL_DIRECT`.
3. Under API settings, copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`, the publishable key into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the secret key into `SUPABASE_SECRET_KEY`.
4. Under Authentication: turn off public sign-ups, add `https://<your domain>/**` to the redirect URLs, and change the email template for the magic link so it contains the code (`{{ .Token }}`), since sign-in here is by code.
5. Apply the schema: add `DATABASE_URL_DIRECT` as a secret on a GitHub environment named `production` (give that environment yourself as a required reviewer), then run the **Database Migrations** workflow. Or locally: `pnpm db:migrate` with the value in `.env.local`.

Every table has row level security on with no policies, so the public Supabase API can read nothing. The site talks to the database only from the server.

## 4. Photo storage on Cloudflare R2

1. Create two buckets: one public (for example `site-public`) and one private (`site-private`).
2. Give the public bucket a custom domain such as `media.<your domain>` and put it in `NEXT_PUBLIC_MEDIA_URL`. Leave the private bucket with no public access at all.
3. Create an API token with object read and write on those two buckets only. Fill `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BUCKET` and `R2_PRIVATE_BUCKET`.
4. On the **private** bucket, add this CORS policy so the browser can build zip downloads:

   ```json
   [
     {
       "AllowedOrigins": ["https://<your domain>"],
       "AllowedMethods": ["GET"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

## 5. Remaining secrets, then switch on

In the Vercel project's environment variables (Production, and Preview if you want previews to work too), add everything from sections 3 and 4 plus:

| Variable                   | Value                  |
| :------------------------- | :--------------------- |
| `ADMIN_EMAILS`             | Your email address.    |
| `GALLERY_SESSION_SECRET`   | `openssl rand -hex 32` |
| `IP_HASH_SALT`             | `openssl rand -hex 16` |
| `CRON_SECRET`              | `openssl rand -hex 32` |
| `FEATURE_CLIENT_GALLERIES` | `true`                 |
| `FEATURE_GATED_PAGES`      | `true` (optional)      |

Leave `AUTH_DRIVER` and `STORAGE_DRIVER` unset in production. A deployment with a feature switched on and a value missing fails at build time and says which one.

For housekeeping, in the GitHub repository settings add the variable `SITE_URL` (your address) and the secret `CRON_SECRET` (same value as in Vercel) so the daily **Keepalive** workflow can keep the free database awake and archive expired galleries. Add `DATABASE_URL_DIRECT` and a `BACKUP_PASSPHRASE` secret to turn on the weekly encrypted **Database Backup**.

The contact form is optional: create a Resend account, verify the domain, set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`, and turn on `features.contact`.

## 6. Go-live checklist

- [ ] Placeholders replaced (search for `TODO`) and sample content deleted.
- [ ] `productionUrl` set, `pnpm readme:generate` run and committed.
- [ ] Domain valid in Vercel, with HTTPS, and email still arriving.
- [ ] `/api/health` on the live site reports `"database": "ok"`.
- [ ] Signed in at `/admin`, created a test gallery, opened it in a private window with the passcode, then deleted it.
- [ ] Browser console on a few pages shows no Content-Security-Policy reports. Then, in `next.config.ts`, rename the header from `Content-Security-Policy-Report-Only` to `Content-Security-Policy` to enforce it.
- [ ] Branch protection on `main` requires the `CI Passed` check.

## Local development without any accounts

```bash
FEATURE_CLIENT_GALLERIES=true
FEATURE_GATED_PAGES=true
DATABASE_URL=pglite://.data/dev/db
AUTH_DRIVER=dev
STORAGE_DRIVER=local
ADMIN_EMAILS=you@example.com
GALLERY_SESSION_SECRET=local-development-only-secret-0123456789
IP_HASH_SALT=local
```

With these in `.env.local`, the database is a local file, photos stay on disk under `.data/`, and the sign-in code is always `000000`. The development drivers refuse to run on Vercel.
