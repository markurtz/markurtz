import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/server/actions/auth";
import { requireAdmin } from "@/server/auth/access";

const links = [
  { href: "/admin", label: "Galleries" },
  { href: "/admin/gates", label: "Gates" },
  { href: "/admin/log", label: "Access log" },
];

/**
 * Admin navigation. `requireAdmin()` runs here for the first load and again in
 * every admin page and action, because layouts are not re-run on navigation.
 */
export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await requireAdmin();

  return (
    <>
      <nav aria-label="Admin" className="mb-8 flex flex-wrap items-center gap-2 border-b pb-4">
        <ul className="mr-auto flex list-none flex-wrap gap-1 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:bg-muted rounded-md px-3 py-2 text-sm font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <span className="text-muted-foreground text-sm">{user.email}</span>
        <form action={signOut}>
          <input type="hidden" name="destination" value="admin" />
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </nav>
      {children}
    </>
  );
}
