"use client";

import { Play } from "lucide-react";
import { useState } from "react";

/**
 * A YouTube embed that loads nothing from YouTube until it is clicked, and then
 * uses the no-cookie domain.
 */
export function YouTube({ id, title = "YouTube video" }: { id: string; title?: string }) {
  const [active, setActive] = useState(false);

  return (
    <div className="not-prose bg-muted relative my-8 aspect-video overflow-hidden rounded-lg border">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="absolute inset-0 flex size-full flex-col items-center justify-center gap-3"
        >
          <span className="bg-accent text-accent-foreground flex size-14 items-center justify-center rounded-full">
            <Play className="size-6" aria-hidden />
          </span>
          <span className="text-sm font-medium">Play: {title}</span>
          <span className="text-muted-foreground text-xs">Loads the video from YouTube</span>
        </button>
      )}
    </div>
  );
}

/** A self-hosted video that loads only its metadata until played. */
export function Video({ src, poster, title }: { src: string; poster?: string; title?: string }) {
  return (
    <video
      src={src}
      poster={poster}
      title={title}
      controls
      preload="metadata"
      playsInline
      className="my-8 w-full rounded-lg border"
    />
  );
}
