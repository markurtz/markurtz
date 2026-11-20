import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { StatefulForm } from "@/components/private/stateful-form";
import { Input, Label, Textarea } from "@/components/ui/input";
import { contactReady } from "@/lib/features";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { sendContactMessage } from "@/server/actions/contact";

const TITLE = "Contact";
const DESCRIPTION = "Send me a message.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/contact",
});

/** The contact form, shown only when `features.contact` is on. */
export default function ContactPage() {
  if (!siteConfig.features.contact) notFound();

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />
      {contactReady() ? (
        <StatefulForm action={sendContactMessage} submitLabel="Send message" className="max-w-xl">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" maxLength={120} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          {/* Honeypot: hidden from people and assistive technology. */}
          <div aria-hidden className="hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" minLength={10} maxLength={5000} required />
          </div>
        </StatefulForm>
      ) : (
        <p className="text-muted-foreground">The contact form is not configured yet.</p>
      )}
    </>
  );
}
