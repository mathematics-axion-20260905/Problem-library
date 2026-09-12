"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BookOpenText, FileText, Sigma } from "lucide-react";

import { AxActionLink, AxBadge, AxButton, AxEmptyState, AxField, AxInput } from "@/components/axion";
import { getEcosystemHref } from "@/lib/ecosystem/apps";
import { createLocalProject, deleteLocalProject, listLocalProjects, listProjectsWithServer, syncLocalProject, type LocalScienceProject } from "@/lib/ecosystem/local-projects";
import { importLocalScientificObject } from "@/lib/ecosystem/local-object-store";
import { discardScientificObjectTransfer, fetchScientificObjectTransfer } from "@/lib/ecosystem/transfer";

export default function ProjectsPage() {
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
        setTransferNotice(`Scientific Object received: ${object.title}`);
      })
      .catch((error) => setTransferNotice(error instanceof Error ? error.message : "Scientific Object transfer failed."));
  }, []);

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
            <p className="ax-work-kicker">Projects</p>
            <h1 className="ax-work-title">One place for the research trail.</h1>
            <p className="ax-work-lead">A Project keeps computation, reasoning and publication in one scientific context. It syncs to the ecosystem core and remains usable from the local cache.</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <AxButton variant="primary" onClick={() => setShowCreate(true)}>New project</AxButton>
              {recentProject ? <AxActionLink href={getEcosystemHref("math", "science", recentProject.id)}>Continue recent</AxActionLink> : null}
            </div>
          </div>
          <div className="ax-work-stats">
            <div className="ax-work-stat"><div className="ax-work-stat-value">{projects.length}</div><div className="ax-work-stat-label">Projects</div></div>
            <div className="ax-work-stat"><div className="ax-work-stat-value">3</div><div className="ax-work-stat-label">Instruments</div></div>
            <div className="ax-work-stat"><div className="ax-work-stat-value">Synced</div><div className="ax-work-stat-label">Storage</div></div>
          </div>
        </section>

        <section className="ax-work-section">
          {showCreate ? (
            <div className="ax-work-panel-elevated mb-8 overflow-hidden">
              <div className="grid gap-5 border-b border-[var(--ax-work-line)] px-5 py-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                <div>
                  <div className="ax-work-kicker">New project</div>
                  <div className="mt-2 font-serif text-[27px] tracking-[-0.04em]">Start with context, not configuration.</div>
                </div>
                <p className="max-w-xl text-[11px] leading-5 text-[var(--ax-text-soft)]">Name the research question or study. The Project becomes the shared context for Math, Notebook and Writer.</p>
              </div>
              <form onSubmit={handleCreate} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
                <AxField label="Project name"><AxInput autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Turbulence study" required /></AxField>
                <AxField label="Context" hint="Optional"><AxInput value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What are you investigating?" /></AxField>
                <div className="flex gap-2"><AxButton type="submit" variant="primary">Create</AxButton><AxButton variant="quiet" onClick={() => setShowCreate(false)}>Cancel</AxButton></div>
              </form>
            </div>
          ) : null}

          {!projects.length ? (
            <AxEmptyState title="No project yet." description="Create one without signing in. The ecosystem core keeps the project available across app servers while the local cache covers short outages." action={<AxButton variant="primary" onClick={() => setShowCreate(true)}>Create first project</AxButton>} />
          ) : (
            <>
              <div className="mb-5 flex items-end justify-between gap-5">
                <div><div className="ax-work-kicker">Research contexts</div><div className="mt-2 font-serif text-[26px] tracking-[-0.035em]">Your projects</div></div>
                <div className="hidden text-[10px] text-[var(--ax-text-faint)] sm:block">Math · Notebook · Writer</div>
              </div>
              <div className="ax-work-list">
                {projects.map((project, index) => (
                  <article key={project.id} className="ax-work-row grid gap-5 px-1 py-6 sm:px-5 lg:grid-cols-[52px_minmax(0,1fr)_auto] lg:items-center lg:px-6">
                    <div className="font-serif text-[22px] text-[var(--ax-text-faint)]">{String(index + 1).padStart(2, "0")}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-serif text-[29px] tracking-[-0.04em] text-[var(--ax-text)]">{project.title}</h2><AxBadge>{project.storage === "server" ? "Synced" : "Local cache"}</AxBadge></div>
                      <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[var(--ax-text-soft)]">{project.description || "No description yet."}</p>
                      <p className="mt-2 text-[9.5px] text-[var(--ax-text-faint)]">Updated {new Date(project.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <AxActionLink href={getEcosystemHref("math", "science", project.id)} variant="primary" size="sm"><Sigma className="h-3.5 w-3.5" />Math</AxActionLink>
                      <AxActionLink href={getEcosystemHref("notebook", "science", project.id)} size="sm"><BookOpenText className="h-3.5 w-3.5" />Notebook</AxActionLink>
                      <AxActionLink href={getEcosystemHref("writer", "science", project.id)} size="sm"><FileText className="h-3.5 w-3.5" />Writer</AxActionLink>
                      <AxButton variant="quiet" size="sm" onClick={() => { if (window.confirm(`Delete local project “${project.title}”?`)) { deleteLocalProject(project.id); refresh(); } }}>Delete</AxButton>
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
            ["Project first", "The user sees one research context, not a folder of disconnected apps."],
            ["Object native", "Results stay structured so another instrument can reuse them without copy-paste."],
            ["Server-backed", "Projects sync to the ecosystem core; local cache keeps the workspace usable during a short outage."],
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
