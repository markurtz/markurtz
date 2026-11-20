/**
 * The two upload modes behind the photos CLI. Kept apart from the command-line
 * entry point so tests and seed scripts can call them directly.
 */
import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline as streamPipeline } from "node:stream/promises";

import { downloadZip } from "client-zip";

import { albumPhotoKey } from "@/lib/media";
import { siteConfig } from "@/lib/site";
import { getGalleryBySlug, updateGallery } from "@/server/dal/galleries";
import { insertPhoto, listAllPhotos, listContentHashes } from "@/server/dal/photos";
import {
  galleryArchiveKey,
  galleryPhotoPrefix,
  getStorage,
  photoKeys,
  PRIVATE_DERIVATIVES,
  PRIVATE_IMAGE_CACHE,
} from "@/server/storage";

import {
  inspectImage,
  isSupportedImage,
  mapWithConcurrency,
  renderDerivative,
  widthsFor,
} from "./pipeline";

const IMMUTABLE = "public, max-age=31536000, immutable";
export const DEFAULT_CONCURRENCY = 4;

/** Options shared by both upload modes. */
export interface UploadOptions {
  folder: string;
  dryRun: boolean;
  concurrency: number;
}

/** One entry of `content/albums/<slug>/photos.json`. */
interface ManifestPhoto {
  id: string;
  hash: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  thumbhash: string;
  widths: number[];
  exif: Record<string, string>;
}

async function listImages(folder: string): Promise<string[]> {
  const entries = await readdir(folder, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isSupportedImage(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Public album: derivatives go to the public bucket and a manifest is written to git. */
export async function uploadAlbum(slug: string, options: UploadOptions): Promise<void> {
  const albumDir = path.join("content", "albums", slug);
  const manifestPath = path.join(albumDir, "photos.json");
  try {
    await stat(path.join(albumDir, "index.mdx"));
  } catch {
    throw new Error(`No album at ${albumDir}. Create it first with: pnpm new album "${slug}"`);
  }

  let existing: ManifestPhoto[] = [];
  try {
    existing = (JSON.parse(await readFile(manifestPath, "utf8")) as { photos: ManifestPhoto[] })
      .photos;
  } catch {
    // First upload for this album.
  }
  const known = new Map(existing.map((photo) => [photo.hash, photo]));
  const storage = await getStorage("public");
  const files = await listImages(options.folder);

  const added = await mapWithConcurrency(files, options.concurrency, async (name) => {
    const source = await readFile(path.join(options.folder, name));
    const info = await inspectImage(source, name);
    if (known.has(info.hash)) {
      console.log(`  skip  ${name} (already uploaded)`);
      return undefined;
    }
    const id = randomUUID();
    const widths = widthsFor(info.width, siteConfig.media.widths);
    if (!options.dryRun) {
      for (const width of widths) {
        const derivative = await renderDerivative(source, width, { fit: "width" });
        await storage.put(albumPhotoKey(slug, id, width), derivative, {
          contentType: "image/webp",
          cacheControl: IMMUTABLE,
        });
      }
    }
    console.log(
      `  ${options.dryRun ? "would add" : "added"}  ${name} (${info.width}x${info.height}, ${widths.join("/")}w)`,
    );
    const photo: ManifestPhoto = {
      id,
      hash: info.hash,
      width: info.width,
      height: info.height,
      alt: "",
      caption: "",
      thumbhash: info.thumbhash,
      widths,
      exif: { ...info.exif },
    };
    return photo;
  });

  const photos = [...existing, ...added.filter((photo): photo is ManifestPhoto => Boolean(photo))];
  if (!options.dryRun) {
    await writeFile(manifestPath, `${JSON.stringify({ album: slug, photos }, null, 2)}\n`);
    console.log(
      `Wrote ${manifestPath} (${photos.length} photos). Add alt text there, then commit it.`,
    );
  }
}

/** Client gallery: originals and derivatives go to the private bucket, rows to Postgres. */
export async function uploadGallery(
  slug: string,
  options: UploadOptions & { archive: boolean },
): Promise<void> {
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) throw new Error(`No gallery with slug "${slug}". Create it under /admin first.`);

  const storage = await getStorage("private");
  const known = await listContentHashes(gallery.id);
  const files = await listImages(options.folder);

  await mapWithConcurrency(files, options.concurrency, async (name) => {
    const source = await readFile(path.join(options.folder, name));
    const info = await inspectImage(source, name);
    if (known.has(info.hash)) {
      console.log(`  skip  ${name} (already uploaded)`);
      return;
    }
    if (options.dryRun) {
      console.log(`  would add  ${name} (${info.width}x${info.height})`);
      return;
    }
    const id = randomUUID();
    const storagePrefix = galleryPhotoPrefix(gallery.id, id);
    const keys = photoKeys({ storagePrefix, originalExt: info.ext });
    await storage.put(keys.original, source, { contentType: info.contentType });
    await storage.put(keys.preview, await renderDerivative(source, PRIVATE_DERIVATIVES.preview), {
      contentType: "image/webp",
      cacheControl: PRIVATE_IMAGE_CACHE,
    });
    await storage.put(
      keys.thumb,
      await renderDerivative(source, PRIVATE_DERIVATIVES.thumb, { quality: 80 }),
      { contentType: "image/webp", cacheControl: PRIVATE_IMAGE_CACHE },
    );
    // The row is written last, so a failed upload leaves no photo pointing at missing files.
    await insertPhoto({
      id,
      galleryId: gallery.id,
      filename: name,
      storagePrefix,
      originalExt: info.ext,
      contentHash: info.hash,
      width: info.width,
      height: info.height,
      bytes: info.bytes,
      contentType: info.contentType,
      takenAt: info.exif.takenAt ? new Date(info.exif.takenAt) : null,
      exif: { ...info.exif },
      thumbhash: info.thumbhash,
    });
    console.log(`  added  ${name} (${info.width}x${info.height})`);
  });

  if (options.archive && !options.dryRun) await uploadArchive(gallery.id, options.folder);
}

/** Builds a zip of every original in the gallery and uploads it for "Download all". */
async function uploadArchive(galleryId: string, sourceFolder: string): Promise<void> {
  const photos = await listAllPhotos(galleryId);
  const temp = await mkdtemp(path.join(tmpdir(), "gallery-archive-"));
  const zipPath = path.join(temp, "archive.zip");
  try {
    async function* entries() {
      for (const photo of photos) {
        // Zip from the local export when the file is there, which avoids re-downloading it.
        const local = path.join(sourceFolder, photo.filename);
        try {
          const info = await stat(local);
          yield {
            name: photo.filename,
            lastModified: info.mtime,
            input: Readable.toWeb(createReadStream(local)),
            size: info.size,
          };
        } catch {
          console.warn(`  archive: ${photo.filename} is not in ${sourceFolder}, skipped`);
        }
      }
    }
    const body = downloadZip(entries()).body;
    if (!body) throw new Error("Could not create the archive stream");
    await streamPipeline(Readable.fromWeb(body as never), createWriteStream(zipPath));
    const { size } = await stat(zipPath);
    const key = galleryArchiveKey(galleryId);
    const storage = await getStorage("private");
    await storage.put(key, createReadStream(zipPath), {
      contentType: "application/zip",
      contentLength: size,
    });
    await updateGallery(galleryId, { archiveKey: key });
    console.log(`  archive uploaded (${(size / 1024 / 1024).toFixed(1)} MB)`);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}
