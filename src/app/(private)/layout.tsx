import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/lib/site";

// Private pages depend on the session and the database on every request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Layout for the private area (`/clients`, `/admin`, `/p`). Access is checked
 * by each page, not here, because layouts do not re-render on navigation.
 * `noindex`, `no-store` and `no-referrer` headers are set in next.config.ts.
 */
export default function PrivateLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
        <div className="container-content flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="container-content flex-1 py-10 outline-none">
        {children}
      </main>
      <footer className="text-muted-foreground container-content border-t py-6 text-sm">
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
      </footer>
    </>
  );
}
