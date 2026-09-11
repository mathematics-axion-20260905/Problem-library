import { deleteLocalScientificDataForProject } from "./local-project-cleanup";
import { createClientId } from "../client-id";

export interface LocalScienceProject {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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
}

export function findLocalProject(id: string): LocalScienceProject | undefined {
  return listLocalProjects().find((project) => project.id === id);
}
