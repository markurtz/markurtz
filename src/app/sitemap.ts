import type { MetadataRoute } from "next";

import { getAlbums, getLocalPosts, getPages, getPapers, getProjects, getTags } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

/** Every public URL. Private routes (`/clients`, `/admin`, `/p`) are never listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const { features } = siteConfig;
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/work") },
    { url: absoluteUrl("/projects") },
    ...getPages().map((page) => ({ url: absoluteUrl(page.url), lastModified: page.updated })),
    ...siteConfig.projectCategories.map((category) => ({
      url: absoluteUrl(`/projects/category/${category.id}`),
    })),
    ...getProjects().map((project) => ({
      url: absoluteUrl(project.url),
      lastModified: project.updated ?? project.date,
    })),
  ];
  if (features.blog) {
    entries.push(
      { url: absoluteUrl("/blog") },
      ...getLocalPosts().map((post) => ({
        url: absoluteUrl(post.url),
        lastModified: post.updated ?? post.date,
      })),
      ...getTags().map((tag) => ({ url: absoluteUrl(`/blog/tags/${tag.slug}`) })),
    );
  }
  if (features.research) {
    entries.push(
      { url: absoluteUrl("/research") },
      ...getPapers()
        .filter((paper) => paper.hasPage)
        .map((paper) => ({
          url: absoluteUrl(paper.url),
          lastModified: paper.updated ?? paper.date,
        })),
    );
  }
  if (features.photos) {
    entries.push(
      { url: absoluteUrl("/photos") },
      ...getAlbums().map((album) => ({
        url: absoluteUrl(album.url),
        lastModified: album.updated ?? album.date,
      })),
    );
  }
  if (features.contact) entries.push({ url: absoluteUrl("/contact") });
  return entries;
}
