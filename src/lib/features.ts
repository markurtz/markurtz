// Relative imports: next.config.ts loads this file before path aliases exist.
import { type Env, getEnv } from "./env";
import { siteConfig } from "./site";

/**
 * Feature flags: the switches in `site.config.ts` combined with whether the
 * environment variables each backend feature needs are present.
 */

/** Names of the variables the private area needs that are not set. */
export function missingBackendEnv(env: Env = getEnv()): string[] {
  const missing: string[] = [];
  const need = (name: keyof Env) => {
    if (!env[name]) missing.push(name);
  };

  need("DATABASE_URL");
  need("GALLERY_SESSION_SECRET");
  need("IP_HASH_SALT");
  need("ADMIN_EMAILS");
  if (env.AUTH_DRIVER === "supabase") {
    need("NEXT_PUBLIC_SUPABASE_URL");
    need("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    need("SUPABASE_SECRET_KEY");
  }
  if (env.STORAGE_DRIVER === "r2") {
    need("R2_ACCOUNT_ID");
    need("R2_ACCESS_KEY_ID");
    need("R2_SECRET_ACCESS_KEY");
    need("R2_PRIVATE_BUCKET");
  }
  return missing;
}

/** True when any feature that needs the database, auth and storage is switched on. */
export function privateAreaEnabled(): boolean {
  return siteConfig.features.clientGalleries || siteConfig.features.gatedPages;
}

/** True when the private area is switched on and fully configured. */
export function privateAreaReady(env: Env = getEnv()): boolean {
  return privateAreaEnabled() && missingBackendEnv(env).length === 0;
}

/** True when the contact form is on and can send mail. */
export function contactReady(env: Env = getEnv()): boolean {
  return siteConfig.features.contact && Boolean(env.RESEND_API_KEY && env.CONTACT_TO_EMAIL);
}

/**
 * Fails a production build when a backend feature is on without its
 * configuration, so a half-configured client area never ships.
 */
export function assertFeaturesConfigured(env: Env = getEnv()): void {
  if (privateAreaEnabled()) {
    const missing = missingBackendEnv(env);
    if (missing.length > 0) {
      throw new Error(
        `Client galleries or gated pages are enabled but these variables are missing: ${missing.join(", ")}. ` +
          "Set them or switch the feature off (see docs/guides/deploy.md).",
      );
    }
  }
  if (siteConfig.features.contact && !contactReady(env)) {
    throw new Error(
      "The contact form is enabled but RESEND_API_KEY or CONTACT_TO_EMAIL is missing.",
    );
  }
}

/** True in development and on Vercel previews, where drafts and scheduled posts render. */
export function showUnpublished(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";
}
