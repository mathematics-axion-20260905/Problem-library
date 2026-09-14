"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, FileText, FlaskConical, Sigma } from "lucide-react";

import { ScienceHeroScene } from "@/components/home/science-hero-scene";
import { useLocale } from "@/components/locale-provider";

const scienceLandingCopy = {
  en: {
    heroKicker: "Axion Science · one project, many instruments", heroTitle: ["Science,", "kept", "connected."], heroLead: "Move from computation to reasoning to publication without rebuilding context every time the scientific instrument changes.", start: "Start a Project", see: "See how it works",
    productKicker: "The Project", productTitle: "One research context across every scientific instrument.", productCopy: "The Project is the user-facing home. Calculations, reasoning, figures and documents remain separate objects but share one scientific trail.", previewTitle: "Turbulence Study", previewCopy: "A connected trail from model to publication.",
    workflowKicker: "Research lifecycle", workflowTitle: "From a question to a publication without the broken handoffs.", workflowCopy: "Each stage uses a focused instrument. The Project keeps the scientific context connected while the work moves forward.",
    ecosystemKicker: "Focused instruments, one system", ecosystemTitle: "Compute. Reason. Publish. Keep the chain intact.", ecosystemCopy: "The products stay specialized because the shared Project and Scientific Object contracts carry context between them.", ecosystemItems: [["Mathematics", "Solve, visualize and preserve scientific results."], ["Notebook", "Keep reasoning, observations and findings beside the evidence."], ["Writer", "Turn the same evidence into a publication-ready document."]],
    finalTitle: ["Scientific work should stay", "connected."], finalCopy: "Start a Project locally, open the instrument you need, and keep the research trail intact from computation to publication.",
  },
  uz: {
    heroKicker: "Axion Science · bitta loyiha, ko‘p asbob", heroTitle: ["Ilmiy ish,", "bir-biriga", "bog‘langan."], heroLead: "Ilmiy asbob almashganda kontekstni qayta qurmasdan hisoblashdan fikrlashga, undan nashrga o‘ting.", start: "Loyiha boshlash", see: "Qanday ishlashini ko‘rish",
    productKicker: "Loyiha", productTitle: "Har bir ilmiy asbob uchun bitta tadqiqot konteksti.", productCopy: "Loyiha foydalanuvchi ko‘radigan asosiy makon. Hisoblashlar, fikrlash, grafiklar va hujjatlar alohida obyekt bo‘lib qoladi, ammo bitta ilmiy izni bo‘lishadi.", previewTitle: "Turbulentlik tadqiqoti", previewCopy: "Modeldan nashrgacha bog‘langan iz.",
    workflowKicker: "Tadqiqot hayotiy sikli", workflowTitle: "Savoldan nashrgacha — uzilib qoladigan ko‘priklarsiz.", workflowCopy: "Har bir bosqich o‘z asbobidan foydalanadi. Loyiha ish oldinga siljiganda ilmiy kontekstni bog‘lab turadi.",
    ecosystemKicker: "Bir tizimdagi ilmiy asboblar", ecosystemTitle: "Hisobla. Fikrlang. Nashr qiling. Zanjirni saqlang.", ecosystemCopy: "Mahsulotlar ixtisoslashgan bo‘lib qoladi, umumiy Loyiha va Scientific Object shartnomalari esa kontekstni ular orasida olib o‘tadi.", ecosystemItems: [["Matematika", "Ilmiy natijalarni hisoblang, ko‘rsating va saqlang."], ["Notebook", "Fikrlash va kuzatuvlarni dalil yonida saqlang."], ["Writer", "O‘sha dalillarni nashrga tayyor hujjatga aylantiring."]],
    finalTitle: ["Ilmiy ish", "bog‘langan"], finalCopy: "Loyihani mahalliy boshlang, kerakli asbobni oching va hisoblashdan nashrgacha tadqiqot izini saqlang.",
  },
} as const;

type ScienceLandingCopy = (typeof scienceLandingCopy)[keyof typeof scienceLandingCopy];

const defaultPromises = [
  ["Compute", "Use focused scientific instruments without losing the Project that gives the work meaning."],
  ["Reason", "Keep models, observations and findings attached to the evidence that produced them."],
  ["Publish", "Carry the same scientific context into a document instead of rebuilding it at the end."],
];

const defaultWorkflow = [
  ["01", "Question", "Start with the research problem and the context around it."],
  ["02", "Model", "State assumptions, equations and the structure of the investigation."],
  ["03", "Math", "Compute, visualize and save reusable scientific results."],
  ["04", "Notebook", "Keep reasoning, observations and findings in the same trail."],
  ["05", "Writer", "Turn the evidence into a publication without breaking the chain."],
];

