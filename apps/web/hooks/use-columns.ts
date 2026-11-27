"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getColumns, type Column } from "@/lib/doc/columns";
import * as Y from "yjs";

/** The project's columns, live. Reads the doc from context, so callers need nothing. */
export function useColumns(doc: Y.Doc): Column[] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const map = doc.getMap("columns");
      map.observeDeep(onChange);
      return () => map.unobserveDeep(onChange);
    },
    [doc],
  );
  const snapshot = () => getColumns(doc);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
