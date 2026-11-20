"use client";

/* eslint-disable @next/next/no-img-element -- derivatives are pre-generated at fixed widths; the Vercel image optimizer is deliberately not used. */
import { Check, Heart } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import type { GalleryImage } from "@/lib/media";
import { cn } from "@/lib/utils";

const Lightbox = dynamic(() => import("@/components/gallery/lightbox"), { ssr: false });

const ROW_HEIGHT_PX = 240;

/** Optional selection controls, used in client galleries. */
export interface GridSelection {
  selected: ReadonlySet<string>;
  onToggle: (id: string, range: boolean) => void;
}

/** Optional favorite (heart) controls, used in client galleries. */
export interface GridFavorites {
  ids: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

/**
 * A justified-rows photo grid with a keyboard-operable lightbox. Rows are laid
 * out in CSS from each image's aspect ratio, so there is no layout shift and
 * nothing to measure in JavaScript.
 */
export function PhotoGrid({
  images,
  selection,
  favorites,
  sizes = "(min-width: 72rem) 24rem, (min-width: 40rem) 33vw, 50vw",
}: {
  images: GalleryImage[];
  selection?: GridSelection;
  favorites?: GridFavorites;
  sizes?: string;
}) {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <>
      <ul className="flex list-none flex-wrap gap-2 p-0 after:flex-[10_1_0%] after:content-['']">
        {images.map((image, index) => {
          const aspect = image.width / image.height;
          const isSelected = selection?.selected.has(image.id) ?? false;
          const isFavorite = favorites?.ids.has(image.id) ?? false;
          return (
            <li
              key={image.id}
              className="group relative overflow-hidden rounded-md"
              style={{
                flexGrow: aspect,
                flexBasis: `${Math.round(aspect * ROW_HEIGHT_PX)}px`,
                aspectRatio: `${image.width} / ${image.height}`,
                background: image.placeholder ?? "var(--muted)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Open photo ${index + 1}${image.alt ? `: ${image.alt}` : ""}`}
                className="block size-full cursor-zoom-in"
              >
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes={image.srcSet ? sizes : undefined}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "size-full object-cover transition-transform",
                    isSelected && "scale-95 rounded-md",
                  )}
                />
              </button>
              {selection ? (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`Select photo ${index + 1}`}
                  onClick={(event) => selection.onToggle(image.id, event.shiftKey)}
                  className={cn(
                    "absolute top-2 left-2 flex size-7 items-center justify-center rounded-full border-2 border-white shadow transition-opacity focus-visible:opacity-100",
                    isSelected
                      ? "bg-accent text-accent-foreground opacity-100"
                      : "bg-black/40 text-transparent opacity-70 group-hover:opacity-100",
                  )}
                >
                  <Check className="size-4" aria-hidden />
                </button>
              ) : null}
              {favorites ? (
                <button
                  type="button"
                  aria-pressed={isFavorite}
                  aria-label={`${isFavorite ? "Remove photo" : "Add photo"} ${index + 1} ${isFavorite ? "from" : "to"} favorites`}
                  onClick={() => favorites.onToggle(image.id)}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/40 text-white shadow"
                >
                  <Heart
                    className={cn("size-4", isFavorite && "fill-current text-red-400")}
                    aria-hidden
                  />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {openIndex >= 0 ? (
        <Lightbox images={images} index={openIndex} onClose={() => setOpenIndex(-1)} />
      ) : null}
    </>
  );
}
