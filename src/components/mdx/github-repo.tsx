import { GitFork, Star } from "lucide-react";

import { getRepoStats } from "@/lib/github";

/**
 * A repository card. Star count and language come from the GitHub API at build
 * time and are simply left out when the request fails.
 */
export async function GitHubRepo({ repo, description }: { repo: string; description?: string }) {
  const stats = await getRepoStats(repo);
  const text = description ?? stats?.description;

  return (
    <a
      href={`https://github.com/${repo}`}
      className="not-prose bg-card hover:border-accent my-6 block rounded-lg border p-4 transition-colors"
    >
      <span className="flex items-center gap-2 font-mono text-sm font-semibold">
        <GitFork className="size-4" aria-hidden />
        {repo}
      </span>
      {text ? <span className="text-muted-foreground mt-1 block text-sm">{text}</span> : null}
      {stats ? (
        <span className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
          {stats.language ? <span>{stats.language}</span> : null}
          <span className="flex items-center gap-1">
            <Star className="size-3.5" aria-hidden />
            {stats.stars.toLocaleString("en-US")} <span className="sr-only">stars</span>
          </span>
        </span>
      ) : null}
    </a>
  );
}
