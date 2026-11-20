import { sql } from "drizzle-orm";

import { privateAreaReady } from "@/lib/features";
import { getDb } from "@/server/db/client";

export const dynamic = "force-dynamic";

/**
 * Liveness check. When the private area is configured it also runs one trivial
 * query, which keeps a free Supabase project from pausing and makes this an
 * uptime check for the database (see .github/workflows/keepalive.yml).
 */
export async function GET() {
  if (!privateAreaReady()) return Response.json({ status: "ok", database: "not configured" });
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    return Response.json({ status: "ok", database: "ok" });
  } catch {
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
