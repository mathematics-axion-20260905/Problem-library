"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { allProblems } from "@/app/data";
import { ProjectCreateModal } from "@/components/library/project-create-modal";
import { ProblemDetailCard } from "@/components/problems/problem-detail-card";
import { fetchLibraryApi } from "@/lib/api";
import { useLocale } from "@/components/locale-provider";

export default function ProblemsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = locale === "uz"
    ? { kicker: "Ilmiy kutubxona", title: "Tahlil uchun texnik masalalar.", lead: "Masalalarni mavzu va murakkablik bo‘yicha ko‘rib chiqing, keraklisini Loyiha sifatida saqlang va ishni ilmiy asboblarda davom ettiring.", create: "Loyiha yaratish", search: "Izlash", placeholder: "Sarlavha, mavzu, murakkablik, teg", sortTitle: "Saralash · sarlavha", sortTopic: "Saralash · mavzu", sortDifficulty: "Saralash · murakkablik", results: "natija", cases: "Masalalar", library: "Texnik masalalar kutubxonasi", dimensions: "Mavzu · murakkablik · davomiylik · teglar", createFailed: "Yaratib bo‘lmadi", success: "Loyiha yaratildi.", offline: "Backend bilan aloqa o‘rnatilmadi. Problem Library API sozlamalarini tekshiring." }
    : { kicker: "Scientific library", title: "Technical problems for analysis.", lead: "Browse problems by topic and difficulty, save useful cases as a Project, and continue the work in the scientific instruments.", create: "Create project", search: "Search", placeholder: "Title, topic, difficulty, tag", sortTitle: "Sort · Title", sortTopic: "Sort · Topic", sortDifficulty: "Sort · Difficulty", results: "results", cases: "Cases", library: "Technical problem library", dimensions: "Topic · difficulty · duration · tags", createFailed: "Create failed", success: "Project created.", offline: "Backend connection failed. Check the configured Problem Library API." };
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("create") === "1";
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [form, setForm] = useState({ title: "", topic: "", difficulty: "Medium", description: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") router.replace("/problems", { scroll: false });
  }, [router]);

  const deferredQuery = useDeferredValue(query);
  const filteredProblems = (() => {
    const normalized = deferredQuery.trim().toLowerCase();
    const matches = allProblems.filter((problem) => {
      if (!normalized) return true;
      return [problem.title, problem.topic, problem.difficulty, problem.summary, ...problem.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });

    return [...matches].sort((left, right) => {
      if (sortBy === "difficulty") return left.difficulty.localeCompare(right.difficulty);
      if (sortBy === "topic") return left.topic.localeCompare(right.topic);
      return left.title.localeCompare(right.title);
    });
  })();

  async function createProject() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetchLibraryApi("/api/projects/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          title: form.title,
          topic: form.topic,
          difficulty: form.difficulty,
          description: form.description,
          status: "draft",
        }),
      });

      if (!response.ok) throw new Error(copy.createFailed);
      setMessage(copy.success);
      setForm({ title: "", topic: "", difficulty: "Medium", description: "" });
      setOpen(false);
    } catch {
      setMessage(copy.offline);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ax-workspace-root">
      <main className="ax-work-container">
        <section className="ax-work-pagehead">
          <div>
            <p className="ax-work-kicker">{copy.kicker}</p>
            <h1 className="ax-work-title">{copy.title}</h1>
            <p className="ax-work-lead">{copy.lead}</p>
            <div className="mt-7">
              <button type="button" className="inline-flex h-10 items-center rounded-[var(--ax-work-control-radius)] bg-[var(--ax-accent-strong)] px-4 text-[11px] font-semibold text-white hover:bg-[var(--ax-accent)]" onClick={() => setOpen(true)}>
                {copy.create}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="problem-search" className="ax-work-kicker text-[var(--ax-text-faint)]">{copy.search}</label>
              <input
                id="problem-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.placeholder}
                className="ax-work-input mt-2 h-11 w-full px-3 text-sm"
              />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-3">
              <select id="problem-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="ax-work-select h-10 px-3 text-[11px] font-semibold">
                <option value="title">{copy.sortTitle}</option>
                <option value="topic">{copy.sortTopic}</option>
                <option value="difficulty">{copy.sortDifficulty}</option>
              </select>
              <div className="flex h-10 items-center justify-center border-y border-[var(--ax-work-line)] text-[10px] font-semibold text-[var(--ax-text-soft)]">
                {filteredProblems.length} {copy.results}
              </div>
            </div>
          </div>
        </section>

        <section className="ax-work-section">
          <div className="mb-5 flex items-end justify-between gap-5">
            <div><div className="ax-work-kicker">{copy.cases}</div><div className="mt-2 font-[family-name:var(--ax-font-display)] text-[26px] tracking-[-0.035em]">{copy.library}</div></div>
            <div className="hidden text-[10px] text-[var(--ax-text-faint)] md:block">{copy.dimensions}</div>
          </div>
          <div className="ax-work-list">
            {filteredProblems.map((problem, index) => <ProblemDetailCard key={problem.id} index={index} problem={problem} />)}
          </div>
        </section>

        <ProjectCreateModal
          open={open}
          form={form}
          message={message}
          saving={saving}
          onClose={() => setOpen(false)}
          onSubmit={createProject}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        />
      </main>
    </div>
  );
}
