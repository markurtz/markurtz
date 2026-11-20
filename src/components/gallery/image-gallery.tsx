"use client";

import { Children, isValidElement, type ReactNode } from "react";

import { PhotoGrid } from "@/components/gallery/photo-grid";
import type { GalleryImage } from "@/lib/media";

interface ImageProps {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  title?: string;
}

const DEFAULT_WIDTH = 3;
const DEFAULT_HEIGHT = 2;

/**
 * The MDX `<Gallery>`: wrap `<img>` elements and they become a grid that opens
 * in the shared lightbox. Add `width` and `height` for exact proportions.
 */
export function ImageGallery({ children }: { children: ReactNode }) {
  const images: GalleryImage[] = Children.toArray(children)
    .filter(isValidElement<ImageProps>)
    .map((child) => child.props)
    .filter((props): props is ImageProps & { src: string } => typeof props.src === "string")
    .map((props, index) => ({
      id: `${index}-${props.src}`,
      src: props.src,
      alt: props.alt ?? "",
      caption: props.title,
      width: Number(props.width) || DEFAULT_WIDTH,
      height: Number(props.height) || DEFAULT_HEIGHT,
    }));

  return (
    <div className="not-prose my-8">
      <PhotoGrid images={images} />
    </div>
  );
}
