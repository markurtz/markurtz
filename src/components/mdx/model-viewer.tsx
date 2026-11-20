"use client";

import { createElement, useEffect, useRef, useState } from "react";

/**
 * An interactive 3D preview of a `.glb` file. The viewer library is large, so
 * it is imported only once the element scrolls near the viewport.
 */
export function ModelViewer({ src, alt, poster }: { src: string; alt: string; poster?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void import("@google/model-viewer").then(() => setReady(true));
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="not-prose bg-muted my-8 aspect-[4/3] overflow-hidden rounded-lg border"
    >
      {ready ? (
        createElement("model-viewer", {
          src,
          alt,
          poster,
          "camera-controls": true,
          "touch-action": "pan-y",
          "shadow-intensity": "0.6",
          style: { width: "100%", height: "100%" },
        })
      ) : (
        <p className="text-muted-foreground flex size-full items-center justify-center text-sm">
          Loading 3D model: {alt}
        </p>
      )}
    </div>
  );
}
