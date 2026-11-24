"use client";
import { useCallback, useSyncExternalStore } from "react";
import type * as Y from "yjs";
import { getProjectTitle } from "@/lib/doc/project";

export function useProjectTitle(doc: Y.Doc): string {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const meta = doc.getMap("meta");
      meta.observe(onChange);
      return () => meta.unobserve(onChange);
    },

    [doc],
  );

  // a string snapshot compares by value, so no cache is needed
  const read = () => getProjectTitle(doc) ?? "Untitled";
  return useSyncExternalStore(subscribe, read, read);
}
