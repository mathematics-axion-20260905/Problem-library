"use client";

import Link from "next/link";

import { useLocale } from "@/components/locale-provider";

export function ProblemDetailHeader() {
  const { locale } = useLocale();
  const copy = locale === "uz"
    ? { kicker: "Ilmiy masala fayli", trail: "Model · cheklovlar · hisoblash · dalil · kelib chiqish", back: "Masalalar kutubxonasi →" }
    : { kicker: "Scientific case file", trail: "Model · constraints · calculation · evidence · provenance", back: "Problem library →" };
  return (
    <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--ax-work-line)] pb-4">
      <div>
        <div className="ax-work-kicker">{copy.kicker}</div>
        <div className="mt-1 text-[10px] text-[var(--ax-text-faint)]">{copy.trail}</div>
      </div>
      <Link href="/problems" className="text-[10px] font-semibold text-[var(--ax-accent)] hover:text-[var(--ax-accent-strong)]">{copy.back}</Link>
    </div>
  );
}
