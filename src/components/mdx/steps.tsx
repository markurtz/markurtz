import type { ReactNode } from "react";

/** A numbered list of build-log steps. Wrap `<Step>` elements. */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="not-prose my-8 ml-4 list-none space-y-6 border-l pl-8 [counter-reset:step]">
      {children}
    </ol>
  );
}

/** One step inside `<Steps>`. */
export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="before:bg-muted relative [counter-increment:step] before:absolute before:-left-12 before:flex before:size-8 before:items-center before:justify-center before:rounded-full before:border before:text-sm before:font-semibold before:content-[counter(step)]">
      <p className="font-semibold">{title}</p>
      <div className="text-muted-foreground mt-1 text-[0.95rem] leading-relaxed [&_a]:underline [&_code]:font-mono [&_code]:text-[0.85em]">
        {children}
      </div>
    </li>
  );
}
