"use client";

import { useState } from "react";
import type {
  CalculationEntry,
  CodeSample,
  FormulaEntry,
  GraphSeries,
  ProblemModule,
} from "@/app/problems/problem-data";
import { Badge } from "@/components/ui/primitives";
import { SectionFrame, SectionHeading } from "@/components/ui/section";
import { ui } from "@/components/ui/styles";
import { useLocale } from "@/components/locale-provider";

const detailCopy = {
  en: {
    file: "Problem file", overview: "Overview", origin: "Origin", impact: "Impact", quick: "Quick summary", difficulty: "Difficulty", readTime: "Read time", outcome: "Outcome", why: "Why it matters", context: "Context", contextTitle: "Learning objective and operating context", contextDescription: "This section fixes the target outcome and the practical scenario before moving into formulas and calculations.", learning: "Learning objective", provenance: "Provenance", sourceModel: "Source model", provenanceDescription: "Each content type is tied back to what it is supposed to prove or explain.", formulaSource: "Formula source", codePurpose: "Code purpose", graphMeaning: "Graph meaning", constraints: "Constraints", engineering: "Engineering constraints", constraintsDescription: "Non-negotiable limits that shape the design and validation path.", formulaSet: "Formula set", formulaDefinitions: "Formula definitions", formulaDescription: "Definitions are shown as compact technical records rather than decorative cards.", interpretation: "Interpretation", useCase: "Use case", calculationPath: "Calculation path", calculations: "Worked calculations", calculationDescription: "Each worked block isolates inputs, formula, and output so review is faster.", calculation: "Calculation", output: "Output", dataView: "Data view", automation: "Automation", referenceCode: "Reference code", codeDescription: "Code is presented as a working technical artifact rather than a showcase block.", summary: "Summary", conclusions: "Conclusions and next steps", notesDescription: "Final notes are listed as operational takeaways."
  },
  uz: {
    file: "Masala fayli", overview: "Umumiy ko‘rinish", origin: "Kelib chiqishi", impact: "Ta’siri", quick: "Qisqa xulosa", difficulty: "Murakkablik", readTime: "O‘qish vaqti", outcome: "Kutilgan natija", why: "Ahamiyati", context: "Kontekst", contextTitle: "Maqsad va amaliy kontekst", contextDescription: "Bu bo‘lim formula va hisoblashlarga o‘tishdan oldin kutilgan natija hamda amaliy vaziyatni belgilaydi.", learning: "O‘quv maqsadi", provenance: "Kelib chiqish ma’lumoti", sourceModel: "Manba modeli", provenanceDescription: "Har bir kontent turi nimani isbotlashi yoki tushuntirishi kerakligi bilan bog‘langan.", formulaSource: "Formula manbasi", codePurpose: "Kod maqsadi", graphMeaning: "Grafik ma’nosi", constraints: "Cheklovlar", engineering: "Muhandislik cheklovlari", constraintsDescription: "Loyiha va tekshiruv yo‘lini belgilaydigan majburiy chegaralar.", formulaSet: "Formulalar to‘plami", formulaDefinitions: "Formula ta’riflari", formulaDescription: "Ta’riflar bezakli kartalar emas, ixcham texnik qaydlar sifatida ko‘rsatiladi.", interpretation: "Talqin", useCase: "Foydalanish holati", calculationPath: "Hisoblash yo‘li", calculations: "Bosqichma-bosqich hisoblash", calculationDescription: "Har bir blok kiritma, formula va chiqishni alohida ko‘rsatadi, shu sababli tekshiruv tezlashadi.", calculation: "Hisoblash", output: "Chiqish", dataView: "Ma’lumotlar ko‘rinishi", automation: "Avtomatlashtirish", referenceCode: "Namunaviy kod", codeDescription: "Kod namoyish bloki emas, ishlaydigan texnik obyekt sifatida taqdim etiladi.", summary: "Xulosa", conclusions: "Xulosalar va keyingi qadamlar", notesDescription: "Yakuniy qaydlar amaliy xulosalar sifatida beriladi."
  }
} as const;

