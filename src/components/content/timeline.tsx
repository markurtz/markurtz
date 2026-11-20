import type { ReactNode } from "react";

/** One entry on a timeline. */
export interface TimelineEntry {
  key: string;
  title: string;
  subtitle?: string;
  period: string;
  location?: string;
  body?: ReactNode;
}

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats `YYYY` or `YYYY-MM` for display. */
export function formatPeriodDate(value: string): string {
  return /^\d{4}$/.test(value) ? value : monthFormat.format(new Date(`${value}-01T00:00:00Z`));
}

/** Formats a start and optional end as a range, with "Present" for current roles. */
export function formatPeriod(start: string, end?: string): string {
  return `${formatPeriodDate(start)} to ${end ? formatPeriodDate(end) : "Present"}`;
}

/** A vertical timeline for work history and education. */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="list-none space-y-8 border-l p-0 pl-6">
      {entries.map((entry) => (
        <li
          key={entry.key}
          className="before:bg-accent relative before:absolute before:top-2 before:-left-[1.8rem] before:size-2.5 before:rounded-full"
        >
          <p className="text-muted-foreground text-sm">
            {entry.period}
            {entry.location ? ` · ${entry.location}` : ""}
          </p>
          <h3 className="text-lg font-semibold tracking-tight">{entry.title}</h3>
          {entry.subtitle ? <p className="font-medium">{entry.subtitle}</p> : null}
          {entry.body ? (
            <div className="text-muted-foreground mt-2 space-y-2 text-[0.95rem]">{entry.body}</div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
