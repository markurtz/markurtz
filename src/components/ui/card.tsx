import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** A bordered surface for grouping related content. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-card rounded-xl border", className)} {...props} />;
}
