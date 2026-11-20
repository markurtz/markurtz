import Link from "next/link";

import { slugify } from "@/lib/utils";

/** Tags as links to their blog listing, or plain labels when `linked` is off. */
export function TagList({ tags, linked = true }: { tags: string[]; linked?: boolean }) {
  if (tags.length === 0) return null;
  return (
    <ul aria-label="Tags" className="flex list-none flex-wrap gap-2 p-0">
      {tags.map((tag) => (
        <li key={tag}>
          {linked ? (
            <Link
              href={`/blog/tags/${slugify(tag)}`}
              className="bg-muted text-muted-foreground hover:text-foreground rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              #{tag}
            </Link>
          ) : (
            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
              {tag}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
