/* eslint-disable @next/next/no-img-element -- covers are static files sized by Velite; the Vercel image optimizer is deliberately not used. */
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getCategory, type Project } from "@/lib/content";

const STATUS_LABELS: Record<Project["status"], string | null> = {
  idea: "Idea",
  "in-progress": "In progress",
  completed: null,
  archived: "Archived",
};

/** A project in a grid, with its cover, category and status. */
export function ProjectCard({ project }: { project: Project }) {
  const category = getCategory(project.category);
  const status = STATUS_LABELS[project.status];

  return (
    <article className="group bg-card hover:border-accent relative flex h-full flex-col overflow-hidden rounded-xl border transition-colors">
      {project.cover ? (
        <img
          src={project.cover.src}
          alt={project.coverAlt ?? ""}
          width={project.cover.width}
          height={project.cover.height}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full object-cover"
          style={{ background: `center / cover url("${project.cover.blurDataURL}")` }}
        />
      ) : (
        <div className="bg-muted aspect-video w-full" aria-hidden />
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="flex flex-wrap gap-2">
          {category ? <Badge tone="accent">{category.label}</Badge> : null}
          {status ? <Badge>{status}</Badge> : null}
        </p>
        <h3 className="text-lg font-semibold tracking-tight">
          <Link href={project.url} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm">{project.description}</p>
      </div>
    </article>
  );
}
