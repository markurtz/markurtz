import type { Metadata } from "next";

import { StatefulForm } from "@/components/private/stateful-form";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { createGateAction, gateAction } from "@/server/actions/admin";
import { requireAdmin } from "@/server/auth/access";
import { listGates } from "@/server/dal/gates";

export const metadata: Metadata = { title: "Gates" };

/** Passcode gates for unlisted pages at `/p/<key>`. */
export default async function AdminGatesPage() {
  await requireAdmin();
  const gates = await listGates();

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Gates</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        A gate puts a passcode in front of a page. Create the gate here, then add a file to{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">content/private/</code>{" "}
        with the same key in its{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">gate</code> field. The
        repository is public, so these pages are unlisted, not secret.
      </p>

      <ul className="mt-8 list-none space-y-4 p-0">
        {gates.map((gate) => (
          <li key={gate.id}>
            <Card className="p-5">
              <p className="font-semibold">{gate.label}</p>
              <p className="text-muted-foreground text-sm">
                <span className="font-mono">/p/{gate.key}</span>
                {gate.expiresAt ? ` · expires ${formatDate(gate.expiresAt.toISOString())}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                <StatefulForm
                  action={gateAction}
                  submitLabel="New passcode"
                  submitVariant="outline"
                  inline
                >
                  <input type="hidden" name="id" value={gate.id} />
                  <input type="hidden" name="key" value={gate.key} />
                  <input type="hidden" name="op" value="rotate" />
                </StatefulForm>
                <StatefulForm
                  action={gateAction}
                  submitLabel="Delete"
                  submitVariant="danger"
                  inline
                >
                  <input type="hidden" name="id" value={gate.id} />
                  <input type="hidden" name="key" value={gate.key} />
                  <input type="hidden" name="op" value="delete" />
                </StatefulForm>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="mt-10 max-w-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">New gate</h2>
        <StatefulForm action={createGateAction} submitLabel="Create gate">
          <div>
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              name="key"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={80}
              autoCapitalize="none"
              required
            />
          </div>
          <div>
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" maxLength={140} required />
          </div>
          <div>
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              name="passcode"
              autoComplete="off"
              placeholder="Leave empty to generate four words"
            />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expires on (optional)</Label>
            <Input id="expiresAt" name="expiresAt" type="date" />
          </div>
        </StatefulForm>
      </Card>
    </>
  );
}
