import { timingSafeEqual } from "node:crypto";

import { getEnv } from "@/lib/env";
import { privateAreaReady } from "@/lib/features";
import { archiveExpiredGalleries } from "@/server/dal/galleries";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = getEnv().CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Archives published galleries whose expiry has passed. Expired galleries are
 * already refused by the access checks; this keeps the admin list truthful.
 * Called daily by `.github/workflows/keepalive.yml` with `CRON_SECRET`.
 */
export async function POST(request: Request) {
  if (!authorized(request)) return new Response("Not found", { status: 404 });
  if (!privateAreaReady()) return Response.json({ archived: 0 });
  return Response.json({ archived: await archiveExpiredGalleries() });
}
