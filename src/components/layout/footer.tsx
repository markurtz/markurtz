import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { getSocialLinks } from "@/lib/social";

/** The site footer: social profiles, feeds and secondary pages. */
export function Footer() {
  const social = getSocialLinks();
  const { features } = siteConfig;

  return (
    <footer className="no-print mt-24 border-t">
      <div className="container-content text-muted-foreground flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.author.name}
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {social.map((link) => (
              <li key={link.key}>
                <a href={link.url} rel="me noopener" className="hover:text-foreground">
                  {link.label}
                </a>
              </li>
            ))}
            {features.blog ? (
              <li>
                <a href="/feed.xml" className="hover:text-foreground">
                  RSS
                </a>
              </li>
            ) : null}
            {features.clientGalleries ? (
              <li>
                <Link href="/clients" className="hover:text-foreground">
                  {siteConfig.clientArea.label}
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