export function ProblemNarrative({ problem }: { problem: ProblemModule }) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  return (
    <section className="border border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-line)] px-4 py-3 sm:px-5">
        <p className={ui.overline}>{copy.file}</p>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{problem.meta.domain}</Badge>
            <Badge>{problem.meta.audience}</Badge>
            <Badge>{problem.meta.difficulty}</Badge>
          </div>

          <div>
            <h1 className="text-3xl leading-tight tracking-[-0.04em] text-[var(--color-text-strong)] sm:text-4xl">
              {problem.meta.title}
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
              {problem.meta.subtitle}
            </p>
          </div>

          <div className="grid gap-3 border-t border-[var(--color-line-soft)] pt-4 lg:grid-cols-3">
            <InfoBlock label={copy.overview} text={problem.story.overview} />
            <InfoBlock label={copy.origin} text={problem.story.origin} />
            <InfoBlock label={copy.impact} text={problem.story.impact} />
          </div>
        </div>

        <aside className="border border-[var(--color-line-soft)] bg-[var(--color-surface-soft)]">
          <div className="border-b border-[var(--color-line-soft)] px-4 py-3">
            <p className={ui.caption}>{copy.quick}</p>
          </div>
          <div className="grid gap-0">
            <MetricRow label={copy.difficulty} value={problem.meta.difficulty} />
            <MetricRow label={copy.readTime} value={problem.meta.estimatedTime} />
            <MetricRow label={copy.outcome} value={problem.meta.outcome} />
            <MetricRow label={copy.why} value={problem.story.whyItMatters} multiline />
          </div>
        </aside>
      </div>
    </section>
  );
}

export function ProblemStory({ problem }: { problem: ProblemModule }) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading
        eyebrow={copy.context}
        title={copy.contextTitle}
        description={copy.contextDescription}
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <InfoBlock label={copy.learning} text={problem.meta.outcome} />
        <InfoBlock label={copy.context} text={problem.story.origin} />
      </div>
    </SectionFrame>
  );
}

export function ProvenanceSection({ problem }: { problem: ProblemModule }) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading
        eyebrow={copy.provenance}
        title={copy.sourceModel}
        description={copy.provenanceDescription}
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <InfoBlock label={copy.formulaSource} text={problem.provenance.formulaSource} />
        <InfoBlock label={copy.codePurpose} text={problem.provenance.codePurpose} />
        <InfoBlock label={copy.graphMeaning} text={problem.provenance.graphMeaning} />
      </div>
    </SectionFrame>
  );
}

