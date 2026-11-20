import { thumbHashToAverageRGBA, thumbHashToDataURL } from "thumbhash";

import { siteConfig } from "@/lib/site";

/**
 * Helpers for public media. Public album derivatives are pre-generated at
 * fixed widths by the photos CLI, so pages build `srcset` values directly and
 * never use an on-demand image optimizer.
 */

/** An image ready for the grid and lightbox. Contains URLs only, never storage keys. */
export interface GalleryImage {
  id: string;
  /** Grid image. */
  src: string;
  srcSet?: string;
  /** Larger image for the lightbox. Defaults to `src`. */
  fullSrc?: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** CSS background shown while the image loads (a data URL or a color). */
  placeholder?: string;
  /** Present only when the viewer may download the original. */
  downloadUrl?: string;
  filename?: string;
}

/** Base URL of public media: the R2 custom domain, or `/media` served from `public/`. */
export function publicMediaBase(): string {
  return siteConfig.media.publicBaseUrl || "/media";
}

/** Storage key of one public album derivative. Shared with the photos CLI. */
export function albumPhotoKey(albumSlug: string, photoId: string, width: number): string {
  return `albums/${albumSlug}/${photoId}/${width}.webp`;
}

/** URL of one public album derivative. */
export function albumPhotoUrl(albumSlug: string, photoId: string, width: number): string {
  return `${publicMediaBase()}/${albumPhotoKey(albumSlug, photoId, width)}`;
}

/** `srcset` across the widths that exist for a photo. */
export function albumPhotoSrcSet(albumSlug: string, photoId: string, widths: number[]): string {
  return widths.map((width) => `${albumPhotoUrl(albumSlug, photoId, width)} ${width}w`).join(", ");
}

function decodeThumbhash(thumbhash: string): Uint8Array {
  return Uint8Array.from(Buffer.from(thumbhash, "base64"));
}

/** A blurred preview as a CSS background value, decoded from a base64 thumbhash. */
export function thumbhashToPlaceholder(thumbhash: string): string | undefined {
  if (!thumbhash) return undefined;
  try {
    return `center / cover no-repeat url("${thumbHashToDataURL(decodeThumbhash(thumbhash))}")`;
  } catch {
    return undefined;
  }
}

/** The average color of a thumbhash, for a placeholder that costs a few bytes. */
export function thumbhashToColor(thumbhash: string): string | undefined {
  try {
    const { r, g, b } = thumbHashToAverageRGBA(decodeThumbhash(thumbhash));
    const channel = (value: number) => Math.round(value * 255);
    return `rgb(${channel(r)} ${channel(g)} ${channel(b)})`;
  } catch {
    return undefined;
  }
}

interface ManifestPhoto {
  id: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  thumbhash: string;
  widths: number[];
  exif: Partial<
    Record<"camera" | "lens" | "focalLength" | "aperture" | "shutter" | "iso" | "takenAt", string>
  >;
}

/** One line of camera settings for a caption, or an empty string. */
export function exifCaption(exif: ManifestPhoto["exif"]): string {
  return [
    exif.camera,
    exif.lens,
    exif.focalLength,
    exif.aperture,
    exif.shutter,
    exif.iso && `ISO ${exif.iso}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Converts a public album manifest entry into a gallery image. */
export function albumPhotoToImage(albumSlug: string, photo: ManifestPhoto): GalleryImage {
  const widths = [...photo.widths].sort((a, b) => a - b);
  const smallest = widths[0] ?? photo.width;
  const largest = widths[widths.length - 1] ?? photo.width;
  const caption = [photo.caption, exifCaption(photo.exif)].filter(Boolean).join(" — ");
  return {
    id: photo.id,
    src: albumPhotoUrl(albumSlug, photo.id, smallest),
    srcSet: albumPhotoSrcSet(albumSlug, photo.id, widths),
    fullSrc: albumPhotoUrl(albumSlug, photo.id, largest),
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    caption: caption || undefined,
    placeholder: thumbhashToPlaceholder(photo.thumbhash),
  };
}
