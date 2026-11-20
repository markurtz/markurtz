import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { PasscodeForm } from "@/components/gallery/passcode-form";
import { Mdx } from "@/components/mdx";
import { Card } from "@/components/ui/card";
import { getPrivatePage } from "@/lib/content";
import { unlockGate } from "@/server/actions/unlock";
import { requireGate } from "@/server/auth/access";

export const metadata: Metadata = { title: "Private page" };

/**
 * A page behind a passcode gate. The content comes from `content/private/`
 * and is rendered only after the gate check passes. A key with no gate looks
 * exactly like a locked one.
 */
export default async function GatedPage({ params }: PageProps<"/p/[key]">) {
  const { key } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(key)) notFound();
  const access = await requireGate(key);

  if (access.status === "locked") {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">This page is private</h1>
        <p className="text-muted-foreground mt-2">Enter the passcode you were given to view it.</p>
        <Card className="mt-6 p-6">
          <PasscodeForm action={unlockGate} fields={{ key }} />
        </Card>
      </div>
    );
  }

  const page = getPrivatePage(key);
  if (!page) notFound();

  return (
    <article>
      <PageHeader title={page.title} description={page.description} />
      <Mdx code={page.body} />
    </article>
  );
}
