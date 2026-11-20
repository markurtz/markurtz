"use client";

import { type ReactNode, useState } from "react";

import { cn } from "@/lib/utils";

/** A year of pre-rendered papers, each tagged with its type for filtering. */
export interface PaperGroup {
  year: number;
  items: { slug: string; type: string; node: ReactNode }[];
}

const ALL = "all";

/** Papers grouped by year with type filter buttons. Without JavaScript the full list shows. */
export function PaperList({ groups, types }: { groups: PaperGroup[]; types: string[] }) {
  const [filter, setFilter] = useState(ALL);
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => filter === ALL || item.type === filter),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {types.length > 1 ? (
        <div
          role="group"
          aria-label="Filter by publication type"
          className="mb-8 flex flex-wrap gap-2"
        >
          {[ALL, ...types].map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium capitalize",
                filter === type
                  ? "bg-accent text-accent-foreground border-transparent"
                  : "hover:bg-muted",
              )}
            >
              {type}
            </button>
          ))}
        </div>
      ) : null}
      {visibleGroups.map((group) => (
        <section key={group.year} aria-labelledby={`year-${group.year}`} className="mb-10">
          <h2
            id={`year-${group.year}`}
            className="text-muted-foreground border-b pb-2 text-xl font-semibold"
          >
            {group.year}
          </h2>
          <ul className="list-none divide-y p-0">
            {group.items.map((item) => (
              <li key={item.slug}>{item.node}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
