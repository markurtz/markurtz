/**
 * Plain Markdown stand-ins for the MDX components in `src/components/mdx`,
 * used when a post is cross-posted to a service that only understands
 * Markdown. Add an entry here whenever a component is added there.
 */

/** A component's attributes (string values only) and its already-converted children. */
export interface FallbackInput {
  attributes: Record<string, string>;
  children: string;
  /** Child `<img>` elements, for components that wrap images. */
  images: { src: string; alt: string }[];
}

export type Fallback = (input: FallbackInput) => string;

const CALLOUT_LABELS: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
  danger: "Caution",
};

const quote = (text: string) =>
  text
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n");

const image = ({ src, alt }: { src: string; alt: string }) => `![${alt}](${src})`;

export const fallbacks: Record<string, Fallback> = {
  Callout: ({ attributes, children }) =>
    quote(
      `**${attributes.title ?? CALLOUT_LABELS[attributes.type ?? "note"] ?? "Note"}**\n\n${children.trim()}`,
    ),
  Figure: ({ attributes }) =>
    [
      image({ src: attributes.src ?? "", alt: attributes.alt ?? "" }),
      attributes.caption ? `_${attributes.caption}_` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  Gallery: ({ images }) => images.map(image).join("\n\n"),
  BeforeAfter: ({ images }) => images.map(image).join("\n\n"),
  // Steps sit inline in one paragraph, which leaves stray whitespace between them.
  Steps: ({ children }) =>
    children
      .replace(/^[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  Step: ({ attributes, children }) => `**${attributes.title ?? "Step"}**\n\n${children.trim()}`,
  GitHubRepo: ({ attributes }) => `[${attributes.repo}](https://github.com/${attributes.repo})`,
  YouTube: ({ attributes }) =>
    `[${attributes.title ?? "Watch the video"}](https://www.youtube.com/watch?v=${attributes.id})`,
  Video: ({ attributes }) => `[${attributes.title ?? "Watch the video"}](${attributes.src})`,
  // Interactive or site-specific: point readers at the original instead.
  ModelViewer: ({ attributes }) =>
    `_Interactive 3D model (${attributes.alt ?? "model"}): see the original post._`,
  BillOfMaterials: () => "_The bill of materials is in the original post._",
  CategoryGrid: () => "",
};
