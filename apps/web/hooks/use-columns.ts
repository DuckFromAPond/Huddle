import { useCallback, useSyncExternalStore } from "react";
import { useProject } from "@/context/proj-context";
import { getColumns, type Column } from "@/lib/doc/columns";

/** The project's columns, live. Reads the doc from context, so callers need nothing. */
export function useColumns(): Column[] {
  const { doc } = useProject();
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
