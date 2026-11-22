"use client";

import { useCallback, useSyncExternalStore } from "react";
import type * as Y from "yjs";
import { activityFromLog, type CardEvent } from "@/lib/doc/activity";

const EMPTY: CardEvent[] = [];
// one newest-first copy per log, rebuilt only after the log changes
// using weakmap for caching
const cache = new WeakMap<Y.Array<CardEvent>, CardEvent[]>();

export function useCardActivity(card?: Y.Map<unknown>): CardEvent[] {
  const log = card?.get("activity") as Y.Array<CardEvent> | undefined;

  // reacts on change
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!log) {
        return () => {};
      }

      // handler deletes the cache on change
      const handler = () => {
        cache.delete(log);
        onChange();
      };

      // call handler when log is changed
      log.observe(handler);

      // clean up
      return () => log.unobserve(handler);
    },
    [log],
  );

  // runs after subscribe clears cache
  const getSnapshot = useCallback(() => {
    if (!log) {
      return EMPTY;
    }

    // get log in cache, if not cached then set cache
    let events = cache.get(log);
    if (!events) {
      events = activityFromLog(log);
      cache.set(log, events);
    }

    return events;
  }, [log]);

  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
