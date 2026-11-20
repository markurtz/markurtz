"use client";

import { type ReactNode, useActionState } from "react";

import { CopyButton } from "@/components/content/copy-button";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Everything a form action in the private area can report back. */
export interface FormResult {
  error?: string;
  message?: string;
  /** A passcode that is shown once, with the link it unlocks. */
  passcode?: string;
  link?: string;
  /** A share link that is shown once. */
  url?: string;
}

/**
 * A form bound to a server action through `useActionState`. It shows the
 * action's error or confirmation, and reveals one-time secrets (a new passcode
 * or share link) with copy buttons. Fields are passed as children, so server
 * components can build forms without each one needing its own client file.
 */
export function StatefulForm({
  action,
  children,
  submitLabel,
  submitVariant,
  className,
  inline = false,
}: {
  action: (state: FormResult, formData: FormData) => Promise<FormResult>;
  children?: ReactNode;
  submitLabel: string;
  submitVariant?: ButtonProps["variant"];
  className?: string;
  /** Lay the fields and button out in a row. */
  inline?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className={cn(inline ? "flex flex-wrap items-end gap-3" : "space-y-4", className)}
    >
      {children}
      <Button type="submit" variant={submitVariant} disabled={pending}>
        {pending ? "Working…" : submitLabel}
      </Button>
      <div aria-live="polite" className={cn("text-sm", inline && "basis-full")}>
        {state.error ? (
          <p role="alert" className="text-danger font-medium">
            {state.error}
          </p>
        ) : null}
        {state.message ? <p className="text-success font-medium">{state.message}</p> : null}
        {state.passcode ? (
          <div className="border-warning/50 bg-warning/10 mt-2 space-y-2 rounded-lg border p-4">
            <p className="font-medium">
              Copy this passcode now. It is not stored and will not be shown again.
            </p>
            <p className="flex flex-wrap items-center gap-3">
              <code
                data-testid="new-passcode"
                className="bg-background rounded px-2 py-1 font-mono text-base"
              >
                {state.passcode}
              </code>
              <CopyButton text={state.passcode} label="Copy passcode" />
            </p>
            {state.link ? (
              <p className="flex flex-wrap items-center gap-3">
                <code className="bg-background rounded px-2 py-1 font-mono break-all">
                  {state.link}
                </code>
                <CopyButton text={state.link} label="Copy link" />
              </p>
            ) : null}
          </div>
        ) : null}
        {state.url ? (
          <div className="border-warning/50 bg-warning/10 mt-2 space-y-2 rounded-lg border p-4">
            <p className="font-medium">Copy this link now. It will not be shown again.</p>
            <p className="flex flex-wrap items-center gap-3">
              <code
                data-testid="share-url"
                className="bg-background rounded px-2 py-1 font-mono break-all"
              >
                {state.url}
              </code>
              <CopyButton text={state.url} label="Copy link" />
            </p>
          </div>
        ) : null}
      </div>
    </form>
  );
}
