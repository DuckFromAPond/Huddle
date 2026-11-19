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
import type { Author } from "@/lib/doc/activity";

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
 * Load a project's doc from IndexedDB and wait for it (whenSynced) before returning,
 * so the board never renders half-loaded data.
 * An unknown id returns an EMPTY doc.
 */
export async function openProject(id: string, options: OpenOptions = {}): Promise<OpenProject> {
  const delay = options.indexDebounceMs ?? DEFAULT_INDEX_DEBOUNCE_MS;
  const doc = new Y.Doc(); // initialize a doc for writing data to storage
  const persistence = new IndexeddbPersistence(dbName(id), doc);
  await persistence.whenSynced;

  const existedLocally = isInitialized(doc);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;

  // helper func for updating the localStorage
  const writeIndex = () => {
    // clear timer
    timer = undefined;

    // get title from meta map
    const title = getProjectTitle(doc);

    if (title === undefined) return; // empty doc: nothing worth listing yet
    upsertProject({ id, title, updatedAt: Date.now() });
  };

  // Attached only AFTER whenSynced, so loading from disk is never counted as an edit.
  const onUpdate = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    // set timer schedule a writeIndex after a delay
    timer = setTimeout(writeIndex, delay);
  };

  // set listener to call onUpdate when the doc is updated
  doc.on("update", onUpdate);

  // The index is only a cache. If it lost this project, rebuild the entry.
  if (existedLocally && !getProjectSummary(id)) {
    writeIndex();
  }

  if (existedLocally) {
    markProjectOpened(id);
  }

  // callback func to write update to local storage
  const flushIndex = () => {
    if (timer === undefined) return;

    // clear timeout and just write immediately
    clearTimeout(timer);
    writeIndex();
  };

  // callback func to write changes and close listener + doc
  const close = async () => {
    if (closed) return;
    closed = true;

    doc.off("update", onUpdate);
    flushIndex();

    // close sync and clean up
    await persistence.destroy();
    doc.destroy();
  };

  return {
    // data
    id,
    doc,
    existedLocally,
    // callback functions
    flushIndex,
    close,
  };
}

/** A brand-new project with a new id (the id doubles as the room id). */
export async function createProject(title: string, options?: OpenOptions): Promise<OpenProject> {
  // initialize a new project
  const project = await openProject(nanoid(), options);
  initProject(project.doc, title.trim() || "Untitled");

  // write changes & updates
  project.flushIndex();
  markProjectOpened(project.id);

  return project;
}

/**
 * Import always makes a NEW project with a NEW id.
 * It never writes into an existing doc. The file is validated first, so a bad file creates nothing.
 * Accepts the raw file text or an already-parsed value.
 * parse JSON -> parseImport -> applyImport -> new proj
 */
export async function importProject(
  input: unknown,
  by: Author,
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
  // read JSON before applying import
  const data = parseImport(raw);

  // start a new proj & apply import
  const project = await openProject(nanoid(), options);
  applyImport(project.doc, data, by);

  // write changes & updates
  project.flushIndex();
  markProjectOpened(project.id);

  return project;
}

/** Remove a project from this device. Close it first, or the delete waits for the open connection. */
export async function deleteProject(id: string): Promise<void> {
  removeProject(id);
  await clearDocument(dbName(id));
}
