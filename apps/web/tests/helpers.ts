import * as Y from "yjs";
import { getCards } from "@/lib/doc/cards";

import type { Author } from "@/lib/schema";

export const ada: Author = { id: "V1StGXR8_Z5jdHi6B-myT", name: "Ada", color: "#82aae2" };
export const kim: Author = { id: "W1StGXR7_Z5jdHi6A-mpT", name: "Kim", color: "#5dcaa5" };

/** Standard exchange: each side sends what the other is missing. */
export function sync(a: Y.Doc, b: Y.Doc): void {
  // encode each state for syncing both doc
  const forB = Y.encodeStateAsUpdate(a, Y.encodeStateVector(b));
  const forA = Y.encodeStateAsUpdate(b, Y.encodeStateVector(a));

  Y.applyUpdate(b, forB);
  Y.applyUpdate(a, forA);
}

/** A new doc that shares history with `doc`, like a user who joined and synced. */
export function fork(doc: Y.Doc): Y.Doc {
  const copy = new Y.Doc();
  Y.applyUpdate(copy, Y.encodeStateAsUpdate(doc));
  return copy;
}

/** Everything a user could see, as plain data, for comparing two user. (pretty much just get get cards from given doc) */
export function snapshot(doc: Y.Doc) {
  return getCards(doc);
}
