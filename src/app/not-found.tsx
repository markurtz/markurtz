import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/** The 404 page. */
export default function NotFound() {
  return (
    <main
      id="main"
      className="container-content flex flex-1 flex-col items-start justify-center gap-4 py-24"
    >
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className={buttonVariants()}>
        Go home
      </Link>
    </main>
  );
}
