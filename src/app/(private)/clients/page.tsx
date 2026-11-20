import type { Metadata } from "next";
import Link from "next/link";

import { PasscodeForm } from "@/components/gallery/passcode-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";
import { signOut } from "@/server/actions/auth";
import { unlockGallery } from "@/server/actions/unlock";
import { getCurrentUser, requirePrivateArea } from "@/server/auth/access";
import { listGalleriesForUser } from "@/server/dal/galleries";

export const metadata: Metadata = { title: siteConfig.clientArea.label };

/** The client area's front door: enter a passcode, or sign in to see your galleries. */
export default async function ClientsPage() {
  requirePrivateArea("clientGalleries");
  const user = await getCurrentUser();
  const galleries = user ? await listGalleriesForUser(user.id) : [];

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">{siteConfig.clientArea.label}</h1>

      {user ? (
        <section aria-labelledby="your-galleries" className="mt-8">
          <h2 id="your-galleries" className="text-lg font-semibold">
            Your galleries
          </h2>
          <p className="text-muted-foreground text-sm">Signed in as {user.email}</p>
          {galleries.length === 0 ? (
            <p className="text-muted-foreground mt-4">
              No galleries are shared with this account yet.
            </p>
          ) : (
            <ul className="mt-4 list-none space-y-2 p-0">
              {galleries.map((gallery) => (
                <li key={gallery.id}>
                  <Link
                    href={`/clients/g/${gallery.slug}`}
                    className="hover:border-accent block rounded-lg border p-4 font-medium"
                  >
                    {gallery.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <form action={signOut} className="mt-4">
            <input type="hidden" name="destination" value="clients" />
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </section>
      ) : null}

      <Card className="mt-8 p-6">
        <h2 className="text-lg font-semibold">Open a gallery with a passcode</h2>
        <p className="text-muted-foreground mt-1 mb-4 text-sm">
          If you were sent a link, opening it is quicker than filling this in.
        </p>
        <PasscodeForm action={unlockGallery} fields={{}} askName />
      </Card>

      {!user ? (
        <p className="text-muted-foreground mt-6 text-sm">
          Have an account?{" "}
          <Link href="/clients/sign-in" className="text-accent hover:underline">
            Sign in with your email
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
