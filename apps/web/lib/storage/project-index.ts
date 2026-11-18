export interface ProjectSummary {
  id: string;
  title: string;
  updatedAt: number; // in ms since epoch, last time the CONTENT changed
  lastOpenedAt?: number; // in ms since epoch, last time the project was opened
}

const KEY = "huddle:projects";
const EVENT = "huddle:projects-changed";

export function getIndexSnapshot(): string {
  return store()?.getItem(KEY) ?? "[]";
}

// for re-render when data is changed
export function subscribeIndex(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // changes from other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** localStorage is missing on the server then can throw */
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
  // return true if all condition passed
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.updatedAt === "number" &&
    (v.lastOpenedAt === undefined || typeof v.lastOpenedAt === "number")
  );
}

/** Parse the raw index string. */
export function parseIndex(raw: string | null): ProjectSummary[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSummary) : [];
  } catch {
    return []; // a corrupt index is only a cache; the docs are the source of truth
  }
}

function read(): ProjectSummary[] {
  return parseIndex(store()?.getItem(KEY) ?? null);
}

/** save the proj summary to localstorage (only the title, id and dates to compare - other data is stored in the indexedDB) */
function write(projects: ProjectSummary[]): void {
  try {
    store()?.setItem(KEY, JSON.stringify(projects));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(EVENT));
    }
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
  // combine existing and new patch to make a new merge entry
  const merged = { title: "", updatedAt: Date.now(), ...existing, ...patch };

  // patch the new newly merge entry into the existing entry
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
