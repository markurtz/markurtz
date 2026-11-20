import { buildFeed } from "@/lib/feeds";

export const dynamic = "force-static";

/** RSS 2.0 feed of the blog. */
export function GET() {
  return new Response(buildFeed().rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
