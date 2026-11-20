/**
 * Applies pending SQL migrations: `pnpm db:migrate`.
 *
 * Uses DATABASE_URL_DIRECT (the direct connection) when set, because the
 * transaction pooler cannot run migrations reliably. Run from the
 * `db-migrate` workflow for production, behind an approval.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const MIGRATIONS_FOLDER = "src/server/db/migrations";

async function main() {
  const url = process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL_DIRECT (or DATABASE_URL) to run migrations.");
  if (url.startsWith("pglite://")) {
    console.log("pglite databases migrate themselves on startup. Nothing to do.");
    return;
  }
  const client = postgres(url, { max: 1 });
  try {
    await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("Migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
