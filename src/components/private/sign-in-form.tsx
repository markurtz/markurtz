"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestSignInCode, type SignInState, verifySignInCode } from "@/server/actions/auth";

const initial: SignInState = { step: "email" };

/**
 * Two-step sign-in: enter an email, then the one-time code sent to it. The
 * first step answers the same way for every address.
 */
export function SignInForm({ destination }: { destination: "admin" | "clients" }) {
  const [requested, requestAction, requesting] = useActionState(requestSignInCode, initial);
  const [verified, verifyAction, verifying] = useActionState(verifySignInCode, initial);
  const email = verified.email ?? requested.email;

  if (requested.step === "email") {
    return (
      <form action={requestAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" disabled={requesting}>
          {requesting ? "Sending…" : "Send me a code"}
        </Button>
        {requested.error ? (
          <p role="alert" className="text-danger text-sm font-medium">
            {requested.error}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form action={verifyAction} className="space-y-4">
      <p className="text-muted-foreground text-sm" role="status">
        If {email} has access, a sign-in code is on its way. Enter it below.
      </p>
      <input type="hidden" name="email" value={email ?? ""} />
      <input type="hidden" name="destination" value={destination} />
      <div>
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6,10}"
          required
        />
      </div>
      <Button type="submit" disabled={verifying}>
        {verifying ? "Checking…" : "Sign in"}
      </Button>
      {verified.error ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {verified.error}
        </p>
      ) : null}
    </form>
  );
}
