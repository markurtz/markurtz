import { siteConfig } from "@/lib/site";

/**
 * Placeholder home page. It exists so the toolchain and CI have something real
 * to build and test; the actual site replaces it.
 */
export default function HomePage() {
  return (
    <main>
      <h1>{siteConfig.name}</h1>
      <p>This site is under construction.</p>
      <p>
        <a href={siteConfig.links.github}>GitHub</a>
      </p>
    </main>
  );
}
