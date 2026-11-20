import { siteConfig, type SocialKey } from "@/lib/site";

/** A social profile resolved to a label and URL. */
export interface SocialLink {
  key: SocialKey;
  label: string;
  url: string;
}

const builders: Record<SocialKey, { label: string; url: (value: string) => string }> = {
  github: { label: "GitHub", url: (v) => `https://github.com/${v}` },
  linkedin: { label: "LinkedIn", url: (v) => `https://www.linkedin.com/in/${v}` },
  scholar: {
    label: "Google Scholar",
    url: (v) => `https://scholar.google.com/citations?user=${v}`,
  },
  orcid: { label: "ORCID", url: (v) => `https://orcid.org/${v}` },
  bluesky: { label: "Bluesky", url: (v) => `https://bsky.app/profile/${v}` },
  // Mastodon handles look like `user@instance.example`.
  mastodon: {
    label: "Mastodon",
    url: (v) => {
      const [user, host] = v.replace(/^@/, "").split("@");
      return host ? `https://${host}/@${user}` : v;
    },
  },
  x: { label: "X", url: (v) => `https://x.com/${v}` },
  email: { label: "Email", url: (v) => `mailto:${v}` },
};

/** The configured social profiles, in a stable order, skipping empty ones. */
export function getSocialLinks(social = siteConfig.social): SocialLink[] {
  return (Object.keys(builders) as SocialKey[])
    .filter((key) => Boolean(social[key]))
    .map((key) => ({
      key,
      label: builders[key].label,
      url: builders[key].url(social[key] as string),
    }));
}
