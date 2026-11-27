"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getIndexSnapshot,
  parseIndex,
  subscribeIndex,
  type ProjectSummary,
} from "@/lib/storage/project-index";

/** watches project list to re-render on change */
export function useProjectList(): ProjectSummary[] | null {
  // read local storage and re-render when listener detect changes
  const raw = useSyncExternalStore(subscribeIndex, getIndexSnapshot, () => null);
  // returns parsed list of proj
  return useMemo(
    () => (raw === null ? null : parseIndex(raw).sort((a, b) => b.updatedAt - a.updatedAt)),
    [raw],
  );
}
