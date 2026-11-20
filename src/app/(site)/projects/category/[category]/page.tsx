import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/content/page-header";
import { CategoryFilter, ProjectGrid } from "@/components/content/project-grid";
import { getCategory, getProjectsByCategory } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

/** One listing page per category in `site.config.ts`. */
export function generateStaticParams() {
  return siteConfig.projectCategories.map((category) => ({ category: category.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/category/[category]">): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return {};
  return buildMetadata({
    title: `${category.label} projects`,
    description: category.description,
    path: `/projects/category/${category.id}`,
  });
}

/** Projects in one category. */
export default async function CategoryPage({ params }: PageProps<"/projects/category/[category]">) {
  const category = getCategory((await params).category);
  if (!category) notFound();

  return (
    <>
      <PageHeader title={category.label} description={category.description} />
      <CategoryFilter active={category.id} />
      <ProjectGrid projects={getProjectsByCategory(category.id)} />
    </>
  );
}
