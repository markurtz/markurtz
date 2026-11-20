import "server-only";

import { asc, eq, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { gates, type Gate } from "@/server/db/schema";

/** Data access for generic passcode gates (`/p/<key>`). Callers authorize first. */

/** A gate by its key. */
export async function getGateByKey(key: string): Promise<Gate | undefined> {
  const db = await getDb();
  const [gate] = await db.select().from(gates).where(eq(gates.key, key)).limit(1);
  return gate;
}

/** Every gate. Admin only. */
export async function listGates(): Promise<Gate[]> {
  const db = await getDb();
  return db.select().from(gates).orderBy(asc(gates.key));
}

/** Creates a gate. Throws on a duplicate key. */
export async function createGate(values: {
  key: string;
  label: string;
  passcodeHash: string;
  expiresAt?: Date | null;
}): Promise<Gate> {
  const db = await getDb();
  const [gate] = await db.insert(gates).values(values).returning();
  if (!gate) throw new Error("Gate was not created");
  return gate;
}

/** Replaces a gate's passcode and revokes sessions unlocked with the old one. */
export async function setGatePasscode(id: string, passcodeHash: string): Promise<void> {
  const db = await getDb();
  await db
    .update(gates)
    .set({ passcodeHash, accessVersion: sql`${gates.accessVersion} + 1` })
    .where(eq(gates.id, id));
}

/** Deletes a gate. */
export async function deleteGate(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(gates).where(eq(gates.id, id));
}
