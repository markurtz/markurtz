import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit configuration. `pnpm db:generate` writes SQL migrations from the
 * schema; `pnpm db:migrate` applies them (see src/server/db/migrate.ts).
 * Migrations use the direct connection, not the transaction pooler.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT ?? process.env.DATABASE_URL ?? "",
  },
});
