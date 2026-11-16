// TODO READ 

import * as Y from "yjs";
import { IndexeddbPersistence, clearDocument } from "y-indexeddb";
import { nanoid } from "nanoid";
import {
  applyImport,
  getProjectTitle,
  ImportError,
  initProject,
  isInitialized,
  parseImport,
} from "@/lib/doc/project";
import {
  getProjectSummary,
  markProjectOpened,
  removeProject,
  upsertProject,
} from "@/lib/storage/project-index";

// BROWSER ONLY. Call these from client components (inside useEffect), never during
// server rendering: IndexedDB does not exist on the server.

const dbName = (id: string) => `huddle-project-${id}`;
const DEFAULT_INDEX_DEBOUNCE_MS = 300;

export interface OpenOptions {
  /** How long to wait after an edit before updating the dashboard index. */
  indexDebounceMs?: number;
}

export interface OpenProject {
  id: string;
  doc: Y.Doc;
  /**
   * Whether this project was already stored on this device when it was opened.
   * False for a brand-new id, such as a joiner who has not received the first sync.
   */
  existedLocally: boolean;
  /** Write any pending dashboard-index update now. */
  flushIndex(): void;
  /** Flush, then release IndexedDB and the doc. Always call this on unmount. */
  close(): Promise<void>;
}

/**
 * Load a project's doc from IndexedDB and wait for it (whenSynced) before
 * returning, so the board never renders half-loaded data. An unknown id returns
 * an EMPTY doc: it never invents content (design rule 1).
 */
export async function openProject(
  id: string,
  options: OpenOptions = {},
): Promise<OpenProject> {
  const delay = options.indexDebounceMs ?? DEFAULT_INDEX_DEBOUNCE_MS;
  const doc = new Y.Doc();
  const persistence = new IndexeddbPersistence(dbName(id), doc);
  await persistence.whenSynced;

  const existedLocally = isInitialized(doc);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  const writeIndex = () => {
    timer = undefined;
    const title = getProjectTitle(doc);
    if (title === undefined) return; // empty doc: nothing worth listing yet
    upsertProject({ id, title, updatedAt: Date.now() });
  };

  // Attached only AFTER whenSynced, so loading from disk is never counted as an edit.
  const onUpdate = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(writeIndex, delay);
  };
  doc.on("update", onUpdate);

  // The index is only a cache. If it lost this project, rebuild the entry.
  if (existedLocally && !getProjectSummary(id)) writeIndex();
  if (existedLocally) markProjectOpened(id);

  const flushIndex = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    writeIndex();
  };

  return {
    id,
    doc,
    existedLocally,
    flushIndex,
    async close() {
      if (closed) return;
      closed = true;
      doc.off("update", onUpdate);
      flushIndex();
      await persistence.destroy();
      doc.destroy();
    },
  };
}

/** A brand-new project with a new id (the id doubles as the room id later). */
export async function createProject(
  title: string,
  options?: OpenOptions,
): Promise<OpenProject> {
  const project = await openProject(nanoid(), options);
  initProject(project.doc, title.trim() || "Untitled");
  project.flushIndex();
  markProjectOpened(project.id);
  return project;
}

/**
 * Import always makes a NEW project with a NEW id. It never writes into an
 * existing doc. The file is validated first, so a bad file creates nothing.
 * Accepts the raw file text or an already-parsed value.
 */
export async function importProject(
  input: unknown,
  options?: OpenOptions,
): Promise<OpenProject> {
  let raw = input;
  if (typeof input === "string") {
    try {
      raw = JSON.parse(input);
    } catch {
      throw new ImportError("That file is not valid JSON.");
    }
  }
  const data = parseImport(raw);

  const project = await openProject(nanoid(), options);
  applyImport(project.doc, data);
  project.flushIndex();
  markProjectOpened(project.id);
  return project;
}

/** Remove a project from this device. Close it first, or the delete waits for the open connection. */
export async function deleteProject(id: string): Promise<void> {
  removeProject(id);
  await clearDocument(dbName(id));
}