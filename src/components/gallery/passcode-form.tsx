"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

interface State {
  error?: string;
}

/**
 * The passcode prompt for a gallery, shared collection or gated page.
 * `fields` are hidden inputs that tell the action what is being unlocked.
 */
export function PasscodeForm({
  action,
  fields,
  askName = false,
}: {
  action: (state: State, formData: FormData) => Promise<State>;
  fields: Record<string, string>;
  /** Also ask for the gallery name, on the page where it is not in the URL. */
  askName?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {askName ? (
        <div>
          <Label htmlFor="slug">Gallery name</Label>
          <Input
            id="slug"
            name="slug"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          <p className="text-muted-foreground mt-1 text-xs">
            The last part of the link you were sent.
          </p>
        </div>
      ) : null}
      <div>
        <Label htmlFor="passcode">Passcode</Label>
        <Input
          id="passcode"
          name="passcode"
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Open"}
      </Button>
      {state.error ? (
        <p role="alert" className="text-danger text-sm font-medium">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
