import { buildSearchDocuments } from "@/lib/search";

export const dynamic = "force-static";

/** The documents the command menu indexes in the browser. */
export function GET() {
  return Response.json(buildSearchDocuments());
}
