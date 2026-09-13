"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function ScienceMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 text-[var(--ax-accent)]" aria-hidden="true">
      <circle cx="20" cy="20" r="17.2" fill="none" stroke="currentColor" strokeWidth="1.05" />
      <ellipse cx="20" cy="20" rx="7.6" ry="17.2" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.68" />
      <ellipse cx="20" cy="20" rx="17.2" ry="7.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.68" />
      <path d="M2.8 20h34.4M20 2.8v34.4" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
      <circle cx="31.7" cy="11.9" r="1.45" fill="currentColor" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const innerPage = pathname !== "/";
  const inProjects = pathname.startsWith("/projects");
  const inProblems = pathname.startsWith("/problems");

  return (
    <header className="ax-premium-nav">
      <div className="ax-landing-container ax-premium-nav-inner" style={{ minHeight: innerPage ? 64 : 72 }}>
        <Link href="/" className="flex min-w-0 items-center gap-3.5 outline-none focus-visible:shadow-[var(--ax-focus-ring)]" aria-label="Axion Science home">
          <ScienceMark />
          <span className="min-w-0 leading-none"><span className="block truncate font-[family-name:var(--ax-font-display)] text-[22px] font-medium tracking-[-0.035em] text-[var(--ax-text)]">Axion Science</span><span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.25em] text-[var(--ax-text-faint)]">Scientific workspace</span></span>
        </Link>

        {!innerPage ? (
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Science Hub product">
            <Link href="/#product" className="ax-premium-nav-link">Product</Link>
            <Link href="/#workflow" className="ax-premium-nav-link">Workflow</Link>
            <Link href="/#ecosystem" className="ax-premium-nav-link">Ecosystem</Link>
          </nav>
        ) : (
          <div className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ax-text-faint)] xl:block">
            {inProjects ? "Project workspace" : inProblems ? "Scientific library" : "Scientific workspace"}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {innerPage ? (
            <>
              <Link href="/" className="ax-premium-secondary hidden sm:inline-flex">Home</Link>
              <Link href={inProjects ? "/problems" : "/projects"} className="ax-premium-primary">
                {inProjects ? "Problem library" : "Projects"} <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/problems" className="ax-premium-secondary hidden sm:inline-flex">Explore</Link>
              <Link href="/projects" className="ax-premium-primary">Open Projects <span aria-hidden="true">→</span></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
