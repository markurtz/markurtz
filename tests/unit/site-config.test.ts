// ## WRITTEN BY AI ##
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/lib/site";
import { defineSiteConfig, type SiteConfigInput } from "@/lib/site-config";

const base: SiteConfigInput = {
  url: "https://example.com/",
  productionUrl: "https://example.com",
  name: "Test",
  title: "Test",
  tagline: "",
  description: "A site",
  author: { name: "Test" },
  nav: [{ label: "About", href: "/about" }],
  projectCategories: [{ id: "software", label: "Software" }],
  home: { sections: ["hero"], counts: {} },
  features: {},
  blog: {},
  media: { publicBaseUrl: "https://media.example.com/", widths: [640] },
  clientArea: {},
};

describe("siteConfig", () => {
  it("exposes a canonical URL without a trailing slash", () => {
    expect(() => new URL(siteConfig.url)).not.toThrow();
    expect(siteConfig.url.endsWith("/")).toBe(false);
  });

  it("has a name and description for page metadata", () => {
    expect(siteConfig.name).not.toHaveLength(0);
    expect(siteConfig.description).not.toHaveLength(0);
  });

  it("keeps the private area off unless explicitly enabled", () => {
    expect(siteConfig.features.clientGalleries).toBe(false);
    expect(siteConfig.features.gatedPages).toBe(false);
  });
});

describe("defineSiteConfig", () => {
  it("fills defaults and strips trailing slashes", () => {
    const config = defineSiteConfig(base);
    expect(config.url).toBe("https://example.com");
    expect(config.media.publicBaseUrl).toBe("https://media.example.com");
    expect(config.features.clientGalleries).toBe(false);
    expect(config.blog.postsPerPage).toBe(10);
    expect(config.clientArea.sessionDays).toBe(30);
    expect(config.projectCategories[0]?.icon).toBe("sparkles");
  });

  it("rejects a typo with a readable message", () => {
    expect(() => defineSiteConfig({ ...base, url: "not a url" })).toThrow(
      /Invalid site.config.ts[\s\S]*url/,
    );
    expect(() =>
      defineSiteConfig({ ...base, home: { sections: ["heroo" as "hero"], counts: {} } }),
    ).toThrow(/Invalid site.config.ts/);
  });

  it("rejects duplicate or malformed project category ids", () => {
    expect(() =>
      defineSiteConfig({
        ...base,
        projectCategories: [
          { id: "diy", label: "DIY" },
          { id: "diy", label: "Again" },
        ],
      }),
    ).toThrow(/unique/);
    expect(() =>
      defineSiteConfig({ ...base, projectCategories: [{ id: "Wood Working", label: "x" }] }),
    ).toThrow();
  });

  it("requires navigation links to be site paths", () => {
    expect(() =>
      defineSiteConfig({ ...base, nav: [{ label: "Evil", href: "https://evil.example" }] }),
    ).toThrow();
  });
});
