"use client";

import { Search } from "lucide-react";
import type MiniSearch from "minisearch";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { SearchDocument } from "@/lib/search";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 8;

/**
 * Site search in a dialog, opened with the header button or Ctrl/Cmd+K.
 * The index is fetched and built only when the dialog first opens.
 */
export function CommandMenu() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const indexRef = useRef<MiniSearch<SearchDocument> | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDocument[]>([]);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const load = useCallback(async () => {
    if (indexRef.current) return;
    setStatus("loading");
    try {
      const [{ default: MiniSearchCtor }, response] = await Promise.all([
        import("minisearch"),
        fetch("/search.json"),
      ]);
      const documents = (await response.json()) as SearchDocument[];
      const index = new MiniSearchCtor<SearchDocument>({
        fields: ["title", "description", "tags", "type"],
        storeFields: ["id", "title", "description", "url", "type", "external"],
        searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 3, tags: 2 } },
      });
      index.addAll(documents);
      indexRef.current = index;
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
    void load();
  }, [load]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const search = (value: string) => {
    setQuery(value);
    setActive(0);
    const hits = value.trim() ? (indexRef.current?.search(value).slice(0, MAX_RESULTS) ?? []) : [];
    setResults(hits as unknown as SearchDocument[]);
  };

  const go = (result: SearchDocument | undefined) => {
    if (!result) return;
    dialogRef.current?.close();
    if (result.external) window.open(result.url, "_blank", "noopener");
    else router.push(result.url);
  };

  return (
    <>
      <Button variant="ghost" size="icon" aria-label="Search" onClick={open}>
        <Search aria-hidden />
      </Button>
      <dialog
        ref={dialogRef}
        aria-label="Search"
        onClose={() => search("")}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="bg-card text-foreground m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-xl border p-0 shadow-xl backdrop:bg-black/50"
      >
        <div className="p-3">
          <label htmlFor="site-search" className="sr-only">
            Search the site
          </label>
          <input
            id="site-search"
            type="search"
            autoComplete="off"
            placeholder="Search posts, projects, papers and albums"
            value={query}
            onChange={(event) => search(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                go(results[active]);
              }
            }}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="site-search-results"
            aria-activedescendant={results[active] ? `search-result-${active}` : undefined}
            className="bg-background w-full rounded-md border px-3 py-2 text-base"
          />
        </div>
        <ul
          id="site-search-results"
          role="listbox"
          aria-label="Results"
          className="max-h-[50vh] overflow-y-auto px-3 pb-3"
        >
          {results.map((result, index) => (
            <li
              key={result.id}
              id={`search-result-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(result)}
              className={cn("cursor-pointer rounded-md px-3 py-2", index === active && "bg-muted")}
            >
              <span className="text-muted-foreground mr-2 text-xs tracking-wide uppercase">
                {result.type}
              </span>
              <span className="font-medium">{result.title}</span>
              {result.description ? (
                <span className="text-muted-foreground block truncate text-sm">
                  {result.description}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground border-t px-4 py-2 text-xs" aria-live="polite">
          {status === "loading" && "Loading the search index…"}
          {status === "error" && "Search is unavailable right now."}
          {status === "ready" && query.trim() && results.length === 0 && "No results."}
          {status === "ready" &&
            (!query.trim() || results.length > 0) &&
            "Arrow keys to move, Enter to open, Esc to close."}
        </p>
      </dialog>
    </>
  );
}
