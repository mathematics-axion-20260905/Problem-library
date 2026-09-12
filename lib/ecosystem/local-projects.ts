import { deleteLocalScientificDataForProject } from "./local-project-cleanup";
import { createClientId } from "../client-id";
import { fetchLibraryApi } from "../api";

export interface LocalScienceProject {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  storage?: "server" | "local";
}

const STORAGE_KEY = "axion.science.projects.v1";
const ACTIVE_PROJECT_KEY = "axion.science.active-project.v1";

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function makeId() {
  return createClientId("local");
}

export function listLocalProjects(): LocalScienceProject[] {
  if (!canUseBrowserStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalScienceProject[];
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: LocalScienceProject[]) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function normalizeServerProject(value: Record<string, unknown>): LocalScienceProject | null {
  if (typeof value.slug !== "string" || typeof value.title !== "string") return null;
  const now = new Date().toISOString();
  return {
    id: value.slug,
    title: value.title,
    description: typeof value.description === "string" ? value.description : undefined,
    createdAt: typeof value.created_at === "string" ? value.created_at : now,
    updatedAt: typeof value.updated_at === "string" ? value.updated_at : now,
    storage: "server",
  };
}

async function upsertServerProject(project: LocalScienceProject) {
  const response = await fetchLibraryApi("/api/projects/", {
    method: "POST",
    body: JSON.stringify({
      slug: project.id,
      title: project.title,
      topic: "General",
      difficulty: "Unspecified",
      description: project.description || "",
      status: "draft",
    }),
  });
  if (!response.ok && response.status !== 400) {
    throw new Error(`Project sync failed with status ${response.status}`);
  }
  if (response.ok) {
    const remote = normalizeServerProject(await response.json() as Record<string, unknown>);
    if (remote) return remote;
  }

  // A retry after a page refresh should update the existing server row rather
  // than turn a harmless duplicate into a visible sync error.
  const update = await fetchLibraryApi(`/api/projects/${encodeURIComponent(project.id)}/`, {
    method: "PATCH",
    body: JSON.stringify({ title: project.title, description: project.description || "" }),
  });
  if (!update.ok) throw new Error(`Project sync failed with status ${update.status}`);
  return normalizeServerProject(await update.json() as Record<string, unknown>) || { ...project, storage: "server" };
}

export async function syncLocalProject(project: LocalScienceProject): Promise<LocalScienceProject> {
  const remote = await upsertServerProject(project);
  const projects = listLocalProjects().map((item) => item.id === project.id ? (remote || project) : item);
  writeProjects(projects);
  return remote || project;
}

export async function listProjectsWithServer(): Promise<LocalScienceProject[]> {
  const local = listLocalProjects();
  try {
    const response = await fetchLibraryApi("/api/projects/", { cache: "no-store" });
    if (!response.ok) return local;
    const payload = await response.json() as { results?: Record<string, unknown>[] } | Record<string, unknown>[];
    const rawProjects = Array.isArray(payload) ? payload : payload.results || [];
    const remote = rawProjects.map(normalizeServerProject).filter((item): item is LocalScienceProject => Boolean(item));
    const merged = [...remote, ...local.filter((item) => !remote.some((remoteItem) => remoteItem.id === item.id))]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    writeProjects(merged);
    return merged;
  } catch {
    return local;
  }
}

export function createLocalProject(title: string, description = ""): LocalScienceProject {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("PROJECT_TITLE_REQUIRED");

  const now = new Date().toISOString();
  const project: LocalScienceProject = {
    id: makeId(),
    title: cleanTitle,
    description: description.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    storage: "local",
  };

  writeProjects([project, ...listLocalProjects()]);
  window.localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
  return project;
}

export function deleteLocalProject(id: string) {
  writeProjects(listLocalProjects().filter((project) => project.id !== id));
  if (canUseBrowserStorage() && window.localStorage.getItem(ACTIVE_PROJECT_KEY) === id) {
    window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
  void deleteLocalScientificDataForProject(id).catch(() => undefined);
  void fetchLibraryApi(`/api/projects/${encodeURIComponent(id)}/`, { method: "DELETE" }).catch(() => undefined);
}

export function findLocalProject(id: string): LocalScienceProject | undefined {
  return listLocalProjects().find((project) => project.id === id);
}
