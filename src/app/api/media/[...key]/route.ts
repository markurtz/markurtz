import path from "node:path";

import { getEnv } from "@/lib/env";
import { attachmentDisposition, PRIVATE_IMAGE_CACHE } from "@/server/storage";
import { readLocalPrivate, verifyLocalUrl } from "@/server/storage/local";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".zip": "application/zip",
};

/**
 * Serves private files for the `local` storage driver only, standing in for
 * R2 presigned URLs during development and tests. Every request must carry a
 * valid HMAC signature and an unexpired timestamp.
 */
export async function GET(request: Request, { params }: RouteContext<"/api/media/[...key]">) {
  if (getEnv().STORAGE_DRIVER !== "local") return new Response("Not found", { status: 404 });

  const key = (await params).key.join("/");
  const { searchParams } = new URL(request.url);
  const downloadAs = searchParams.get("dl") ?? undefined;
  const valid = verifyLocalUrl({
    key,
    expires: Number(searchParams.get("e")),
    downloadAs,
    signature: searchParams.get("s") ?? "",
  });
  if (!valid) return new Response("Forbidden", { status: 403 });

  try {
    const body = await readLocalPrivate(key);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type":
          CONTENT_TYPES[path.extname(key).toLowerCase()] ?? "application/octet-stream",
        // Images may be reused by the same browser while their URL is valid.
        "Cache-Control": downloadAs ? "private, no-store" : PRIVATE_IMAGE_CACHE,
        ...(downloadAs ? { "Content-Disposition": attachmentDisposition(downloadAs) } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
