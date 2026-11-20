/* eslint-disable @next/next/no-img-element -- covers are static files sized by Velite; the Vercel image optimizer is deliberately not used. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { TagList } from "@/components/content/tag-list";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { Mdx } from "@/components/mdx";
import { BillOfMaterials } from "@/components/mdx/bill-of-materials";
import { GitHubRepo } from "@/components/mdx/github-repo";
import { ModelViewer } from "@/components/mdx/model-viewer";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCategory, getProject, getProjects, type Project } from "@/lib/content";
import { repoFromUrl } from "@/lib/github";
import { breadcrumbJsonLd, buildMetadata, projectJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

const LINK_LABELS: Record<keyof Project["links"], string> = {
  repo: "Source",
  demo: "Demo",
  docs: "Docs",
  printables: "Model files",
  video: "Video",
};

const STATUS_LABELS: Record<Project["status"], string> = {
  idea: "Idea",
  "in-progress": "In progress",
  completed: "Completed",
  archived: "Archived",
};

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.description,
    path: project.url,
    image: project.cover?.src,
    type: "article",
    publishedTime: project.date,
  });
}

function Facts({ project }: { project: Project }) {
  const facts: [string, string][] = [];
  facts.push(["Status", STATUS_LABELS[project.status]]);
  if (project.buildTime) facts.push(["Build time", project.buildTime]);
  if (project.difficulty) facts.push(["Difficulty", `${project.difficulty} of 5`]);
  if (project.tech.length > 0) facts.push(["Built with", project.tech.join(", ")]);
  if (project.tools.length > 0) facts.push(["Tools", project.tools.join(", ")]);

  return (
    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
      {facts.map(([term, value]) => (
        <div key={term}>
          <dt className="text-muted-foreground">{term}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A project page. One template serves every category: each section renders
 * only when the project has data for it.
 */
export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const category = getCategory(project.category);
  const links = (Object.keys(LINK_LABELS) as (keyof Project["links"])[]).filter(
    (key) => project.links[key],
  );
  const repo = repoFromUrl(project.links.repo);
  const usesInlineBom = /<BillOfMaterials\b/.test(project.raw);
  const usesInlineRepo = /<GitHubRepo\b/.test(project.raw);

  return (
    <article>
      <JsonLd
        data={[
          projectJsonLd(project),
          breadcrumbJsonLd([
            { name: "Projects", path: "/projects" },
            ...(category
              ? [{ name: category.label, path: `/projects/category/${category.id}` }]
              : []),
            { name: project.title, path: project.url },
          ]),
        ]}
      />
      <header className="mb-10 max-w-3xl">
        <p className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/projects" className="text-accent hover:underline">
            <span aria-hidden>←</span> Projects
          </Link>
          {category ? (
            <Link href={`/projects/category/${category.id}`}>
              <Badge tone="accent">{category.label}</Badge>
            </Link>
          ) : null}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {project.title}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg text-pretty">{project.description}</p>
        <p className="text-muted-foreground mt-3 text-sm">
          <time dateTime={project.date}>{formatDate(project.date, { day: undefined })}</time>
        </p>
        {links.length > 0 ? (
          <ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
            {links.map((key) => (
              <li key={key}>
                <a
                  href={project.links[key]}
                  rel="noopener"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {LINK_LABELS[key]}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5">
          <TagList tags={project.tags} linked={false} />
        </div>
      </header>

      <div className="max-w-(--prose-width)">
        {project.cover ? (
          <img
            src={project.cover.src}
            alt={project.coverAlt ?? ""}
            width={project.cover.width}
            height={project.cover.height}
            fetchPriority="high"
            className="mb-8 w-full rounded-xl border"
            style={{ background: `center / cover url("${project.cover.blurDataURL}")` }}
          />
        ) : null}

        <section aria-label="Project details" className="bg-muted mb-10 rounded-lg p-5">
          <Facts project={project} />
        </section>

        {repo && !usesInlineRepo ? <GitHubRepo repo={repo} /> : null}

        {project.models.map((model) => (
          <ModelViewer key={model} src={model} alt={`3D model of ${project.title}`} />
        ))}

        <Mdx code={project.body} scope={{ materials: project.materials }} />

        {project.materials.length > 0 && !usesInlineBom ? (
          <section aria-labelledby="materials" className="prose mt-10">
            <h2 id="materials">Materials</h2>
            <BillOfMaterials materials={project.materials} />
          </section>
        ) : null}
      </div>

      {project.gallery.length > 0 ? (
        <section aria-labelledby="gallery" className="mt-12">
          <h2 id="gallery" className="mb-4 text-2xl font-semibold tracking-tight">
            Gallery
          </h2>
          <PhotoGrid
            images={project.gallery.map((image) => ({
              id: image.src.src,
              src: image.src.src,
              width: image.src.width,
              height: image.src.height,
              alt: image.alt,
              placeholder: `center / cover url("${image.src.blurDataURL}")`,
            }))}
          />
        </section>
      ) : null}
    </article>
  );
}