export function ConstraintList({ constraints }: { constraints: string[] }) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading
        eyebrow={copy.constraints}
        title={copy.engineering}
        description={copy.constraintsDescription}
      />
      <div className="mt-4 overflow-hidden border border-[var(--color-line-soft)]">
        {constraints.map((constraint, index) => (
          <div
            key={constraint}
            className={`grid gap-3 px-4 py-3 text-sm leading-6 text-[var(--color-muted)] sm:grid-cols-[120px_minmax(0,1fr)] ${
              index !== constraints.length - 1 ? "border-b border-[var(--color-line-soft)]" : ""
            }`}
          >
            <div className="font-semibold text-[var(--color-text-strong)]">C{index + 1}</div>
            <div>{constraint}</div>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

export function FormulaSection({ formulas }: { formulas: FormulaEntry[] }) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading
        eyebrow={copy.formulaSet}
        title={copy.formulaDefinitions}
        description={copy.formulaDescription}
      />
      <div className="mt-4 grid gap-3">
        {formulas.map((item) => (
          <article key={item.label} className="border border-[var(--color-line-soft)] bg-[var(--color-surface)]">
            <div className="grid gap-4 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
              <div>
                <p className={ui.caption}>{item.label}</p>
                <p className="mt-2 font-mono text-lg text-[var(--color-text-strong)]">{item.expression}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.units}</p>
              </div>
              <div>
                <p className="text-sm leading-6 text-[var(--color-muted)]">{item.meaning}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TextPair label={copy.origin} text={item.origin} />
                  <TextPair label={copy.interpretation} text={item.interpretation} />
                </div>
              </div>
              <TextPair label={copy.useCase} text={item.useCase} />
            </div>
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

export function CalculationSection({
  calculations,
}: {
  calculations: CalculationEntry[];
}) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading
        eyebrow={copy.calculationPath}
        title={copy.calculations}
        description={copy.calculationDescription}
      />
      <div className="mt-4 grid gap-3">
        {calculations.map((item) => (
          <article key={item.title} className="border border-[var(--color-line-soft)] bg-[var(--color-surface)]">
            <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-4">
                <div>
                  <p className={ui.caption}>{copy.calculation}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-strong)]">
                    {item.title}
                  </h3>
                </div>

                <dl className="grid gap-0 overflow-hidden border border-[var(--color-line-soft)]">
                  {Object.entries(item.inputs).map(([label, value], index, entries) => (
                    <div
                      key={label}
                      className={`grid gap-2 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] ${
                        index !== entries.length - 1 ? "border-b border-[var(--color-line-soft)]" : ""
                      }`}
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                        {label}
                      </dt>
                      <dd className="text-sm font-medium text-[var(--color-text-strong)]">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="border border-[var(--color-line-soft)] bg-[var(--color-surface-soft)] px-4 py-3">
                  <p className={ui.caption}>Formula</p>
                  <p className="mt-2 font-mono text-sm leading-6 text-[var(--color-text-strong)]">
                    {item.formula}
                  </p>
                </div>
              </div>

              <div className="border border-[var(--color-line-soft)] bg-[#0f172a] px-4 py-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {copy.output}
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{item.result}</p>
                <p className="mt-3 text-sm leading-6 text-white/72">{item.note}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

export function GraphSection({
  title,
  description,
  xLabel,
  yLabel,
  series,
}: {
  title: string;
  description: string;
  xLabel: string;
  yLabel: string;
  series: GraphSeries[];
}) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  const minX = Math.min(...series.flatMap((item) => item.points.map((point) => point.x)));
  const maxX = Math.max(...series.flatMap((item) => item.points.map((point) => point.x)));
  const minY = Math.min(...series.flatMap((item) => item.points.map((point) => point.y)));
  const maxY = Math.max(...series.flatMap((item) => item.points.map((point) => point.y)));
  const width = 720;
  const height = 320;
  const pad = 44;

  const scaleX = (value: number) =>
    pad + ((value - minX) / Math.max(1, maxX - minX)) * (width - pad * 2);
  const scaleY = (value: number) =>
    height - pad - ((value - minY) / Math.max(1, maxY - minY)) * (height - pad * 2);

  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading eyebrow={copy.dataView} title={title} description={description} />
      <div className="mt-4 border border-[var(--color-line-soft)] bg-white p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#94a3b8" />
          <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#94a3b8" />
          {series.map((item) => {
            const path = item.points
              .map((point, index) => `${index === 0 ? "M" : "L"} ${scaleX(point.x)} ${scaleY(point.y)}`)
              .join(" ");

            return (
              <g key={item.name}>
                <path d={path} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinejoin="round" />
                {item.points.map((point) => (
                  <circle
                    key={`${item.name}-${point.x}`}
                    cx={scaleX(point.x)}
                    cy={scaleY(point.y)}
                    r="3.5"
                    fill={item.color}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="text-sm text-[var(--color-muted)]">
          {xLabel} | {yLabel}
        </div>
        <div className="flex flex-wrap gap-2">
          {series.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 rounded-md border border-[var(--color-line-soft)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--color-muted)]"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

export function CodeSection({ samples }: { samples: CodeSample[] }) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSample = samples[activeIndex] ?? samples[0];

  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading
        eyebrow={copy.automation}
        title={copy.referenceCode}
        description={copy.codeDescription}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {samples.map((sample, index) => (
          <button
            key={sample.filename}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={index === activeIndex ? ui.buttonPrimary : ui.buttonSecondary}
          >
            {sample.filename}
          </button>
        ))}
      </div>

      <article className={`${ui.codePanel} mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-xs text-white/62">
          <span>{activeSample.filename}</span>
          <span>{activeSample.language}</span>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="mb-3 text-sm leading-6 text-white/64">{activeSample.summary}</p>
            <pre className="overflow-x-auto text-sm leading-6 text-stone-100">
              <code>{activeSample.code}</code>
            </pre>
          </div>

          <div className="border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
              {copy.output}
            </p>
            <pre className="mt-3 whitespace-pre-wrap font-mono text-sm leading-6 text-emerald-200">
              {activeSample.output}
            </pre>
          </div>
        </div>
      </article>
    </SectionFrame>
  );
}

export function NotesSection({ notes }: { notes: string[] }) {
  const { locale } = useLocale();
  const copy = detailCopy[locale];
  return (
    <SectionFrame className="p-4 sm:p-5">
      <SectionHeading
        eyebrow={copy.summary}
        title={copy.conclusions}
        description={copy.notesDescription}
      />
      <div className="mt-4 overflow-hidden border border-[var(--color-line-soft)]">
        {notes.map((note, index) => (
          <div
            key={note}
            className={`px-4 py-3 text-sm leading-6 text-[var(--color-muted)] ${
              index !== notes.length - 1 ? "border-b border-[var(--color-line-soft)]" : ""
            }`}
          >
            {note}
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

function MetricRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="border-b border-[var(--color-line-soft)] px-4 py-3 last:border-b-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className={`mt-1 text-sm text-[var(--color-text-strong)] ${multiline ? "leading-6" : "font-medium"}`}>
        {value}
      </p>
    </div>
  );
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="border border-[var(--color-line-soft)] bg-[var(--color-surface-soft)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{text}</p>
    </div>
  );
}

function TextPair({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{text}</p>
    </div>
  );
}
