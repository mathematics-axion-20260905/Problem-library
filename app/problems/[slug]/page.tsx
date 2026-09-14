import type { Metadata } from "next";
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
import { ProblemDetailHeader } from "@/components/problems/problem-detail-header";

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
          <ProblemDetailHeader />

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
