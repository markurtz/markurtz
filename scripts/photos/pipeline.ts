/**
 * The image pipeline shared by the photos CLI and, later, browser upload in
 * the admin. It reads one image and produces everything the site stores:
 * dimensions, selected EXIF, a thumbhash and web derivatives.
 *
 * Derivatives are sRGB, auto-rotated WebP with all metadata removed, so GPS
 * coordinates never reach a visitor. Originals are stored byte for byte.
 */
import { createHash } from "node:crypto";
import path from "node:path";

import exifr from "exifr";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

export const SUPPORTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
  ".avif",
  ".heic",
];

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  tif: "image/tiff",
  tiff: "image/tiff",
  avif: "image/avif",
  heic: "image/heic",
};

const THUMBHASH_MAX_EDGE = 100;
const DEFAULT_QUALITY = 85;
// EXIF orientations 5 to 8 are rotated a quarter turn, which swaps width and height.
const FIRST_ROTATED_ORIENTATION = 5;

/** Camera settings kept for captions. Location data is deliberately not read. */
export interface PhotoExif {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  takenAt?: string;
}

/** Everything known about a source image before any derivative is made. */
export interface ImageInfo {
  /** SHA-256 of the file, used to make uploads idempotent. */
  hash: string;
  /** Display width and height, after applying EXIF orientation. */
  width: number;
  height: number;
  bytes: number;
  ext: string;
  contentType: string;
  exif: PhotoExif;
  thumbhash: string;
}

/** True for files the pipeline can read. */
export function isSupportedImage(filename: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

/** Formats an exposure time in seconds as a photographer would write it. */
export function formatShutter(seconds: number): string {
  if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
  return `1/${Math.round(1 / seconds)}s`;
}

/** Turns raw EXIF tags into display strings. Exported for tests. */
export function formatExif(tags: Record<string, unknown> | undefined): PhotoExif {
  if (!tags) return {};
  const text = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : undefined;
  const number = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;
  const make = text(tags.Make);
  const model = text(tags.Model);
  const focal = number(tags.FocalLength);
  const fNumber = number(tags.FNumber);
  const exposure = number(tags.ExposureTime);
  const iso = number(tags.ISO);
  const taken = tags.DateTimeOriginal instanceof Date ? tags.DateTimeOriginal : undefined;

  const exif: PhotoExif = {
    // Many cameras repeat the make inside the model name.
    camera:
      model && make && !model.toLowerCase().startsWith(make.toLowerCase())
        ? `${make} ${model}`
        : (model ?? make),
    lens: text(tags.LensModel),
    focalLength: focal ? `${Math.round(focal)}mm` : undefined,
    aperture: fNumber ? `f/${Number(fNumber.toFixed(1))}` : undefined,
    shutter: exposure ? formatShutter(exposure) : undefined,
    iso: iso ? String(iso) : undefined,
    takenAt: taken && !Number.isNaN(taken.getTime()) ? taken.toISOString() : undefined,
  };
  return Object.fromEntries(Object.entries(exif).filter(([, value]) => value !== undefined));
}

async function computeThumbhash(source: Buffer): Promise<string> {
  const { data, info } = await sharp(source)
    .rotate()
    .resize(THUMBHASH_MAX_EDGE, THUMBHASH_MAX_EDGE, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString("base64");
}

/** Reads dimensions, EXIF and a thumbhash from an image file's bytes. */
export async function inspectImage(source: Buffer, filename: string): Promise<ImageInfo> {
  const metadata = await sharp(source).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Cannot read dimensions of ${filename}`);
  const rotated = (metadata.orientation ?? 1) >= FIRST_ROTATED_ORIENTATION;
  const ext = path.extname(filename).slice(1).toLowerCase();

  let tags: Record<string, unknown> | undefined;
  try {
    tags = await exifr.parse(source, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FocalLength",
        "FNumber",
        "ExposureTime",
        "ISO",
        "DateTimeOriginal",
      ],
    });
  } catch {
    // Images without readable EXIF are fine.
  }

  return {
    hash: createHash("sha256").update(source).digest("hex"),
    width: rotated ? metadata.height : metadata.width,
    height: rotated ? metadata.width : metadata.height,
    bytes: source.byteLength,
    ext,
    contentType: CONTENT_TYPES[ext] ?? "application/octet-stream",
    exif: formatExif(tags),
    thumbhash: await computeThumbhash(source),
  };
}

/**
 * Renders a WebP derivative no larger than `maxEdge` on its long edge (or
 * `maxEdge` wide when `fit` is "width"). Never upscales. Metadata is stripped
 * because sharp drops it unless asked to keep it.
 */
export async function renderDerivative(
  source: Buffer,
  maxEdge: number,
  { quality = DEFAULT_QUALITY, fit = "edge" }: { quality?: number; fit?: "edge" | "width" } = {},
): Promise<Buffer> {
  const resize =
    fit === "width"
      ? { width: maxEdge, withoutEnlargement: true }
      : { width: maxEdge, height: maxEdge, fit: "inside" as const, withoutEnlargement: true };
  return sharp(source).rotate().resize(resize).toColorspace("srgb").webp({ quality }).toBuffer();
}

/** The configured widths that make sense for an image: none wider than the original, at least one. */
export function widthsFor(originalWidth: number, configured: number[]): number[] {
  const sorted = [...configured].sort((a, b) => a - b);
  const fitting = sorted.filter((width) => width <= originalWidth);
  // An image narrower than the smallest width still needs one derivative at its own size.
  return fitting.length > 0 ? fitting : [originalWidth];
}

/** Runs `worker` over `items` with at most `concurrency` in flight. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index] as T, index);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, run));
  return results;
}
