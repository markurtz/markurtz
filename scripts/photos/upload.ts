/**
 * Photos CLI.
 *
 *   pnpm photos upload ./exports/smith-wedding --gallery smith-wedding   # private client gallery
 *   pnpm photos upload ./exports/iceland --album iceland-2026            # public album
 *   Options: --dry-run  --concurrency 6  --archive (gallery only: also upload a zip of all originals)
 *
 * Uploads are idempotent by content hash, so re-running after a failure
 * resumes where it stopped. See docs/guides/photos.md.
 */
import { parseArgs } from "node:util";

import { DEFAULT_CONCURRENCY, uploadAlbum, uploadGallery, type UploadOptions } from "./commands";

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      gallery: { type: "string" },
      album: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      archive: { type: "boolean", default: false },
      concurrency: { type: "string", default: String(DEFAULT_CONCURRENCY) },
    },
  });
  const [command, folder] = positionals;
  if (command !== "upload" || !folder || Boolean(values.gallery) === Boolean(values.album)) {
    console.error(
      "Usage: pnpm photos upload <folder> (--gallery <slug> | --album <slug>) [--dry-run] [--concurrency N] [--archive]",
    );
    process.exit(1);
  }
  const options: UploadOptions = {
    folder,
    dryRun: values["dry-run"],
    concurrency: Math.max(1, Number(values.concurrency) || DEFAULT_CONCURRENCY),
  };

  if (values.album) {
    console.log(
      `Uploading ${folder} to public album "${values.album}"${options.dryRun ? " (dry run)" : ""}`,
    );
    await uploadAlbum(values.album, options);
  } else if (values.gallery) {
    console.log(
      `Uploading ${folder} to client gallery "${values.gallery}"${options.dryRun ? " (dry run)" : ""}`,
    );
    await uploadGallery(values.gallery, { ...options, archive: values.archive });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
