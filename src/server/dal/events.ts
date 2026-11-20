import "server-only";

import { desc, eq } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { accessEvents, galleries, gates, type AccessEventKind } from "@/server/db/schema";

/** The audit trail of unlocks, views, downloads and shares. */

/** What an event refers to and who caused it. The IP is already hashed. */
export interface AccessEventInput {
  kind: AccessEventKind;
  galleryId?: string;
  collectionId?: string;
  gateId?: string;
  ipHash: string;
  userAgent: string;
}

const MAX_USER_AGENT = 300;

/** Records an event. Never throws: logging must not break the request it describes. */
export async function recordEvent(event: AccessEventInput): Promise<void> {
  try {
    const db = await getDb();
    await db
      .insert(accessEvents)
      .values({ ...event, userAgent: event.userAgent.slice(0, MAX_USER_AGENT) });
  } catch (error) {
    console.error("Failed to record access event", error);
  }
}

/** The most recent events with the gallery or gate they belong to. Admin only. */
export async function listRecentEvents(limit = 100) {
  const db = await getDb();
  return db
    .select({
      id: accessEvents.id,
      kind: accessEvents.kind,
      at: accessEvents.at,
      ipHash: accessEvents.ipHash,
      userAgent: accessEvents.userAgent,
      galleryTitle: galleries.title,
      gateKey: gates.key,
      collectionId: accessEvents.collectionId,
    })
    .from(accessEvents)
    .leftJoin(galleries, eq(galleries.id, accessEvents.galleryId))
    .leftJoin(gates, eq(gates.id, accessEvents.gateId))
    .orderBy(desc(accessEvents.at), desc(accessEvents.id))
    .limit(limit);
}
