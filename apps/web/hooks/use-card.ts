"use client";

import { useMemo, useSyncExternalStore } from "react";
import type * as Y from "yjs";
import { cardsMap, getCards } from "@/lib/doc/cards";
import type { Card } from "@/lib/schema";

/**
 * Every card in display order, live: local edits and (later) remote ones.
 * The doc stays the only source of truth; this is a cached, read-only snapshot of it.
 */
export function useCards(doc: Y.Doc): Card[] {
  // one small store per doc: subscribe to the doc, rebuild the snapshot only after a change
  const store = useMemo(() => {
    let snapshot: Card[] = getCards(doc);
    let dirty = false;

    return {
      subscribe(onChange: () => void) {
        const map = cardsMap(doc);
        const handler = () => {
          dirty = true; // rebuild lazily, on the next read
          onChange();
        };
        // anything could have changed between the first render and now (e.g. a remote update):
        // mark dirty so React's post-subscribe check re-reads once
        dirty = true;
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
  }, [doc]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
