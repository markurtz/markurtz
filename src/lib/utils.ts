import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { siteConfig } from "@/lib/site";

/** Merges class names, resolving conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Absolute URL on the canonical origin for a site path. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Formats an ISO date for display, in UTC so builds are deterministic. */
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
    ...options,
  }).format(new Date(iso));
}

/** Lowercase, dash-separated identifier safe for URLs. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** True for links that leave the site. */
export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}
