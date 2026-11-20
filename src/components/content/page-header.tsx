import type { ReactNode } from "react";

/** The title block at the top of a page. */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-10 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description ? (
        <p className="text-muted-foreground mt-3 text-lg text-pretty">{description}</p>
      ) : null}
      {children}
    </header>
  );
}

/** A titled section with an optional "view all" link. */
export function Section({
  title,
  href,
  linkLabel = "View all",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="mt-16">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {href ? (
          <a href={href} className="text-accent text-sm font-medium hover:underline">
            {linkLabel} <span aria-hidden>→</span>
            <span className="sr-only"> {title.toLowerCase()}</span>
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}