function ProjectPreview({ copy }: { copy: ScienceLandingCopy }) {
  return (
    <div className="ax-product-frame">
      <div className="flex h-11 items-center justify-between border-b border-[var(--ax-line)] px-5"><span className="ax-figure-label">Fig 01 · Project workspace</span><span className="text-[10px] font-semibold text-[var(--ax-accent)]">Local · active</span></div>
      <div className="grid min-h-[570px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--ax-line)] bg-[var(--ax-surface-soft)] p-5 lg:border-b-0 lg:border-r lg:p-6">
          <div className="ax-figure-label">Project</div>
          <div className="mt-6 space-y-1.5 text-[11px] font-semibold text-[var(--ax-text-soft)]">{['Overview','Calculations','Notebook','Documents','Activity'].map((item,index)=><div key={item} className={`rounded-[7px] px-3 py-2.5 ${index===0?'bg-white text-[var(--ax-text)] shadow-[var(--ax-shadow-subtle)]':''}`}>{item}</div>)}</div>
          <div className="mt-9 border-t border-[var(--ax-line)] pt-5 text-[10px] leading-5 text-[var(--ax-text-faint)]">One research context<br />Three focused instruments<br />Local by default</div>
        </aside>

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 border-b border-[var(--ax-line)] pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="ax-figure-label text-[var(--ax-accent)]">{copy.productKicker}</p><h3 className="mt-2 font-[family-name:var(--ax-font-display)] text-[clamp(32px,4vw,48px)] tracking-[-0.045em]">{copy.previewTitle}</h3><p className="mt-2 text-[12px] text-[var(--ax-text-soft)]">{copy.previewCopy}</p></div>
            <div className="text-[10px] font-semibold text-[var(--ax-text-faint)]">5 objects · 3 instruments</div>
          </div>

          <div className="mt-7 grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
            <div className="rounded-[14px] border border-[var(--ax-line)] bg-[var(--ax-surface-soft)] p-6">
              <div className="flex items-center justify-between"><span className="ax-figure-label">Latest scientific object</span><span className="text-[9px] font-semibold text-[var(--ax-accent)]">Math</span></div>
              <div className="mt-5 font-[family-name:var(--ax-font-display)] text-[25px]">∂u/∂t + u·∇u = −∇p + ν∇²u</div>
              <svg viewBox="0 0 380 190" className="mt-6 h-[190px] w-full" aria-hidden="true">
                <g fill="none" stroke="#7fa9df" strokeWidth="1.2" opacity="0.72"><path d="M6 94 C53 37 100 38 145 94 C190 150 238 150 283 94 C328 39 354 51 374 73"/><path d="M6 116 C54 68 99 68 144 101 C190 134 237 130 282 94 C328 58 354 63 374 97" opacity="0.62"/><path d="M6 72 C53 121 99 124 145 94 C190 63 238 64 283 95 C328 126 354 119 374 100" opacity="0.48"/></g>
              </svg>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px]"><span className="rounded-full bg-white px-3 py-1.5 font-semibold">Calculation · r4</span><span className="rounded-full bg-[var(--ax-accent-soft)] px-3 py-1.5 font-semibold text-[var(--ax-accent)]">Saved locally</span></div>
            </div>

            <div className="grid content-start gap-3">
              {[['Math','Solve and visualize the result.'],['Notebook','Keep the reasoning and observation.'],['Writer','Use the evidence in a publication.']].map(([title,copy],index)=><div key={title} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-[12px] border border-[var(--ax-line)] bg-white p-4"><div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--ax-accent-soft)] font-serif text-[13px] text-[var(--ax-accent)]">{index+1}</div><div><div className="text-[12px] font-semibold">{title}</div><p className="mt-1 text-[11px] leading-5 text-[var(--ax-text-soft)]">{copy}</p></div></div>)}
              <div className="mt-1 border-t border-[var(--ax-line)] pt-5 text-[11px] leading-6 text-[var(--ax-text-soft)]"><span className="font-semibold text-[var(--ax-text)]">Project context.</span> The scientific object survives every handoff instead of becoming a screenshot or copied number.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const { locale } = useLocale();
  const copy = scienceLandingCopy[locale];
  const promises = locale === "uz" ? [["Hisobla", "Loyihaning mazmunini yo‘qotmasdan kerakli ilmiy asboblardan foydalaning."], ["Fikrlang", "Model, kuzatuv va xulosalarni ularni yaratgan dalil bilan bog‘lab saqlang."], ["Nashr qiling", "Ilmiy kontekstni oxirida qayta tiklamasdan hujjatga olib o‘ting."]] : defaultPromises;
  const workflow = locale === "uz" ? [["01", "Savol", "Tadqiqot muammosi va uning kontekstidan boshlang."], ["02", "Model", "Farazlar, tenglamalar va tadqiqot tuzilmasini belgilang."], ["03", "Math", "Qayta ishlatiladigan ilmiy natijalarni hisoblang, ko‘rsating va saqlang."], ["04", "Notebook", "Fikrlash, kuzatuv va xulosalarni bitta izda saqlang."], ["05", "Writer", "Zanjirni buzmasdan dalillarni nashrga tayyor hujjatga aylantiring."]] : defaultWorkflow;
  return (
    <div className="ax-landing">
      <div className="ax-landing-container"><section className="ax-landing-hero"><div className="ax-hero-copy"><p className="ax-landing-kicker">{copy.heroKicker}</p><h1 className="ax-landing-display">{copy.heroTitle[0]}<br/>{copy.heroTitle[1]} <span className="italic">{copy.heroTitle[2]}</span></h1><div className="ax-signature-rule" aria-hidden="true"/><p className="ax-landing-lead">{copy.heroLead}</p><div className="mt-8 flex flex-wrap gap-2"><Link href="/projects" className="ax-premium-primary">{copy.start} <ArrowRight className="h-4 w-4"/></Link><Link href="#product" className="ax-premium-secondary">{copy.see} <ArrowRight className="h-3.5 w-3.5 text-[var(--ax-text-faint)]"/></Link></div></div><div className="ax-hero-visual"><ScienceHeroScene/></div></section></div>

      <section className="ax-promise-strip"><div className="ax-landing-container ax-promise-grid">{promises.map(([title,copy])=><div key={title} className="ax-promise-item"><div className="ax-promise-title">{title}</div><p className="ax-promise-copy">{copy}</p></div>)}</div></section>

      <section id="product" className="ax-landing-section"><div className="ax-landing-container"><div className="ax-section-head"><div><p className="ax-landing-kicker">{copy.productKicker}</p><h2 className="ax-section-title">{copy.productTitle}</h2></div><p className="ax-section-copy">{copy.productCopy}</p></div><ProjectPreview copy={copy}/></div></section>

      <section id="workflow" className="ax-landing-section ax-landing-section-alt"><div className="ax-landing-container"><div className="ax-section-head"><div><p className="ax-landing-kicker">{copy.workflowKicker}</p><h2 className="ax-section-title">{copy.workflowTitle}</h2></div><p className="ax-section-copy">{copy.workflowCopy}</p></div><div className="ax-editorial-list">{workflow.map(([index,title, text])=><div key={index} className="ax-editorial-row"><div className="ax-editorial-index">{index}</div><div className="ax-editorial-title">{title}</div><p className="ax-editorial-copy">{text}</p></div>)}</div></div></section>

      <section id="ecosystem" className="ax-landing-section ax-landing-section-alt"><div className="ax-landing-container"><div className="ax-section-head"><div><p className="ax-landing-kicker">{copy.ecosystemKicker}</p><h2 className="ax-section-title">{copy.ecosystemTitle}</h2></div><p className="ax-section-copy">{copy.ecosystemCopy}</p></div><div className="mt-14 grid gap-3 lg:grid-cols-3">{[Sigma, BookOpenText, FileText].map((Icon,index)=><div key={copy.ecosystemItems[index][0]} className="relative border-t border-[var(--ax-line)] py-7 lg:px-7 lg:first:pl-0"><div className="flex items-center gap-3"><Icon className="h-4 w-4 text-[var(--ax-accent)]"/><span className="font-[family-name:var(--ax-font-display)] text-[25px]">{copy.ecosystemItems[index][0]}</span></div><p className="mt-3 max-w-sm text-[13px] leading-6 text-[var(--ax-text-soft)]">{copy.ecosystemItems[index][1]}</p>{index<2?<ArrowRight className="absolute right-2 top-9 hidden h-4 w-4 text-[var(--ax-text-faint)] lg:block"/>:null}</div>)}</div></div></section>

      <section className="ax-final-cta"><div className="ax-landing-container"><FlaskConical className="mx-auto mb-6 h-5 w-5 text-[var(--ax-accent)]"/><h2 className="ax-final-title">{copy.finalTitle[0]} <span className="italic">{copy.finalTitle[1]}</span></h2><p className="ax-final-copy">{copy.finalCopy}</p><Link href="/projects" className="ax-premium-primary mt-8">{copy.start} <ArrowRight className="h-4 w-4"/></Link></div></section>
    </div>
  );
}
