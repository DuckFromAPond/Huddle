import * as Y from "yjs";
import { getCards } from "@/lib/doc/cards";

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

/** Everything a user could see, as plain data, for comparing two peers. */
export function snapshot(doc: Y.Doc) {
  return getCards(doc);
}