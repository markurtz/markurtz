/** Public facts about a GitHub repository shown on project pages. */
export interface RepoStats {
  stars: number;
  language: string | null;
  description: string | null;
}

const REVALIDATE_SECONDS = 60 * 60 * 24;
const TIMEOUT_MS = 5000;

/** Extracts `owner/name` from a GitHub URL, or returns undefined for other hosts. */
export function repoFromUrl(url: string | undefined): string | undefined {
  const match = url?.match(/^https?:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/);
  return match?.[1];
}

/**
 * Fetches star count and primary language. Returns null on any failure so a
 * rate limit or an offline build never breaks a page.
 */
export async function getRepoStats(repo: string): Promise<RepoStats | null> {
  if (process.env.SKIP_GITHUB_STATS === "1") return null;
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      stargazers_count?: number;
      language?: string | null;
      description?: string | null;
    };
    return {
      stars: data.stargazers_count ?? 0,
      language: data.language ?? null,
      description: data.description ?? null,
    };
  } catch {
    return null;
  }
}
