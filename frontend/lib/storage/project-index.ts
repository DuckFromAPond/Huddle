// TODO read

export interface ProjectSummary {
  id: string;
  title: string;
  updatedAt: number; // ms since epoch, last time the CONTENT changed
  lastOpenedAt?: number; // ms since epoch, last time the project was opened
}

const KEY = "huddle:projects";

/** localStorage is missing on the server and can throw (private mode, quota). */
function store(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function isSummary(value: unknown): value is ProjectSummary {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.updatedAt === "number" &&
    (v.lastOpenedAt === undefined || typeof v.lastOpenedAt === "number")
  );
}

function read(): ProjectSummary[] {
  const raw = store()?.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSummary) : [];
  } catch {
    return []; // a corrupt index is only a cache; the docs are the source of truth
  }
}

function write(projects: ProjectSummary[]): void {
  try {
    store()?.setItem(KEY, JSON.stringify(projects));
  } catch {
    // Quota or blocked storage: the dashboard just shows a stale list.
  }
}

/** Most recently changed first. */
export function listProjects(): ProjectSummary[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProjectSummary(id: string): ProjectSummary | undefined {
  return read().find((p) => p.id === id);
}

/** Merges into any existing entry, so a title update never erases lastOpenedAt. */
export function upsertProject(patch: Partial<ProjectSummary> & { id: string }): void {
  const all = read();
  const existing = all.find((p) => p.id === patch.id);
  const merged = { title: "", updatedAt: Date.now(), ...existing, ...patch };
  write([...all.filter((p) => p.id !== patch.id), merged]);
}

export function markProjectOpened(id: string): void {
  if (getProjectSummary(id)) upsertProject({ id, lastOpenedAt: Date.now() });
}

/** Projects that have been opened, most recently opened first. */
export function listRecentProjects(limit = 5): ProjectSummary[] {
  return read()
    .filter((p) => p.lastOpenedAt !== undefined)
    .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0))
    .slice(0, limit);
}

export function removeProject(id: string): void {
  write(read().filter((p) => p.id !== id));
}