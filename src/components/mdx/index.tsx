import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { AnchorHTMLAttributes, ComponentType } from "react";
import * as runtime from "react/jsx-runtime";

import { ImageGallery } from "@/components/gallery/image-gallery";
import { BeforeAfter } from "@/components/mdx/before-after";
import { BillOfMaterials, type Material } from "@/components/mdx/bill-of-materials";
import { Callout } from "@/components/mdx/callout";
import { CategoryGrid } from "@/components/mdx/category-grid";
import { Video, YouTube } from "@/components/mdx/embeds";
import { Figure, MdxImage } from "@/components/mdx/figure";
import { GitHubRepo } from "@/components/mdx/github-repo";
import { ModelViewer } from "@/components/mdx/model-viewer";
import { Step, Steps } from "@/components/mdx/steps";
import { cn, isExternal } from "@/lib/utils";

/**
 * The components available in every MDX file without an import. Each one has a
 * Markdown fallback for syndication in `scripts/syndicate/fallbacks.ts`; add
 * one there when adding a component here.
 */

function MdxLink({ href = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  if (isExternal(href)) return <a href={href} rel="noopener" {...props} />;
  return <a href={href} {...props} />;
}

/** Data from the surrounding page that MDX components can use. */
export interface MdxScope {
  materials?: Material[];
}

function buildComponents(scope: MdxScope): MDXComponents {
  return {
    a: MdxLink,
    img: MdxImage,
    Callout,
    Figure,
    Gallery: ImageGallery,
    BeforeAfter,
    ModelViewer,
    // The table reads the project's front matter unless rows are passed directly.
    BillOfMaterials: ({ materials }: { materials?: Material[] }) => (
      <BillOfMaterials materials={materials ?? scope.materials ?? []} />
    ),
    Steps,
    Step,
    GitHubRepo,
    YouTube,
    Video,
    CategoryGrid,
  };
}

const compiled = new Map<string, ComponentType<{ components: MDXComponents }>>();

/** Turns Velite's compiled MDX function body into a component, once per document. */
function getMdxComponent(code: string): ComponentType<{ components: MDXComponents }> {
  let component = compiled.get(code);
  if (!component) {
    // Velite compiles MDX at build time to a function body. Evaluating it here
    // happens only on the server, during static generation or a server render.
    const factory = new Function(code) as (scope: typeof runtime) => {
      default: ComponentType<{ components: MDXComponents }>;
    };
    component = factory({ ...runtime }).default;
    compiled.set(code, component);
  }
  return component;
}

/** Renders compiled MDX with the site's components and prose styling. */
export function Mdx({
  code,
  scope = {},
  className,
}: {
  code: string;
  scope?: MdxScope;
  className?: string;
}) {
  const element = runtime.jsx(getMdxComponent(code), { components: buildComponents(scope) });
  return <div className={cn("prose", className)}>{element}</div>;
}
