import * as Y from "yjs";
import type { Status } from "@/lib/doc/cards";

export type Author = { name: string; color: string };

type Base = { by: Author & { clientId: number }; at: number };

// all possible case a card could appear in the activity log as
export type CardEvent =
  | (Base & { type: "created" })
  | (Base & { type: "status"; from: Status; to: Status })
  | (Base & { type: "priority"; from: string; to: string })
  | (Base & { type: "renamed"; from: string; to: string })
  | (Base & { type: "comment"; text: string })
  | (Base & { type: "imported" });

//
export type NewCardEvent = CardEvent extends infer E
  ? E extends CardEvent
    ? Omit<E, "by" | "at">
    : never
  : never;

const MAX_EVENTS = 100;

// Create the array when the card is created, never lazily:
// two clients lazily doing card.set("activity", new Y.Array()) would
// overwrite each other and lose events.
export function newActivityLog() {
  return new Y.Array<CardEvent>();
}

// Call inside the same doc.transact() as the change it describes.
// The card must already be added to the doc.
export function logEvent(card: Y.Map<unknown>, by: Author, event: NewCardEvent) {
  const log = card.get("activity") as Y.Array<CardEvent> | undefined;
  if (!log || !card.doc) return;
  log.push([{ ...event, by: { ...by, clientId: card.doc.clientID }, at: Date.now() } as CardEvent]);
  if (log.length > MAX_EVENTS) log.delete(0, log.length - MAX_EVENTS);
}

// Newest first. Clocks can be wrong; fine for a feed.
export function getActivity(card: Y.Map<unknown>): CardEvent[] {
  const log = card.get("activity") as Y.Array<CardEvent> | undefined;
  return log ? [...log.toArray()].sort((a, b) => b.at - a.at) : [];
}
