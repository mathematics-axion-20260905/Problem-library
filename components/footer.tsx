"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";

export function Footer() {
  const { locale } = useLocale();
  const copy = locale === "uz"
    ? { description: "Hisoblash, fikrlash, vizualizatsiya va nashr uchun yagona Loyiha konteksti.", product: "Mahsulot", workflow: "Jarayon", ecosystem: "Ekotizim", action: "Loyihalarni ochish" }
    : { description: "One Project context across computation, reasoning, visualization and publication.", product: "Product", workflow: "Workflow", ecosystem: "Ecosystem", action: "Open Projects" };
  return (
    <footer className="border-t border-[var(--ax-line)] bg-white">
      <div className="ax-landing-container grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="font-[family-name:var(--ax-font-display)] text-[24px] tracking-[-0.035em] text-[var(--ax-text)]">Axion Science</div>
          <p className="mt-2 max-w-md text-[11px] leading-5 text-[var(--ax-text-faint)]">{copy.description}</p>
          <div className="mt-6 text-[10px] text-[var(--ax-text-faint)]">&copy; {new Date().getFullYear()} Axion Science</div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-semibold text-[var(--ax-text-soft)]" aria-label="Footer">
          <Link href="/#product" className="hover:text-[var(--ax-text)]">{copy.product}</Link>
          <Link href="/#workflow" className="hover:text-[var(--ax-text)]">{copy.workflow}</Link>
          <Link href="/#ecosystem" className="hover:text-[var(--ax-text)]">{copy.ecosystem}</Link>
          <Link href="/projects" className="text-[var(--ax-accent)] hover:text-[var(--ax-accent-strong)]">{copy.action} →</Link>
        </nav>
      </div>
    </footer>
  );
}
