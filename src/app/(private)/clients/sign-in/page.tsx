import type { Metadata } from "next";

import { SignInForm } from "@/components/private/sign-in-form";
import { Card } from "@/components/ui/card";
import { requirePrivateArea } from "@/server/auth/access";

export const metadata: Metadata = { title: "Sign in" };

/** Email sign-in for invited clients. */
export default function ClientSignInPage() {
  requirePrivateArea("clientGalleries");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="text-muted-foreground mt-2">
        For clients who were invited by email. No password is needed: a one-time code is sent to
        you.
      </p>
      <Card className="mt-6 p-6">
        <SignInForm destination="clients" />
      </Card>
    </div>
  );
}
