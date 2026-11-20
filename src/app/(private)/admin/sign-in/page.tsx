import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/private/sign-in-form";
import { Card } from "@/components/ui/card";
import { getCurrentUser, isAdminUser, requirePrivateArea } from "@/server/auth/access";

export const metadata: Metadata = { title: "Admin sign in" };

/** Email sign-in for the site owner. Only allowlisted addresses receive a code. */
export default async function AdminSignInPage() {
  requirePrivateArea();
  if (isAdminUser(await getCurrentUser())) redirect("/admin");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Admin sign in</h1>
      <Card className="mt-6 p-6">
        <SignInForm destination="admin" />
      </Card>
    </div>
  );
}
