import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PasscodeForm } from "@/components/gallery/passcode-form";
import { Card } from "@/components/ui/card";
import { unlockGallery } from "@/server/actions/unlock";
import { getGalleryAccess } from "@/server/auth/access";

export const metadata: Metadata = { title: "Enter passcode" };

/**
 * The passcode prompt for a gallery. It renders identically whether or not the
 * gallery exists, so gallery names cannot be discovered here.
 */
export default async function UnlockPage({ params }: PageProps<"/clients/g/[slug]/unlock">) {
  const { slug } = await params;
  if (await getGalleryAccess(slug)) redirect(`/clients/g/${slug}`);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">This gallery is private</h1>
      <p className="text-muted-foreground mt-2">Enter the passcode you were given to view it.</p>
      <Card className="mt-6 p-6">
        <PasscodeForm action={unlockGallery} fields={{ slug }} />
      </Card>
    </div>
  );
}
