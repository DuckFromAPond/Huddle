"use client";

import { useCallback, useSyncExternalStore } from "react";
import type * as Y from "yjs";

/** The live string value of a Y.Text (local and remote edits). "" when there's no text. */
export function useYText(text: Y.Text | undefined): string {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!text) return () => {};
      text.observe(onChange);
      return () => text.unobserve(onChange);
    },
    [text],
  );
  // strings compare by value, so no cache is needed
  const read = () => text?.toString() ?? "";
  return useSyncExternalStore(subscribe, read, read);
}
