interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

function TocList({ entries }: { entries: TocEntry[] }) {
  return (
    <ul className="list-none space-y-2 p-0">
      {entries.map((entry) => (
        <li key={entry.url}>
          <a href={entry.url} className="text-muted-foreground hover:text-foreground">
            {entry.title}
          </a>
          {entry.items.length > 0 ? (
            <div className="mt-2 pl-4">
              <TocList entries={entry.items} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** A table of contents built from a document's headings. */
export function Toc({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 2) return null;
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 font-semibold">On this page</p>
      <TocList entries={entries} />
    </nav>
  );
}
