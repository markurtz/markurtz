import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_TITLE = 120;
const MAX_SUBTITLE = 160;
const CACHE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Open Graph image for a page: `/api/og?title=…&subtitle=…`. Text is truncated
 * so the endpoint cannot be used to render arbitrary long content.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? siteConfig.title).slice(0, MAX_TITLE);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, MAX_SUBTITLE);

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
