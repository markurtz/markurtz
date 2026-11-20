import { CircleAlert, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const styles = {
  note: { icon: Info, className: "border-accent/40 bg-accent/5", label: "Note" },
  tip: { icon: Lightbulb, className: "border-success/40 bg-success/5", label: "Tip" },
  warning: { icon: TriangleAlert, className: "border-warning/50 bg-warning/10", label: "Warning" },
  danger: { icon: CircleAlert, className: "border-danger/40 bg-danger/5", label: "Caution" },
} as const;

export type CalloutType = keyof typeof styles;

/** A highlighted note, tip or warning inside long-form content. */
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, className, label } = styles[type] ?? styles.note;

  return (
    <aside className={cn("not-prose my-6 flex gap-3 rounded-lg border p-4 text-sm", className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1 [&_a]:underline [&_code]:font-mono [&_code]:text-[0.85em]">
        <p className="font-semibold">{title ?? label}</p>
        <div className="[&_p]:leading-relaxed">{children}</div>
      </div>
    </aside>
  );
}
