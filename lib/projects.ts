import { NovelChapter, ScriptData, Project } from "./types";

const PROJECTS_KEY = "scriptflow_projects";
const ACTIVE_KEY = "scriptflow_active_project";
const MAX_PROJECTS = 20;

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function saveActiveProjectId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function createProject(title: string, author: string): Project {
  const projects = loadProjects();
  const project: Project = {
    id: Date.now().toString(36),
    title,
    author,
    createdAt: new Date().toLocaleString("zh-CN"),
    updatedAt: new Date().toLocaleString("zh-CN"),
    chapters: [],
    yaml: "",
    script: null,
  };
  projects.unshift(project);
  if (projects.length > MAX_PROJECTS) projects.pop();
  saveProjects(projects);
  saveActiveProjectId(project.id);
  return project;
}

export function updateProject(id: string, data: Partial<Project>): Project | null {
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  projects[idx] = {
    ...projects[idx],
    ...data,
    updatedAt: new Date().toLocaleString("zh-CN"),
  };
  saveProjects(projects);
  return projects[idx];
}

export function deleteProject(id: string): Project[] {
  const projects = loadProjects().filter((p) => p.id !== id);
  saveProjects(projects);
  if (loadActiveProjectId() === id) saveActiveProjectId(null);
  return projects;
}

export function getProject(id: string): Project | null {
  return loadProjects().find((p) => p.id === id) || null;
}
