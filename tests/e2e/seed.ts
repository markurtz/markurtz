/**
 * Seeds the end-to-end database and local storage: two published galleries
 * with known passcodes and a gate. Run before the server starts, because an
 * on-disk PGlite database can only be opened by one process at a time.
 */
import { rm } from "node:fs/promises";
import path from "node:path";

import { hashPasscode } from "@/server/auth/passcode";
import { createGallery } from "@/server/dal/galleries";
import { createGate } from "@/server/dal/gates";

import { uploadGallery } from "../../scripts/photos/commands";
import { E2E_GALLERY, E2E_GATE, E2E_OTHER_GALLERY, E2E_ROTATE_GALLERY } from "./env";

const FIXTURES = path.join("tests", "e2e", "fixtures");

async function main() {
  // Start from nothing so every run sees the same state.
  await rm(path.join(".data", "e2e"), { recursive: true, force: true });
  await rm(path.join(".data", "media"), { recursive: true, force: true });

  for (const gallery of [E2E_GALLERY, E2E_OTHER_GALLERY, E2E_ROTATE_GALLERY]) {
    await createGallery({
      slug: gallery.slug,
      title: gallery.title,
      status: "published",
      passcodeHash: await hashPasscode(gallery.passcode),
    });
    await uploadGallery(gallery.slug, {
      folder: FIXTURES,
      dryRun: false,
      concurrency: 2,
      archive: false,
    });
  }
  await createGate({
    key: E2E_GATE.key,
    label: "E2E gate",
    passcodeHash: await hashPasscode(E2E_GATE.passcode),
  });
  console.log("Seeded the e2e database.");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
