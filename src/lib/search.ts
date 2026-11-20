import { getAlbums, getPapers, getPosts, getProjects, getPages } from "@/lib/content";
import { siteConfig } from "@/lib/site";

/** One entry in the client-side search index served at `/search.json`. */
export interface SearchDocument {
  id: string;
  type: "Post" | "Project" | "Paper" | "Album" | "Page";
  title: string;
  description: string;
  tags: string;
  url: string;
  external: boolean;
}

/** Builds the search documents from public content. Private content is never included. */
export function buildSearchDocuments(): SearchDocument[] {
  const { features } = siteConfig;
  const documents: SearchDocument[] = [];

  for (const page of getPages()) {
    documents.push({
      id: `page:${page.slug}`,
      type: "Page",
      title: page.title,
      description: page.description,
      tags: "",
      url: page.url,
      external: false,
    });
  }
  if (features.blog) {
    for (const post of getPosts()) {
      documents.push({
        id: `post:${post.slug}`,
        type: "Post",
        title: post.title,
        description: post.description,
        tags: post.tags.join(" "),
        url: post.url,
        external: post.isExternal,
      });
    }
  }
  for (const project of getProjects()) {
    documents.push({
      id: `project:${project.slug}`,
      type: "Project",
      title: project.title,
      description: project.description,
      tags: [...project.tags, project.category, ...project.tech].join(" "),
      url: project.url,
      external: false,
    });
  }
  if (features.research) {
    for (const paper of getPapers()) {
      documents.push({
        id: `paper:${paper.slug}`,
        type: "Paper",
        title: paper.title,
        description: paper.abstract || paper.description,
        tags: [...paper.tags, paper.venue, ...paper.authors].join(" "),
        url: paper.hasPage ? paper.url : `/research#${paper.slug}`,
        external: false,
      });
    }
  }
  if (features.photos) {
    for (const album of getAlbums()) {
      documents.push({
        id: `album:${album.slug}`,
        type: "Album",
        title: album.title,
        description: album.description,
        tags: [...album.tags, album.location ?? ""].join(" "),
        url: album.url,
        external: false,
      });
    }
  }
  return documents;
}
