"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpenText, FileText, Sigma } from "lucide-react";

import { AxActionLink, AxBadge, AxButton, AxEmptyState, AxField, AxInput } from "@/components/axion";
import { getEcosystemHref } from "@/lib/ecosystem/apps";
import { createLocalProject, deleteLocalProject, listLocalProjects, listProjectsWithServer, syncLocalProject, type LocalScienceProject } from "@/lib/ecosystem/local-projects";
import { importLocalScientificObject } from "@/lib/ecosystem/local-object-store";
import { discardScientificObjectTransfer, fetchScientificObjectTransfer } from "@/lib/ecosystem/transfer";
import { useLocale } from "@/components/locale-provider";

export default function ProjectsPage() {
  const { locale } = useLocale();
  const copy = locale === "uz"
    ? { kicker: "Loyihalar", title: "Tadqiqot qaydi uchun yagona makon.", lead: "Loyiha hisoblash, fikrlash va nashrni yagona ilmiy kontekstda saqlaydi. Ma’lumotlar ekotizim yadrosiga sinxronlanadi, mahalliy kesh esa qisqa uzilishlarda ishlashni davom ettiradi.", newProject: "Yangi loyiha", continue: "So‘nggi loyihani davom ettirish", instruments: "Asboblar", storage: "Saqlash", synced: "Sinxronlangan", newKicker: "Yangi loyiha", newTitle: "Konfiguratsiyadan emas, kontekstdan boshlang.", newDescription: "Tadqiqot savoli yoki ish nomini kiriting. Loyiha Math, Notebook va Writer uchun umumiy kontekst bo‘ladi.", name: "Loyiha nomi", context: "Kontekst", optional: "Ixtiyoriy", contextPlaceholder: "Nimani o‘rganyapsiz?", create: "Yaratish", cancel: "Bekor qilish", emptyTitle: "Hozircha loyiha yo‘q.", emptyDescription: "Hisobga kirmasdan loyiha yarating. Ekotizim yadrosi uni serverlar orasida saqlaydi, mahalliy kesh esa qisqa uzilishlarni qoplaydi.", first: "Birinchi loyihani yaratish", contexts: "Tadqiqot kontekstlari", yourProjects: "Loyihalaringiz", localCache: "Mahalliy kesh", updated: "Yangilangan", delete: "O‘chirish", confirmDelete: "«{title}» mahalliy loyihasi o‘chirilsinmi?", projectFirst: "Avval loyiha", projectFirstBody: "Foydalanuvchi bir-biridan uzilgan dasturlar papkasini emas, yagona tadqiqot kontekstini ko‘radi.", native: "Obyektga asoslangan", nativeBody: "Natijalar tuzilmali saqlanadi va boshqa asbob ulardan ko‘chirmasdan foydalanadi.", backed: "Server bilan sinxron", backedBody: "Loyihalar ekotizim yadrosiga sinxronlanadi; mahalliy kesh qisqa uzilishlarda ish maydonini saqlaydi." }
    : { kicker: "Projects", title: "One place for the research record.", lead: "A Project keeps computation, reasoning and publication in one scientific context. It syncs to the ecosystem core and remains usable from the local cache.", newProject: "New project", continue: "Continue recent", instruments: "Instruments", storage: "Storage", synced: "Synced", newKicker: "New project", newTitle: "Start with context, not configuration.", newDescription: "Name the research question or study. The Project becomes the shared context for Math, Notebook and Writer.", name: "Project name", context: "Context", optional: "Optional", contextPlaceholder: "What are you investigating?", create: "Create", cancel: "Cancel", emptyTitle: "No project yet.", emptyDescription: "Create one without signing in. The ecosystem core keeps the project available across app servers while the local cache covers short outages.", first: "Create first project", contexts: "Research contexts", yourProjects: "Your projects", localCache: "Local cache", updated: "Updated", delete: "Delete", confirmDelete: "Delete “{title}”?", projectFirst: "Project first", projectFirstBody: "The user sees one research context, not a folder of disconnected apps.", native: "Object native", nativeBody: "Results stay structured so another instrument can reuse them without copy-paste.", backed: "Server-backed", backedBody: "Projects sync to the ecosystem core; local cache keeps the workspace usable during a short outage." };
  const [projects, setProjects] = useState<LocalScienceProject[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [transferNotice, setTransferNotice] = useState<string | null>(null);

  const refresh = () => setProjects(listLocalProjects());
  useEffect(() => {
    setProjects(listLocalProjects());
    void listProjectsWithServer().then(setProjects);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transferId = params.get("transferId");
    if (params.get("source") !== "transfer" || !transferId) return;
    void fetchScientificObjectTransfer(transferId)
      .then(async (transfer) => {
        const object = await importLocalScientificObject(transfer.payload);
        await discardScientificObjectTransfer(transferId);
        setTransferNotice(locale === "uz" ? `Scientific Object qabul qilindi: ${object.title}` : `Scientific Object received: ${object.title}`);
      })
      .catch((error) => setTransferNotice(error instanceof Error ? error.message : locale === "uz" ? "Scientific Object uzatilmadi." : "Scientific Object transfer failed."));
  }, [locale]);

  const recentProject = useMemo(() => projects[0], [projects]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const project = createLocalProject(title, description);
    const synced = await syncLocalProject(project).catch(() => project);
    setTitle("");
    setDescription("");
    setShowCreate(false);
    refresh();
    window.location.assign(getEcosystemHref("math", "science", synced.id));
  };

  return (
    <div className="ax-workspace-root">
      <main className="ax-work-container">
        {transferNotice ? <div className="mb-6 rounded-xl border border-[var(--ax-work-line)] bg-[var(--ax-surface)] px-4 py-3 text-xs text-[var(--ax-text-soft)]">{transferNotice}</div> : null}
        <section className="ax-work-pagehead">
          <div>
            <p className="ax-work-kicker">{copy.kicker}</p>
            <h1 className="ax-work-title">{copy.title}</h1>
            <p className="ax-work-lead">{copy.lead}</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <AxButton variant="primary" onClick={() => setShowCreate(true)}>{copy.newProject}</AxButton>
              {recentProject ? <AxActionLink href={getEcosystemHref("math", "science", recentProject.id)}>{copy.continue}</AxActionLink> : null}
            </div>
          </div>
          <div className="ax-work-stats">
            <div className="ax-work-stat"><div className="ax-work-stat-value">{projects.length}</div><div className="ax-work-stat-label">{copy.kicker}</div></div>
            <div className="ax-work-stat"><div className="ax-work-stat-value">3</div><div className="ax-work-stat-label">{copy.instruments}</div></div>
            <div className="ax-work-stat"><div className="ax-work-stat-value">{copy.synced}</div><div className="ax-work-stat-label">{copy.storage}</div></div>
          </div>
        </section>

        <section className="ax-work-section">
          {showCreate ? (
            <div className="ax-work-panel-elevated mb-8 overflow-hidden">
              <div className="grid gap-5 border-b border-[var(--ax-work-line)] px-5 py-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                <div>
                  <div className="ax-work-kicker">{copy.newKicker}</div>
                  <div className="mt-2 font-serif text-[27px] tracking-[-0.04em]">{copy.newTitle}</div>
                </div>
                <p className="max-w-xl text-[11px] leading-5 text-[var(--ax-text-soft)]">{copy.newDescription}</p>
              </div>
              <form onSubmit={handleCreate} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
                <AxField label={copy.name}><AxInput autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Turbulence study" required /></AxField>
                <AxField label={copy.context} hint={copy.optional}><AxInput value={description} onChange={(event) => setDescription(event.target.value)} placeholder={copy.contextPlaceholder} /></AxField>
                <div className="flex gap-2"><AxButton type="submit" variant="primary">{copy.create}</AxButton><AxButton variant="quiet" onClick={() => setShowCreate(false)}>{copy.cancel}</AxButton></div>
              </form>
            </div>
          ) : null}

          {!projects.length ? (
            <AxEmptyState title={copy.emptyTitle} description={copy.emptyDescription} action={<AxButton variant="primary" onClick={() => setShowCreate(true)}>{copy.first}</AxButton>} />
          ) : (
            <>
              <div className="mb-5 flex items-end justify-between gap-5">
                <div><div className="ax-work-kicker">{copy.contexts}</div><div className="mt-2 font-serif text-[26px] tracking-[-0.035em]">{copy.yourProjects}</div></div>
                <div className="hidden text-[10px] text-[var(--ax-text-faint)] sm:block">Math · Notebook · Writer</div>
              </div>
              <div className="ax-work-list">
                {projects.map((project, index) => (
                  <article key={project.id} className="ax-work-row grid gap-5 px-1 py-6 sm:px-5 lg:grid-cols-[52px_minmax(0,1fr)_auto] lg:items-center lg:px-6">
                    <div className="font-serif text-[22px] text-[var(--ax-text-faint)]">{String(index + 1).padStart(2, "0")}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-serif text-[29px] tracking-[-0.04em] text-[var(--ax-text)]">{project.title}</h2><AxBadge>{project.storage === "server" ? copy.synced : copy.localCache}</AxBadge></div>
                      <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[var(--ax-text-soft)]">{project.description || (locale === "uz" ? "Tavsif kiritilmagan." : "No description yet.")}</p>
                      <p className="mt-2 text-[9.5px] text-[var(--ax-text-faint)]">{copy.updated} {new Date(project.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <AxActionLink href={getEcosystemHref("math", "science", project.id)} variant="primary" size="sm"><Sigma className="h-3.5 w-3.5" />Math</AxActionLink>
                      <AxActionLink href={getEcosystemHref("notebook", "science", project.id)} size="sm"><BookOpenText className="h-3.5 w-3.5" />Notebook</AxActionLink>
                      <AxActionLink href={getEcosystemHref("writer", "science", project.id)} size="sm"><FileText className="h-3.5 w-3.5" />Writer</AxActionLink>
                      <AxButton variant="quiet" size="sm" onClick={() => { if (window.confirm(copy.confirmDelete.replace("{title}", project.title))) { deleteLocalProject(project.id); refresh(); } }}>{copy.delete}</AxButton>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <section className="border-y border-[var(--ax-work-line)] bg-[var(--ax-surface)]">
        <div className="ax-work-container grid md:grid-cols-3 md:divide-x md:divide-[var(--ax-work-line)]">
          {[
            [copy.projectFirst, copy.projectFirstBody],
            [copy.native, copy.nativeBody],
            [copy.backed, copy.backedBody],
          ].map(([heading, body]) => (
            <div key={heading} className="py-7 md:px-8 md:first:pl-0 md:last:pr-0">
              <div className="font-[family-name:var(--ax-font-display)] text-[22px] tracking-[-0.03em]">{heading}</div>
              <p className="mt-2 max-w-sm text-[11px] leading-5 text-[var(--ax-text-soft)]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
