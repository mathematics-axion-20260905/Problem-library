import Link from "next/link";
import { useLocale } from "@/components/locale-provider";

type ProblemDetailCardProps = {
  index: number;
  problem: {
    id: string | number;
    group?: string;
    title: string;
    topic: string;
    difficulty: string;
    duration: string;
    summary: string;
    tags: string[];
  };
};

export function ProblemDetailCard({ index, problem }: ProblemDetailCardProps) {
  const { locale } = useLocale();
  const labels = locale === "uz"
    ? { topic: "Mavzu", difficulty: "Murakkablik", duration: "Davomiylik" }
    : { topic: "Topic", difficulty: "Difficulty", duration: "Duration" };
  const content = (
    <article className="ax-work-row grid gap-4 px-1 py-6 sm:px-5 lg:grid-cols-[54px_170px_130px_minmax(0,1fr)_110px] lg:items-start lg:px-6">
      <div className="font-[family-name:var(--ax-font-display)] text-[20px] text-[var(--ax-text-faint)]">{String(index + 1).padStart(2, "0")}</div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-text-faint)]">{labels.topic}</p>
        <p className="mt-1.5 text-[12px] font-semibold text-[var(--ax-text)]">{problem.topic}</p>
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-text-faint)]">{labels.difficulty}</p>
        <p className="mt-1.5 text-[12px] font-semibold text-[var(--ax-text)]">{problem.difficulty}</p>
      </div>

      <div className="min-w-0">
        <h2 className="font-[family-name:var(--ax-font-display)] text-[25px] tracking-[-0.035em] text-[var(--ax-text)]">{problem.title}</h2>
        <p className="mt-2 max-w-3xl text-[12px] leading-6 text-[var(--ax-text-soft)]">{problem.summary}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {problem.tags.map((tag) => (
            <span key={tag} className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--ax-text-faint)]">{tag}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ax-text-faint)]">{labels.duration}</p>
        <p className="mt-1.5 text-[12px] font-semibold text-[var(--ax-text)]">{problem.duration}</p>
      </div>
    </article>
  );

  if (!problem.group) return content;
  return <Link href={`/problems/${problem.group}`} className="block outline-none focus-visible:shadow-[var(--ax-focus-ring)]">{content}</Link>;
}
