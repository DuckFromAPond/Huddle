export type Author = { id: string; name: string; color: string };

export const STATUSES = ["todo", "in-progress", "done"] as const;
export const PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;
export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
export function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status);
}
export function isPriority(value: unknown): value is Priority {
  return PRIORITIES.includes(value as Priority);
}

export const STATUS_LABELS: Record<Status, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

/**  expected shape of the card but not how it is stored in reality;
 * card does not have id in its maps, but the parent's map uses the id to get the card */
export interface Card {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  order: string;
}

export const SCHEMA_VERSION = 1;
export const MAX_IMPORT_CARDS = 5000;
