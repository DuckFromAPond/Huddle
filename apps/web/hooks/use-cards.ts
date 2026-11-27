"use client";

import { useSyncExternalStore } from "react";
import type * as Y from "yjs";
import { cardsMap, getCards } from "@/lib/doc/cards";
import type { Card } from "@/lib/schema";

/** A tiny external store over one doc's cards: rebuilds the snapshot only after a change. */
function createCardsStore(doc: Y.Doc) {
  let snapshot: Card[] = getCards(doc);
  let dirty = false;

  return {
    subscribe(onChange: () => void) {
      const map = cardsMap(doc);

      const handler = () => {
        dirty = true; // rebuild lazily, on the next read
        onChange();
      };

      dirty = true; // anything may have changed since render: make React's post-subscribe check re-read
      map.observeDeep(handler);
      return () => map.unobserveDeep(handler);
    },

    getSnapshot() {
      if (dirty) {
        snapshot = getCards(doc);
        dirty = false;
      }
      return snapshot; // same array until something changes, as useSyncExternalStore requires
    },
  };
}

// one store per doc, shared by every component that reads it; dropped with the doc
const stores = new WeakMap<Y.Doc, ReturnType<typeof createCardsStore>>();

/**
 * Every card in display order, live: local edits and remote ones.
 * The doc stays the only source of truth; this is a cached, read-only snapshot of it.
 */
export function useCards(doc: Y.Doc): Card[] {
  let store = stores.get(doc);
  if (!store) {
    store = createCardsStore(doc);
    stores.set(doc, store);
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
