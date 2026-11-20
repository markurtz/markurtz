import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

import { assertFeaturesConfigured } from "./src/lib/features";

/**
 * Content-Security-Policy, shipped in report-only mode first (plan, Phase 9).
 * Watch the browser console on a preview deployment, then rename the header to
 * `Content-Security-Policy` to enforce it. `'unsafe-inline'` covers Next.js's
 * inline bootstrap scripts and the theme script; move to nonces to drop it.
 */
function contentSecurityPolicy(): string {
  const media = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const r2 = process.env.R2_ACCOUNT_ID
    ? `https://*.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : "";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", media, r2],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", media, r2, supabase, "https://vitals.vercel-insights.com"],
    "frame-src": ["https://www.youtube-nocookie.com"],
    "media-src": ["'self'", media],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.filter(Boolean).join(" ")}`)
    .join("; ");
}

/** Baseline security headers applied to every response. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy() },
];

/**
 * Extra headers for the private area. Listed after the baseline so these
 * values win where the same header appears twice.
 */
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Cache-Control", value: "private, no-store" },
];

const PRIVATE_SOURCES = [
  "/admin/:path*",
  "/clients/:path*",
  "/p/:path*",
  "/api/clients/:path*",
  "/api/media/:path*",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Navigation comes from site.config.ts and content, so hrefs are plain
  // strings and statically typed routes would need a cast at every link.
  typedRoutes: false,
  // Native or WASM packages that must be loaded from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite", "sharp"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...PRIVATE_SOURCES.map((source) => ({ source, headers: privateHeaders })),
    ];
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_PRODUCTION_BUILD) {
    // A backend feature switched on without its configuration fails the build.
    assertFeaturesConfigured();
  }
  if (phase === PHASE_DEVELOPMENT_SERVER && !process.env.VELITE_STARTED) {
    // Rebuild content on change while `next dev` runs. Builds, tests and type
    // checks run `velite build` themselves (see package.json).
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    await build({ watch: true, clean: false });
  }
  return nextConfig;
}
