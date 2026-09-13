import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalculationSection,
  CodeSection,
  ConstraintList,
  FormulaSection,
  GraphSection,
  NotesSection,
  ProblemNarrative,
  ProblemStory,
  ProvenanceSection,
} from "@/components/problems/problem-sections";
import { ledDesignProblem } from "../problem-data";

export function generateStaticParams() {
  return [{ slug: ledDesignProblem.meta.slug }];
}

export function generateMetadata(): Metadata {
  return {
    title: `${ledDesignProblem.meta.title} engineering case study`,
    description: ledDesignProblem.meta.subtitle,
    alternates: { canonical: `/problems/${ledDesignProblem.meta.slug}` },
    openGraph: {
      type: "article",
      title: `${ledDesignProblem.meta.title} engineering case study`,
      description: ledDesignProblem.meta.subtitle,
      url: `/problems/${ledDesignProblem.meta.slug}`,
    },
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug !== ledDesignProblem.meta.slug) notFound();

  return (
    <div className="ax-workspace-root ax-problem-detail">
      <main className="ax-work-container py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[1260px]">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--ax-work-line)] pb-4">
            <div>
              <div className="ax-work-kicker">Scientific case file</div>
              <div className="mt-1 text-[10px] text-[var(--ax-text-faint)]">Model · constraints · calculation · evidence · provenance</div>
            </div>
            <Link href="/problems" className="text-[10px] font-semibold text-[var(--ax-accent)] hover:text-[var(--ax-accent-strong)]">Problem library →</Link>
          </div>

          <div className="ax-problem-sections grid gap-5 lg:gap-6">
            <ProblemNarrative problem={ledDesignProblem} />
            <ProblemStory problem={ledDesignProblem} />
            <ConstraintList constraints={ledDesignProblem.constraints} />
            <ProvenanceSection problem={ledDesignProblem} />
            <FormulaSection formulas={ledDesignProblem.formulas} />
            <CalculationSection calculations={ledDesignProblem.calculations} />
            <GraphSection {...ledDesignProblem.graphs} />
            <CodeSection samples={ledDesignProblem.codeSamples} />
            <NotesSection notes={ledDesignProblem.notes} />
          </div>
        </div>
      </main>
    </div>
  );
}
