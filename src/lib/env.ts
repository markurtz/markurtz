import { z } from "zod";

/**
 * Zod-validated environment. Only `NEXT_PUBLIC_SITE_URL` matters for the public
 * site; everything else is optional until the feature that needs it is on
 * (see `src/lib/features.ts`). Never import this from a client component.
 */

const optional = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optional,
  NEXT_PUBLIC_MEDIA_URL: optional,

  DATABASE_URL: optional,
  DATABASE_URL_DIRECT: optional,

  AUTH_DRIVER: z.enum(["supabase", "dev"]).default("supabase"),
  NEXT_PUBLIC_SUPABASE_URL: optional,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional,
  SUPABASE_SECRET_KEY: optional,
  ADMIN_EMAILS: optional,

  GALLERY_SESSION_SECRET: optional.refine((value) => !value || value.length >= 32, {
    message: "GALLERY_SESSION_SECRET must be at least 32 characters",
  }),
  IP_HASH_SALT: optional,
  CRON_SECRET: optional,

  STORAGE_DRIVER: z.enum(["r2", "local"]).default("r2"),
  R2_ACCOUNT_ID: optional,
  R2_ACCESS_KEY_ID: optional,
  R2_SECRET_ACCESS_KEY: optional,
  R2_PUBLIC_BUCKET: optional,
  R2_PRIVATE_BUCKET: optional,

  RESEND_API_KEY: optional,
  CONTACT_TO_EMAIL: optional,
  CONTACT_FROM_EMAIL: optional,

  GITHUB_TOKEN: optional,
  /** Set by Vercel on every deployment. Used to refuse development-only drivers there. */
  VERCEL: optional,
  VERCEL_ENV: optional,
});

export type Env = z.output<typeof envSchema>;

/** Parses an environment record. Exported for tests. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  const env = result.data;
  if (env.VERCEL && env.AUTH_DRIVER === "dev") {
    throw new Error("AUTH_DRIVER=dev skips sign-in codes and must never be used on Vercel.");
  }
  if (env.VERCEL && env.STORAGE_DRIVER === "local") {
    throw new Error("STORAGE_DRIVER=local writes to the local disk and cannot be used on Vercel.");
  }
  return env;
}

let cached: Env | undefined;

/** The validated process environment, parsed once. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

/** Lower-cased admin allowlist from `ADMIN_EMAILS` (comma separated). */
export function adminEmails(env: Env = getEnv()): string[] {
  return (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
