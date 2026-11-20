import type { Metadata } from "next";
import Link from "next/link";

import { StatefulForm } from "@/components/private/stateful-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { createGalleryAction } from "@/server/actions/admin";
import { isExpired, requireAdmin } from "@/server/auth/access";
import { listGalleries } from "@/server/dal/galleries";

export const metadata: Metadata = { title: "Admin" };

const STATUS_TONES = { draft: "neutral", published: "success", archived: "warning" } as const;

/** The admin home: every gallery, and a form to create one. */
export default async function AdminPage() {
  await requireAdmin();
  const galleries = await listGalleries();

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Galleries</h1>

      {galleries.length === 0 ? (
        <p className="text-muted-foreground mt-6">No galleries yet. Create the first one below.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Gallery
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Client
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Status
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Photos
                </th>
                <th scope="col" className="py-2 font-medium">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {galleries.map((gallery) => (
                <tr key={gallery.id}>
                  <th scope="row" className="py-3 pr-4 font-medium">
                    <Link
                      href={`/admin/galleries/${gallery.id}`}
                      className="text-accent hover:underline"
                    >
                      {gallery.title}
                    </Link>
                    <span className="text-muted-foreground block font-mono text-xs font-normal">
                      {gallery.slug}
                    </span>
                  </th>
                  <td className="py-3 pr-4">{gallery.clientName}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={STATUS_TONES[gallery.status]}>{gallery.status}</Badge>
                    {!gallery.passcodeHash ? <Badge className="ml-1">no passcode</Badge> : null}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{gallery.photoCount}</td>
                  <td className="py-3">
                    {gallery.expiresAt ? formatDate(gallery.expiresAt.toISOString()) : "Never"}
                    {isExpired(gallery.expiresAt) ? (
                      <Badge tone="danger" className="ml-1">
                        expired
                      </Badge>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Card className="mt-10 max-w-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">New gallery</h2>
        <StatefulForm action={createGalleryAction} submitLabel="Create gallery">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" maxLength={140} required />
          </div>
          <div>
            <Label htmlFor="slug">Link name</Label>
            <Input
              id="slug"
              name="slug"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={80}
              autoCapitalize="none"
              required
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Lowercase letters, digits and dashes. The gallery will be at /clients/g/link-name.
            </p>
          </div>
          <div>
            <Label htmlFor="clientName">Client name (optional)</Label>
            <Input id="clientName" name="clientName" maxLength={140} />
          </div>
          <div>
            <Label htmlFor="shootDate">Shoot date (optional)</Label>
            <Input id="shootDate" name="shootDate" type="date" />
          </div>
        </StatefulForm>
      </Card>
    </>
  );
}
