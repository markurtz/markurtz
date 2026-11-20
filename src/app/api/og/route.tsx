import { ImageResponse } from "next/og";

import { verifyOgText } from "@/lib/seo/og";
import { siteConfig } from "@/lib/site";

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_TITLE = 120;
const MAX_SUBTITLE = 160;
const CACHE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Open Graph image for a page: `/api/og?title=…&subtitle=…&sig=…`. The text
 * must carry the signature `ogImageUrl` adds (see `src/lib/seo/og.ts`).
 * Anything else is redirected to the plain site card, so the route cannot be
 * used to put someone else's words on this domain.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const requestedTitle = searchParams.get("title");
  const requestedSubtitle = searchParams.get("subtitle") ?? "";
  if (requestedTitle === null) {
    // The bare URL is the site card. Extra parameters would only split the cache.
    if (url.search) return Response.redirect(new URL(url.pathname, url), 308);
  } else if (!verifyOgText(requestedTitle, requestedSubtitle, searchParams.get("sig") ?? "")) {
    return Response.redirect(new URL(url.pathname, url), 307);
  }
  const title = (requestedTitle ?? siteConfig.title).slice(0, MAX_TITLE);
  const subtitle = requestedSubtitle.slice(0, MAX_SUBTITLE);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#f8fafc",
        background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>{siteConfig.name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 56 : 72,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>{subtitle}</div>
        ) : null}
      </div>
      <div style={{ display: "flex", fontSize: 24, opacity: 0.7 }}>
        {new URL(siteConfig.url).host}
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      headers: { "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable` },
    },
  );
}
