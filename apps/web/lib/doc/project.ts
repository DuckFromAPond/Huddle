import * as Y from "yjs";
import { createCard, getCards, getDescription } from "@/lib/doc/cards";
import {
  DEFAULT_COLUMNS,
  isPriority,
  type ColumnId,
  type Priority,
  type Author,
  SCHEMA_VERSION,
  MAX_IMPORT_CARDS,
  MAX_TITLE_LENGTH,
} from "@/lib/schema";

/** meta map has the title and version */
function metaMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap<unknown>("meta");
}

export function observeVersion(doc: Y.Doc, cb: () => void): () => void {
  const meta = doc.getMap("meta");
  const versions = doc.getMap("versions");
  meta.observe(cb);
  versions.observe(cb);
  return () => {
    meta.unobserve(cb);
    versions.unobserve(cb);
  };
}

// ---------- Schema ----------

/**
 * Every app version that has written to this doc, as keys ("1", "2", ...).
 * Top-level, so concurrent writes from different app versions MERGE (both keys survive)
 * instead of one overwriting the other. The doc's effective version is the highest key.
 */
function versionsMap(doc: Y.Doc): Y.Map<true> {
  return doc.getMap<true>("versions");
}

/** Highest version seen, from the versions map or the older single `meta.schemaVersion`. */
function schemaVersionOf(doc: Y.Doc): number | undefined {
  let max: number | undefined;

  const legacy = metaMap(doc).get("schemaVersion");
  if (Number.isInteger(legacy)) max = legacy as number;

  for (const key of versionsMap(doc).keys()) {
    const v = Number(key);
    if (Number.isInteger(v) && (max === undefined || v > max)) max = v;
  }
  return max;
}

/** Record this app's version. Call inside a transaction. */
function markVersion(doc: Y.Doc): void {
  versionsMap(doc).set(String(SCHEMA_VERSION), true);
  // mirror for apps that only read meta.schemaVersion; drop once none are left
  metaMap(doc).set("schemaVersion", SCHEMA_VERSION);
}

export function isInitialized(doc: Y.Doc): boolean {
  return schemaVersionOf(doc) !== undefined;
}

/** An older doc opened by this newer app: record our version so older apps stop editing it. */
export function upgradeSchema(doc: Y.Doc): void {
  const v = schemaVersionOf(doc);
  if (v !== undefined && v < SCHEMA_VERSION) doc.transact(() => markVersion(doc));
}

/** True when a newer Huddle has touched this doc. This app must not edit it: it would misread new values. */
export function isNewerThanApp(doc: Y.Doc): boolean {
  const v = schemaVersionOf(doc);
  return v !== undefined && v > SCHEMA_VERSION;
}

// ---------- Project ----------

/** Only for brand-new projects. Joiners must never call this */
export function initProject(doc: Y.Doc, title: string): void {
  doc.transact(() => {
    metaMap(doc).set("title", title);
    markVersion(doc);
  });
}

export function getProjectTitle(doc: Y.Doc): string | undefined {
  const title = metaMap(doc).get("title");
  return typeof title === "string" ? title : undefined;
}

/** Renames the project. Trims the name, ignores empty names and no-op renames. Returns false if nothing was saved. */
export function setProjectTitle(doc: Y.Doc, title: string): boolean {
  const clean = title.trim().slice(0, MAX_TITLE_LENGTH);
  if (!clean) return false; // keep the old name rather than going blank

  const meta = metaMap(doc);
  if (meta.get("title") !== clean) meta.set("title", clean); // unchanged → no write, no "edited" bump
  return true;
}

// ---------- Export / import ----------

export interface ExportedCard {
  title: string;
  description: string;
  status: ColumnId;
  priority: Priority;
  order: string;
}

export interface ExportedProject {
  app: "huddle";
  schemaVersion: number;
  title: string;
  exportedAt: string;
  cards: ExportedCard[];
}

export class ImportError extends Error {}

/** Readable JSON for the user. Card ids are not exported; import makes new ones. */
export function exportProject(doc: Y.Doc): ExportedProject {
  return {
    app: "huddle",
    schemaVersion: SCHEMA_VERSION,
    title: getProjectTitle(doc) ?? "Untitled",
    exportedAt: new Date().toISOString(),
    cards: getCards(doc).map(({ title, description, status, priority, order }) => ({
      title,
      description,
      status,
      priority,
      order,
    })),
  };
}

/** Raw doc contents, for debugging only. The stored format is binary and hard to inspect. */
export function exportDebug(doc: Y.Doc): unknown {
  return Object.fromEntries(Array.from(doc.share, ([name, type]) => [name, type.toJSON()]));
}

/** Never trust a file so check the shape and clean every field. Throws ImportError. */
export function parseImport(raw: unknown): ExportedProject {
  if (typeof raw !== "object" || raw === null) {
    throw new ImportError("Not a Huddle export.");
  }

  const data = raw as Record<string, unknown>;
  if (data.app !== "huddle") {
    throw new ImportError("Not a Huddle export.");
  }

  if (typeof data.schemaVersion !== "number" || data.schemaVersion > SCHEMA_VERSION) {
    throw new ImportError("This export is from a newer version of Huddle.");
  }

  if (!Array.isArray(data.cards)) {
    throw new ImportError("The export has no cards list.");
  }

  if (data.cards.length > MAX_IMPORT_CARDS) {
    throw new ImportError("Too many cards.");
  }

  // read data into card
  const cards: ExportedCard[] = data.cards.map((item: unknown) => {
    const card = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;

    return {
      title: typeof card.title === "string" ? card.title : "",
      description: typeof card.description === "string" ? card.description : "",
      status:
        typeof card.status === "string" && DEFAULT_COLUMNS.some((c) => c.id === card.status)
          ? card.status
          : DEFAULT_COLUMNS[0].id,
      priority: isPriority(card.priority) ? card.priority : "none",
      order: typeof card.order === "string" ? card.order : "",
    };
  });

  return {
    app: "huddle",
    schemaVersion: data.schemaVersion,
    title: typeof data.title === "string" && data.title.trim() ? data.title : "Imported project",
    exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : "",
    cards,
  };
}

/**
 * Fill a NEW doc from an export. Cards get new ids, and order keys are rebuilt
 * from the file's card sequence instead of trusted, because a malformed key
 * would make generateKeyBetween throw later.
 */
export function applyImport(doc: Y.Doc, data: ExportedProject, by: Author): void {
  doc.transact(() => {
    initProject(doc, data.title);

    for (const card of data.cards) {
      const id = createCard(
        doc,
        {
          status: card.status,
          priority: card.priority,
          title: card.title,
        },
        by,
        "imported",
      );
      if (card.description) {
        getDescription(doc, id)?.insert(0, card.description);
      }
    }
  });
}
