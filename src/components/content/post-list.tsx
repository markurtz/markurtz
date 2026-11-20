import { PostCard } from "@/components/content/post-card";
import type { Post } from "@/lib/content";

/** A divided list of post cards. */
export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="text-muted-foreground">No posts yet.</p>;
  return (
    <ul className="list-none divide-y p-0">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
