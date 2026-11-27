import type * as Y from "yjs";
import { DEFAULT_COLUMNS, type ColumnId } from "@/lib/schema";

export interface Column {
  id: ColumnId;
  name: string;
}

// destructure into an array
const DEFAULTS: Column[] = [...DEFAULT_COLUMNS];

export function getColumns(_doc: Y.Doc): Column[] {
  return DEFAULTS; // same array every call, so it's safe as a useSyncExternalStore snapshot
}
export function isColumn(doc: Y.Doc, id: unknown): id is ColumnId {
  return typeof id === "string" && getColumns(doc).some((c) => c.id === id);
}
export function columnName(doc: Y.Doc, id: ColumnId): string {
  return getColumns(doc).find((c) => c.id === id)?.name ?? "Deleted column";
}
