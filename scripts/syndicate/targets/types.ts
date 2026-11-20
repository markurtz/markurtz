/** What every syndication target receives for one post. */
export interface SyndicationPost {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  canonicalUrl: string;
  coverUrl?: string;
  markdown: string;
}

/** The copy a target created. */
export interface SyndicationResult {
  id: string;
  url: string;
}

export interface TargetOptions {
  /** Publish immediately instead of creating a draft. */
  publish: boolean;
  /** Injected in tests. */
  fetch?: typeof fetch;
}

/** One cross-posting destination. Add a file per service and register it in index.ts. */
export interface SyndicationTarget {
  id: string;
  label: string;
  /** Names of the environment variables that must be set to post. */
  requiredEnv: string[];
  /** The exact request that would be sent, for `--dry-run`. Must not include secrets. */
  buildPayload(post: SyndicationPost, options: TargetOptions): unknown;
  publish(post: SyndicationPost, options: TargetOptions): Promise<SyndicationResult>;
}
