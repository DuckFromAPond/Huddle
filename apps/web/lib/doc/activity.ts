import * as Y from "yjs";
import type { Status, Priority } from "@/lib/doc/cards";

export type Author = { name: string; color: string };

type Base = { by: Author & { clientId: number }; at: number };

// all possible case a card could appear in the activity log as
export type CardEvent =
  | (Base & { type: "created" })
  | (Base & { type: "status"; from: Status; to: Status })
  | (Base & { type: "priority"; from: Priority; to: Priority })
  | (Base & { type: "renamed"; from: string; to: string })
  | (Base & { type: "comment"; text: string })
  | (Base & { type: "imported" });

// split card to only have its type, from, to
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type NewCardEvent = DistributiveOmit<CardEvent, "by" | "at">;

const MAX_ACTIVITY = 100; // comments don't count toward this cap

function trimActivity(log: Y.Array<CardEvent>) {
  const events = log.toArray();
  let excess = events.filter((e) => e.type !== "comment").length - MAX_ACTIVITY;
  if (excess <= 0) return;

  // find the oldest non-comment entries, oldest first
  const toDelete: number[] = [];
  for (let i = 0; i < events.length && excess > 0; i++) {
    if (events[i]?.type !== "comment") {
      toDelete.push(i);
      excess--;
    }
  }

  // delete from the end, so the earlier indexes are still correct
  for (const i of toDelete.reverse()) log.delete(i, 1);
}

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

  log.push([
    { ...event, by: { ...by, clientId: card.doc.clientID }, at: Date.now() } satisfies CardEvent,
  ]);

  trimActivity(log);
}

/** Newest first, from a log already held as Y.array and returns it */
export function activityFromLog(log: Y.Array<CardEvent>): CardEvent[] {
  return log.toArray().reverse();
}

/** Newest first, from card's Y.Map to return logs*/
export function getActivity(card: Y.Map<unknown>): CardEvent[] {
  const log = card.get("activity") as Y.Array<CardEvent> | undefined;
  return log ? activityFromLog(log) : [];
}
