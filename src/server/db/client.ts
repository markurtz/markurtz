import "server-only";

import { mkdir } from "node:fs/promises";
import path from "node:path";

import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { getEnv } from "@/lib/env";

import * as schema from "./schema";

/**
 * The database handle used by the data access layer. Two drivers sit behind
 * the same type:
 *
 * - `postgres://…`  Supabase (or any Postgres) through postgres.js. Use the
 *   transaction pooler URL; prepared statements are off because the pooler
 *   does not support them.
 * - `pglite://…`    In-process Postgres for local development, tests and CI,
 *   so the whole private area runs with no database server. Migrations are
 *   applied automatically. `pglite://memory` keeps nothing on disk.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "src/server/db/migrations");
const PGLITE_PREFIX = "pglite://";
const POOL_SIZE = 5;

/** Opens an in-process database and applies every migration. */
export async function createPgliteDb(dataDir?: string): Promise<Db> {
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);
  if (dataDir) await mkdir(path.dirname(dataDir), { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return db as unknown as Db;
}

async function createDb(url: string): Promise<Db> {
  if (url.startsWith(PGLITE_PREFIX)) {
    const target = url.slice(PGLITE_PREFIX.length);
    return createPgliteDb(target === "memory" ? undefined : path.resolve(target));
  }
  const [{ default: postgres }, { drizzle }] = await Promise.all([
    import("postgres"),
    import("drizzle-orm/postgres-js"),
  ]);
  const client = postgres(url, { prepare: false, max: POOL_SIZE });
  return drizzle(client, { schema }) as unknown as Db;
}

// Cached on globalThis so development hot reloads reuse one connection.
const globalForDb = globalThis as typeof globalThis & { __db?: Promise<Db> };

/** The shared database handle. Throws when `DATABASE_URL` is not set. */
export function getDb(): Promise<Db> {
  if (!globalForDb.__db) {
    const url = getEnv().DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. The private area needs a database.");
    globalForDb.__db = createDb(url);
  }
  return globalForDb.__db;
}

/** Replaces the shared handle. Used by tests and scripts. */
export function setDb(db: Db | undefined): void {
  globalForDb.__db = db ? Promise.resolve(db) : undefined;
}
