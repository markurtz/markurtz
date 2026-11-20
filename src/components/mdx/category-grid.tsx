import { Box, Camera, Code, Hammer, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";

import { getProjectsByCategory } from "@/lib/content";
import { siteConfig } from "@/lib/site";

/** Icons a project category can use in `site.config.ts`. */
export const categoryIcons = {
  code: Code,
  box: Box,
  hammer: Hammer,
  wrench: Wrench,
  camera: Camera,
  sparkles: Sparkles,
};

/** The configured project categories, plus photos, as linked cards. */
export function CategoryGrid() {
  const cards = siteConfig.projectCategories.map((category) => ({
    href: `/projects/category/${category.id}`,
    label: category.label,
    description: category.description,
    icon: categoryIcons[category.icon],
    count: getProjectsByCategory(category.id).length,
  }));
  if (siteConfig.features.photos) {
    cards.push({
      href: "/photos",
      label: "Photography",
      description: "Albums and travel.",
      icon: Camera,
      count: -1,
    });
  }

  return (
    <ul className="not-prose my-8 grid list-none gap-4 p-0 sm:grid-cols-2">
      {cards.map(({ href, label, description, icon: Icon, count }) => (
        <li key={href}>
          <Link
            href={href}
            className="bg-card hover:border-accent flex h-full gap-4 rounded-xl border p-5 transition-colors"
          >
            <Icon className="text-accent mt-0.5 size-6 shrink-0" aria-hidden />
            <span>
              <span className="block font-semibold">{label}</span>
              {description ? (
                <span className="text-muted-foreground block text-sm">{description}</span>
              ) : null}
              {count >= 0 ? (
                <span className="text-muted-foreground mt-1 block text-xs">
                  {count} {count === 1 ? "project" : "projects"}
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
