/**
 * Environment for the end-to-end run. Everything here is a throwaway test
 * value: the database is in-process PGlite, storage is the local disk, and
 * sign-in uses the development driver. Nothing is a real credential.
 */
export const E2E_PORT = 3100;
export const E2E_ADMIN_EMAIL = "admin@example.com";
export const E2E_CLIENT_EMAIL = "client@example.com";
export const E2E_SIGN_IN_CODE = "000000";

export const E2E_GALLERY = {
  slug: "e2e-gallery",
  title: "E2E Gallery",
  passcode: "maple-river-stone-lamp",
};
export const E2E_OTHER_GALLERY = {
  slug: "e2e-other",
  title: "Other Gallery",
  passcode: "cedar-ember-finch-moss",
};
/** Used only by the passcode rotation and expiry test, which locks everyone else out. */
export const E2E_ROTATE_GALLERY = {
  slug: "e2e-rotate",
  title: "Rotate Gallery",
  passcode: "amber-quill-harbor-pine",
};
export const E2E_GATE = { key: "sample", passcode: "open-sesame-e2e" };

export const e2eEnv: Record<string, string> = {
  NEXT_PUBLIC_SITE_URL: `http://localhost:${E2E_PORT}`,
  PORT: String(E2E_PORT),
  FEATURE_CLIENT_GALLERIES: "true",
  FEATURE_GATED_PAGES: "true",
  DATABASE_URL: "pglite://.data/e2e/db",
  AUTH_DRIVER: "dev",
  // The development drivers are refused in production builds without this.
  ALLOW_INSECURE_DEV_DRIVERS: "1",
  ADMIN_EMAILS: E2E_ADMIN_EMAIL,
  STORAGE_DRIVER: "local",
  GALLERY_SESSION_SECRET: "e2e-only-not-a-real-secret-0123456789abcdef",
  IP_HASH_SALT: "e2e-only-salt",
  SKIP_GITHUB_STATS: "1",
  NEXT_TELEMETRY_DISABLED: "1",
};
