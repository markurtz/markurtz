import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/** Previous and next links for a paginated list. Page 1 lives at `basePath`. */
export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;
  const href = (target: number) => (target === 1 ? basePath : `${basePath}/page/${target}`);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={buttonVariants({ variant: "outline" })}>
          Newer
        </Link>
      ) : (
        <span />
      )}
      <p className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={buttonVariants({ variant: "outline" })}>
          Older
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
