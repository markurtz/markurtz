import type { Metadata } from "next";

import { PageHeader } from "@/components/content/page-header";
import { CategoryFilter, ProjectGrid } from "@/components/content/project-grid";
import { getProjects } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Projects";
const DESCRIPTION = "Software, 3D printing, woodworking and other things I have built.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/projects",
});

/** Every project across all categories. */
export default function ProjectsPage() {
  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />
      <CategoryFilter />
      <ProjectGrid projects={getProjects()} />
    </>
  );
}
