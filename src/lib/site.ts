/**
 * Re-exports the validated site configuration so application code can import
 * it through the `@/` alias instead of reaching for the repository root.
 */
export { siteConfig } from "../../site.config";
export type { ProjectCategory, SiteConfig, SocialKey } from "./site-config";
