"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AxionMark } from "@/components/axion";
import { useLocale } from "@/components/locale-provider";

export function Navbar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const copy = locale === "uz"
    ? { home: "Axion Science bosh sahifasi", product: "Mahsulot", workflow: "Jarayon", ecosystem: "Ekotizim", project: "Loyiha ish maydoni", library: "Ilmiy kutubxona", workspace: "Ilmiy ish maydoni", homeLink: "Bosh sahifa", problemLibrary: "Masalalar kutubxonasi", projects: "Loyihalar", explore: "Ko‘rib chiqish", openProjects: "Loyihalarni ochish" }
    : { home: "Axion Science home", product: "Product", workflow: "Workflow", ecosystem: "Ecosystem", project: "Project workspace", library: "Scientific library", workspace: "Scientific workspace", homeLink: "Home", problemLibrary: "Problem library", projects: "Projects", explore: "Explore", openProjects: "Open Projects" };
  const innerPage = pathname !== "/";
  const inProjects = pathname.startsWith("/projects");
  const inProblems = pathname.startsWith("/problems");

  return (
    <header className="ax-premium-nav">
      <div className="ax-landing-container ax-premium-nav-inner" style={{ minHeight: innerPage ? 64 : 72 }}>
        <Link href="/" className="flex min-w-0 items-center gap-3.5 outline-none focus-visible:shadow-[var(--ax-focus-ring)]" aria-label={copy.home}>
          <AxionMark className="h-9 w-9 text-[var(--ax-accent)]" />
          <span className="min-w-0 leading-none"><span className="block truncate font-[family-name:var(--ax-font-display)] text-[22px] font-medium tracking-[-0.035em] text-[var(--ax-text)]">Axion Science</span><span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.25em] text-[var(--ax-text-faint)]">Scientific workspace</span></span>
        </Link>

        {!innerPage ? (
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Science Hub product">
            <Link href="/#product" className="ax-premium-nav-link">{copy.product}</Link>
            <Link href="/#workflow" className="ax-premium-nav-link">{copy.workflow}</Link>
            <Link href="/#ecosystem" className="ax-premium-nav-link">{copy.ecosystem}</Link>
          </nav>
        ) : (
          <div className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-text-faint)] xl:block">
            {inProjects ? copy.project : inProblems ? copy.library : copy.workspace}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {innerPage ? (
            <>
              <Link href="/" className="ax-premium-secondary hidden sm:inline-flex">{copy.homeLink}</Link>
              <Link href={inProjects ? "/problems" : "/projects"} className="ax-premium-primary">
                {inProjects ? copy.problemLibrary : copy.projects} <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/problems" className="ax-premium-secondary hidden sm:inline-flex">{copy.explore}</Link>
              <Link href="/projects" className="ax-premium-primary">{copy.openProjects} <span aria-hidden="true">→</span></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
