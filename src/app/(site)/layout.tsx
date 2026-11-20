import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

/** Layout for the public, statically generated site. */
export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="container-content flex-1 py-12 outline-none sm:py-16"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
