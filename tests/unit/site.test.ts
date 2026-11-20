// ## WRITTEN BY AI ##
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site";

describe("siteConfig", () => {
  it("exposes a canonical URL without a trailing slash", () => {
    expect(() => new URL(siteConfig.url)).not.toThrow();
    expect(siteConfig.url.endsWith("/")).toBe(false);
  });

  it("has a name and description for page metadata", () => {
    expect(siteConfig.name).not.toHaveLength(0);
    expect(siteConfig.description).not.toHaveLength(0);
  });
});
