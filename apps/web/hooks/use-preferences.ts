"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getPreferencesSnapshot,
  parsePreferences,
  subscribePreferences,
  type Preferences,
} from "@/lib/preferences";

/** Board preferences, live. Defaults on the server and the first paint. */
export function usePreferences(): Preferences {
  const raw = useSyncExternalStore(subscribePreferences, getPreferencesSnapshot, () => null);
  return useMemo(() => parsePreferences(raw), [raw]);
}
