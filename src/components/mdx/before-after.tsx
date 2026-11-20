"use client";

/* eslint-disable @next/next/no-img-element -- pre-sized static files, see figure.tsx */
import { Children, isValidElement, type ReactNode, useId, useState } from "react";

interface ImageProps {
  src?: string;
  alt?: string;
}

/**
 * A draggable comparison of two images. Wrap exactly two `<img>` elements: the
 * first is "before", the second "after". The slider is a native range input,
 * so it works with the keyboard and touch.
 */
export function BeforeAfter({ children }: { children: ReactNode }) {
  const id = useId();
  const [position, setPosition] = useState(50);
  const images = Children.toArray(children)
    .filter(isValidElement<ImageProps>)
    .map((child) => child.props)
    .filter((props) => typeof props.src === "string");
  const [before, after] = images;

  if (!before || !after) return null;

  return (
    <figure className="not-prose my-8">
      <div className="relative overflow-hidden rounded-lg border select-none">
        <img src={after.src} alt={after.alt ?? "After"} className="block w-full" />
        <img
          src={before.src}
          alt={before.alt ?? "Before"}
          className="absolute inset-0 size-full object-cover"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <div
          aria-hidden
          className="bg-background absolute inset-y-0 w-0.5"
          style={{ left: `${position}%` }}
        />
        <label htmlFor={id} className="sr-only">
          Reveal the before image
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="text-muted-foreground mt-2 flex justify-between text-sm">
        <span>{before.alt ?? "Before"}</span>
        <span>{after.alt ?? "After"}</span>
      </figcaption>
    </figure>
  );
}
