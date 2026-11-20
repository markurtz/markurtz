import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/server/auth/access";
import { listRecentEvents } from "@/server/dal/events";

export const metadata: Metadata = { title: "Access log" };

const TONES = {
  unlock_ok: "success",
  unlock_fail: "danger",
  view: "neutral",
  download: "accent",
  share_create: "accent",
} as const;

const SHORT_HASH = 10;
const timeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** The most recent unlocks, views, downloads and shares. IPs appear only as salted hashes. */
export default async function AdminLogPage() {
  await requireAdmin();
  const events = await listRecentEvents();

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Access log</h1>
      <p className="text-muted-foreground mt-2">
        The latest {events.length} events. Times are in UTC.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground border-b">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">
                Time
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Event
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Where
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Visitor
              </th>
              <th scope="col" className="py-2 font-medium">
                Browser
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="py-2 pr-4 whitespace-nowrap">{timeFormat.format(event.at)}</td>
                <td className="py-2 pr-4">
                  <Badge tone={TONES[event.kind]}>{event.kind.replace("_", " ")}</Badge>
                </td>
                <td className="py-2 pr-4">
                  {event.galleryTitle ?? (event.gateKey ? `gate: ${event.gateKey}` : "unknown")}
                  {event.collectionId ? " (collection)" : ""}
                </td>
                <td className="py-2 pr-4 font-mono text-xs">{event.ipHash.slice(0, SHORT_HASH)}</td>
                <td className="text-muted-foreground max-w-xs truncate py-2 text-xs">
                  {event.userAgent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
