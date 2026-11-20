/**
 * Turns a post's MDX source into portable Markdown for cross-posting:
 * imports and expressions are removed, each custom component is replaced by
 * its Markdown fallback, relative links and images become absolute URLs, and
 * an "Originally published at" line is appended.
 */
import type { Root, RootContent } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import { fallbacks } from "./fallbacks";

export interface TransformOptions {
  /** The live site's origin, without a trailing slash. */
  siteUrl: string;
  /** Canonical URL of the post on the site. */
  canonicalUrl: string;
  /** Resolves a relative asset path (`./cover.jpg`) to its published site path. */
  resolveAsset?: (relativePath: string) => string | undefined;
}

interface JsxNode {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes: { type: string; name?: string; value?: unknown }[];
  children: RootContent[];
}

type AnyNode = RootContent | Root | JsxNode;

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkMdx);
const stringifier = unified()
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkStringify, { bullet: "-", emphasis: "_", fences: true, rule: "-" });

const isJsx = (node: { type: string }): node is JsxNode =>
  node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement";

/** Makes a URL absolute: site paths get the origin, relative assets go through the resolver. */
export function absolutize(url: string, options: TransformOptions): string {
  if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url)) return url;
  if (url.startsWith("/")) return `${options.siteUrl}${url}`;
  const resolved = options.resolveAsset?.(url);
  return resolved ? `${options.siteUrl}${resolved}` : url;
}

function stringAttributes(node: JsxNode): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const attribute of node.attributes) {
    if (
      attribute.type === "mdxJsxAttribute" &&
      attribute.name &&
      typeof attribute.value === "string"
    ) {
      attributes[attribute.name] = attribute.value;
    }
  }
  return attributes;
}

function toMarkdown(children: RootContent[]): string {
  return stringifier.stringify({ type: "root", children } as Root).trim();
}

function convert(nodes: RootContent[], options: TransformOptions): RootContent[] {
  const output: RootContent[] = [];
  for (const node of nodes as AnyNode[]) {
    // Imports, exports and `{expressions}` mean nothing outside MDX.
    if (
      node.type === "mdxjsEsm" ||
      node.type === "mdxFlowExpression" ||
      node.type === "mdxTextExpression"
    )
      continue;

    if (isJsx(node)) {
      const attributes = stringAttributes(node);
      for (const key of ["src", "href", "poster"]) {
        if (attributes[key]) attributes[key] = absolutize(attributes[key], options);
      }
      const images = node.children
        .filter((child): child is RootContent & JsxNode => isJsx(child) && child.name === "img")
        .map((child) => stringAttributes(child))
        .map((image) => ({ src: absolutize(image.src ?? "", options), alt: image.alt ?? "" }));
      const children = toMarkdown(convert(node.children, options));
      if (node.name === "img") {
        output.push({ type: "html", value: `![${attributes.alt ?? ""}](${attributes.src ?? ""})` });
        continue;
      }
      const fallback = node.name ? fallbacks[node.name] : undefined;
      // Unknown elements (plain HTML such as <kbd>) keep their text content.
      const markdown = fallback ? fallback({ attributes, children, images }) : children;
      // An `html` node is written out verbatim, which is how raw Markdown is injected.
      // Inside a paragraph, a block fallback needs blank lines to stand on its own.
      const inline = node.type === "mdxJsxTextElement" && Boolean(fallback);
      if (markdown) output.push({ type: "html", value: inline ? `\n\n${markdown}\n\n` : markdown });
      continue;
    }

    if (node.type === "image" || node.type === "link" || node.type === "definition") {
      node.url = absolutize(node.url, options);
    }
    // A line break between two block fallbacks would otherwise be escaped as an entity.
    if (node.type === "text" && !node.value.trim() && output.at(-1)?.type === "html") continue;
    if ("children" in node && Array.isArray(node.children)) {
      (node as { children: RootContent[] }).children = convert(
        node.children as RootContent[],
        options,
      );
    }
    output.push(node as RootContent);
  }
  return output;
}

/** Converts MDX source to portable Markdown with a canonical attribution line. */
export function toPortableMarkdown(source: string, options: TransformOptions): string {
  const tree = parser.parse(source) as Root;
  const body = toMarkdown(convert(tree.children, options));
  return `${body}\n\n---\n\n_Originally published at [${new URL(options.canonicalUrl).host}](${options.canonicalUrl})._\n`;
}

/** Finds the published path of a content image inside Velite's rendered HTML. */
export function findPublishedAsset(relativePath: string, renderedHtml: string): string | undefined {
  const file = relativePath.split("/").pop() ?? "";
  const dot = file.lastIndexOf(".");
  if (dot <= 0) return undefined;
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `/static/${escape(file.slice(0, dot))}-[0-9a-f]{8}\\.${escape(file.slice(dot + 1))}`,
  );
  return renderedHtml.match(pattern)?.[0];
}
