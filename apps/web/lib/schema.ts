export type Author = { id: string; name: string; color: string };

export const PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const MAX_TITLE_LENGTH = 80;

/** A card's status: the id of the column it's in. */
export type ColumnId = string;

/** The columns every project starts with. Cards store these ids, so never change them. */
export const DEFAULT_COLUMNS = [
  { id: "todo", name: "To do" },
  { id: "in-progress", name: "In progress" },
  { id: "done", name: "Done" },
] as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function isPriority(value: unknown): value is Priority {
  return PRIORITIES.includes(value as Priority);
}

/**  expected shape of the card but not how it is stored in reality;
 * card does not have id in its maps, but the parent's map uses the id to get the card */
export interface Card {
  id: string;
  title: string;
  description: string;
  status: ColumnId;
  priority: Priority;
  order: string;
}

export const SCHEMA_VERSION = 1;
export const MAX_IMPORT_CARDS = 5000;
