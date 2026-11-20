/* eslint-disable @next/next/no-img-element -- content images are pre-sized static files; the Vercel image optimizer is deliberately not used (see docs/plans, section 10.5). */
import type { ReactNode } from "react";

/**
 * An image with an optional caption. Clicking opens the full-size file, which
 * works without JavaScript.
 */
export function Figure({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-8">
      <a href={src} aria-label={`Open full size: ${alt}`}>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="mx-auto my-0 rounded-lg border"
        />
      </a>
      {caption ? <figcaption className="mt-2 text-center">{caption}</figcaption> : null}
    </figure>
  );
}

/** Replacement for Markdown images: lazy loaded and rounded. */
export function MdxImage({ src, alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="rounded-lg border"
      {...props}
    />
  );
}
