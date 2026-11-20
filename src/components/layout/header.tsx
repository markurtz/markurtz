import Link from "next/link";

import { CommandMenu } from "@/components/layout/command-menu";
import { DesktopNav, MobileNav } from "@/components/layout/nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/lib/site";

/** Navigation entries whose feature is switched on. */
export function getNavItems() {
  const { features } = siteConfig;
  const hidden = new Set<string>();
  if (!features.blog) hidden.add("/blog");
  if (!features.research) hidden.add("/research");
  if (!features.photos) hidden.add("/photos");
  if (!features.contact) hidden.add("/contact");
  return siteConfig.nav.filter((item) => !hidden.has(item.href));
}

/** The site header: name, config-driven navigation, search and theme toggle. */
export function Header() {
  const items = getNavItems();

  return (
    <header className="bg-background/85 no-print sticky top-0 z-40 border-b backdrop-blur">
      <div className="container-content relative flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-1">
          <DesktopNav items={items} />
          {siteConfig.features.search ? <CommandMenu /> : null}
          <ThemeToggle />
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}
