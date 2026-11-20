import { buildFeed } from "@/lib/feeds";

export const dynamic = "force-static";

/** JSON Feed of the blog. */
export function GET() {
  return new Response(buildFeed().json1(), {
    headers: { "Content-Type": "application/feed+json; charset=utf-8" },
  });
}
