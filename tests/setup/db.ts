// ## WRITTEN BY AI ##
import { createPgliteDb, setDb, type Db } from "@/server/db/client";

/**
 * A fresh in-memory Postgres with the real migrations applied, installed as
 * the handle the data access layer uses.
 */
export async function useTestDb(): Promise<Db> {
  const db = await createPgliteDb();
  setDb(db);
  return db;
}
