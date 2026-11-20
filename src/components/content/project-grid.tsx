import Link from "next/link";

import { ProjectCard } from "@/components/content/project-card";
import type { Project } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Links to each project category, with the current one marked. */
export function CategoryFilter({ active }: { active?: string }) {
  const items = [
    { id: undefined, label: "All", href: "/projects" },
    ...siteConfig.projectCategories.map((category) => ({
      id: category.id,
      label: category.label,
      href: `/projects/category/${category.id}`,
    })),
  ];
  return (
    <nav aria-label="Project categories" className="mb-8">
      <ul className="flex list-none flex-wrap gap-2 p-0">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.id === active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium",
                item.id === active
                  ? "bg-accent text-accent-foreground border-transparent"
                  : "hover:bg-muted",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A responsive grid of project cards. */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return <p className="text-muted-foreground">No projects here yet.</p>;
  return (
    <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
