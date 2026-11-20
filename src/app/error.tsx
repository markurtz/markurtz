"use client";

import { Button } from "@/components/ui/button";

/** Shown when a page throws while rendering. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main"
      className="container-content flex flex-1 flex-col items-start justify-center gap-4 py-24"
    >
      <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error occurred. {error.digest ? `Reference: ${error.digest}` : null}
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
