# 21 · Access control and security

Status: the model is **Locked** (Mark, 2026-11-23: "token only, JWT after # in the link, saved to
a cookie, sent via the auth header; per-token permissions"). Algorithms, lifetimes and limits are
**Default**.

## 1. Principals

| Who | Proves it with | Can |
| --- | --- | --- |
| Anyone | — | Public pages, feeds, Studio embeds |
| Link holder | A link token (JWT) | What the link covers, with the link's three permissions |
| Preview bot | A share's path id only | That share's og tags and preview crop, if the share is active and allows previews |
| Mark | Supabase Auth session, email on the allow-list | Everything, through `/admin` |

There are no client accounts, passwords or access codes.

## 2. Link tokens

### Format

A compact JWS (JWT), signed with **ES256** (P-256). Short, standard, verifiable without a
database call, and rotatable by key id.

```text
header  { "alg": "ES256", "kid": "2026-11", "typ": "JWT" }
payload { "iss": "https://<domain>", "aud": "mk-links", "sub": "<link id>", "ver": 1, "iat": 1795400000 }
```

- `sub` is the link's id (also the `/s/<id>/` path id).
- `ver` must equal `links.token_version`. Bumping it invalidates every copy of that link's token
  without turning the link off (used for "reissue the link").
- No `exp`: links last until turned off (Locked P5.7). Expiry, when Mark sets one, is checked in
  the database.
- Permissions are **not** in the token. The database is the only authority, so a change or a
  turn-off applies on the next request.

The token is about 250 characters; links stay short enough for email and chat.

### Addresses

| Link | Address |
| --- | --- |
| Mark's root link for a collection | `https://<domain>/clients/#<token>` |
| A share made from a link | `https://<domain>/s/<id>/#<token>` |
| A share's embed | `https://<domain>/s/<id>/embed/#<token>` |

### In the browser

1. The page reads `location.hash`, accepts either a bare token or `code=<token>` (older links),
   then removes the hash with `history.replaceState`.
2. It stores the token in the cookie **`__Host-mk_links`** (`Secure; SameSite=Strict; Path=/;
   Max-Age=34560000`, 400 days), a JSON map of link id → token so one browser can hold several
   links. The cookie is deliberately **not** `HttpOnly`: the script reads it to set the header.
3. Every API call sends `Authorization: Bearer <token>` for the link in use.
4. "Forget this browser" deletes the cookie entry. It does not turn the link off.

### On the server

- The API **reads only the `Authorization` header**, never the cookie. Because a cross-site page
  cannot set that header on a request to this origin, there is no CSRF path, and `SameSite=Strict`
  keeps the cookie off cross-site requests anyway.
- Verification order: parse → check `alg` is ES256 and `kid` is known → verify signature →
  `aud` and `iss` → load the link chain (`resolveLink`, [11 § 4](../data/11-database-schema.md#4-effective-access))
  → `ver` matches → every link in the chain active and unexpired → collection live.
- Every failure returns the **same** `404 { "error": "link_unavailable" }` and the page shows
  `/link-expired/`. Unknown id, bad signature, turned off and expired are indistinguishable.
- Logging: tokens are never logged. Request logging strips `Authorization` and the
  `__Host-mk_links` cookie.

### Keys

Private keys live only in the environment (`LINK_SIGNING_KEYS`, JWK set with `kid`). The public
keys are not secret but are not published. Rotation: add a new `kid`, sign new links with it, keep
old keys for verification until their links are reissued or turned off.

## 3. Permissions

| Action | Requires |
| --- | --- |
| View items covered by the link | Active chain |
| See signed thumbnails and previews | Active chain |
| Download one original or all | Active chain and `can_download` on every link in the chain |
| Copy a link to one photo or film (makes a view-only child share) | `can_share_single` |
| Embed a photo (makes a view-only child share) | `can_share_single` |
| Select and make a new share | `can_make_shares` |
| Give a child share a permission | The holder has it (no escalation, invariant I2) |
| See and turn off links made from this link | Active chain (holder of an ancestor) |
| Turn off this link itself | Holder of its parent, or Mark |

Pure functions `evaluateLinkAccess(chain, action)` hold these rules and have unit tests for every
row; route handlers call them, never re-implement them.

## 4. Turning links off

- Turning a link off sets `revoked_at` on that link only. Its descendants fail the chain check on
  their next request, so the cascade is immediate and needs no extra writes.
- Already-issued presigned URLs keep working for their lifetime (thumbnails and previews up to one
  hour, downloads five minutes). Accepted; documented on the Privacy page.
- An embed made from a turned-off share stops loading.

## 5. Rate limits

Atomic fixed windows in Postgres. Never check and then record: one statement both counts and
decides (fixes the PR #3 race).

```sql
insert into rate_limits (key, window_start, count)
values ($1, to_timestamp(floor(extract(epoch from now()) / ($2 * 60)) * ($2 * 60)), 1)   -- $2 = window in minutes
on conflict (key, window_start) do update set count = rate_limits.count + 1
returning count;     -- proceed only if count <= limit
```

| Key | Limit | Window |
| --- | --- | --- |
| `fail:<ipHash>` (failed token checks) | 20 | 15 min |
| `fail:<linkId>` | 50 | 15 min |
| `share:<linkId>` (new shares from one link) | 60 | 60 min |
| `download:<linkId>` | 600 | 60 min |
| `contact:<ipHash>` | 5 | 60 min |

`ipHash` is HMAC-SHA-256 of the client IP with a server secret, taken only from
`src/server/auth/request.ts`.

## 6. Response headers

| Header | Public pages | Client pages, shares, API | Embeds |
| --- | --- | --- | --- |
| `Content-Security-Policy` | Strict (below), `frame-ancestors 'none'` | Same | Same but `frame-ancestors *` |
| `X-Robots-Tag` / meta robots | index | `noindex, nofollow` | `noindex` |
| `Cache-Control` | Long, immutable assets | `no-store` | Public, short |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | `no-referrer` | `no-referrer` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Same | Same |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=(), … | Same | Same |
| `X-Content-Type-Options` | `nosniff` | Same | Same |
| `Cross-Origin-Opener-Policy` | `same-origin` | Same | — |

CSP (production; report-only for the first week, then enforced):

```text
default-src 'self';
script-src 'self' 'nonce-…' 'strict-dynamic' https://challenges.cloudflare.com;
style-src 'self';
img-src 'self' data: blob: https://media.<domain> https://<private-r2-host>;
media-src 'self' https://media.<domain> https://<private-r2-host>;
font-src 'self';
connect-src 'self' https://<private-r2-host>;
frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com;
base-uri 'none'; form-action 'self'; object-src 'none';
require-trusted-types-for 'script';
```

Because the link cookie is readable by script, XSS is the main risk to a link. The defences are
this CSP (no inline scripts, no third-party scripts except Turnstile), Trusted Types, React's
escaping, no `dangerouslySetInnerHTML` outside the MDX pipeline, and no user content rendered as
HTML anywhere in the client area.

## 7. Threat model

| Threat | Mitigation |
| --- | --- |
| Guessing a link | Forging a token means breaking an ES256 signature (about 128-bit security); path ids carry ~71 bits and open only a preview; uniform 404; per-IP and per-id failure limits |
| A link leaks (forwarded email, screenshot) | Holder or Mark turns it off; cascade; access log shows opens |
| Token in server logs or Referer | Token only after `#`; `no-referrer`; header and cookie stripped from logs |
| Preview bot over-exposure | Bots see only og tags and one small crop, only when the share allows previews |
| Escalation through shares | DB triggers and API checks: a child never exceeds its parent, never leaves its collection |
| CSRF | API authenticates only by `Authorization` header |
| XSS stealing the cookie | Strict CSP, Trusted Types, no third-party script |
| Enumerating collections | Short random ids; `/clients/g/<id>/` needs a token covering it; uniform errors |
| Direct storage access | Private bucket; presigned URLs minutes long, per item |
| Hotlinking public media | Accepted for CC BY-NC photos; Cloudflare caching absorbs cost |
| Contact spam | Turnstile, hidden trap, rate limit, server-side validation |
| Admin takeover | Allow-list of one email; short sessions; passkey (Open D2); `requireAdmin()` first everywhere |
| Leaked private data in the public repo | Never commit private media or dumps; secret scanning in CI; backup fix below |

## 8. Review findings from PR #3

The code review of PR #3 at `e2ee8b4` raised three **High** findings. Client galleries stay off in
production until each is fixed and verified (launch criterion 4).

| Finding | Status in this design |
| --- | --- |
| **Unlock rate-limit race**: the counter was read, then incremented, so parallel requests all passed | Fixed by the atomic upsert in § 5; `consumeAttempt()` returns the decision from the same statement. Test: 50 parallel bad tokens admit at most the limit. |
| **Database backup artifact on a public repo**: `db-backup.yml` uploaded a plain dump as an Actions artifact | Remove the artifact. Either encrypt with `age` to an offline key and store in the private bucket, or rely on Supabase backups ([11 § 7](../data/11-database-schema.md#7-backups)). |
| **Share links not revocable** | Every share is a `links` row with `revoked_at`, checked on every request, cascading to descendants (§ 4). |

## 9. Privacy

- No cookies on public pages except the theme preference (`localStorage`) and, only for people who
  opened a client link, `__Host-mk_links`.
- No third-party requests on public pages until the visitor presses play on a talk
  (`youtube-nocookie.com`) or opens the contact popup (Turnstile).
- Page counts: none at launch, or a cookieless tool (**Open** D12).
- IPs are stored only as keyed hashes. Retention in [11 § 6](../data/11-database-schema.md#6-retention).
