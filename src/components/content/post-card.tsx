import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils";

/** A post in a list. External posts link out and show where they are hosted. */
export function PostCard({ post }: { post: Post }) {
  const meta = (
    <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      {!post.isExternal && siteConfig.blog.showReadingTime ? (
        <span>{post.metadata.readingTime} min read</span>
      ) : null}
      {post.isExternal ? <Badge>{post.externalSource ?? "External"}</Badge> : null}
      {post.draft ? <Badge tone="warning">Draft</Badge> : null}
    </p>
  );

  return (
    <article className="group relative py-6">
      {meta}
      <h3 className="mt-1 text-xl font-semibold tracking-tight">
        {post.isExternal ? (
          <a
            href={post.url}
            rel="noopener"
            className="group-hover:text-accent after:absolute after:inset-0"
          >
            {post.title}
            <ArrowUpRight className="ml-1 inline size-4" aria-hidden />
            <span className="sr-only"> (external site)</span>
          </a>
        ) : (
          <Link href={post.url} className="group-hover:text-accent after:absolute after:inset-0">
            {post.title}
          </Link>
        )}
      </h3>
      <p className="text-muted-foreground mt-2 max-w-3xl">{post.description}</p>
    </article>
  );
}
