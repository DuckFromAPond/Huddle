import * as Y from "yjs";
import { createCard, getCards, getDescription } from "@/lib/doc/cards";
import {
  isStatus,
  isPriority,
  Status,
  Priority,
  Author,
  SCHEMA_VERSION,
  MAX_IMPORT_CARDS,
} from "@/lib/schema";

export const MAX_TITLE_LENGTH = 80;

// meta map has the title and version
function metaMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap<unknown>("meta");
}

/**
 * A project that exists has meta(data). A doc with no meta is empty: either a user joining
 * who has not received the first sync yet, or an id that was never created here.
 */
export function isInitialized(doc: Y.Doc): boolean {
  return typeof metaMap(doc).get("schemaVersion") === "number";
}

/** An older doc opened by this newer app: raise its version so older apps stop editing it. */
export function upgradeSchema(doc: Y.Doc): void {
  const v = metaMap(doc).get("schemaVersion");
  if (typeof v === "number" && v < SCHEMA_VERSION) {
    metaMap(doc).set("schemaVersion", SCHEMA_VERSION);
  }
}

/** True when a newer Huddle has touched this doc. This app must not edit it: it would misread new values. */
export function isNewerThanApp(doc: Y.Doc): boolean {
  const v = metaMap(doc).get("schemaVersion");
  return typeof v === "number" && v > SCHEMA_VERSION;
}
/** Only for brand-new projects. Joiners must never call this */
export function initProject(doc: Y.Doc, title: string): void {
  doc.transact(() => {
    const meta = metaMap(doc);
    meta.set("title", title);
    meta.set("schemaVersion", SCHEMA_VERSION);
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
  status: Status;
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
      status: isStatus(card.status) ? card.status : "todo",
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
