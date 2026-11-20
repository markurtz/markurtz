import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

/** Paths that must never be crawled. They also send `noindex` headers. */
export const PRIVATE_PATHS = ["/admin", "/clients", "/p/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
