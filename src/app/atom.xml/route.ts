import { buildFeed } from "@/lib/feeds";

export const dynamic = "force-static";

/** Atom feed of the blog. */
export function GET() {
  return new Response(buildFeed().atom1(), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
