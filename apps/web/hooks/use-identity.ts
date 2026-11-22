"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { Author } from "@/lib/doc/activity";
import { getIdentity, getIdentitySnapshot, parseIdentity, subscribeIdentity } from "@/lib/identity";

/** The local user's name and color, live. null on the server and on the very first paint. */
export function useIdentity(): Author | null {
  const raw = useSyncExternalStore(subscribeIdentity, getIdentitySnapshot, () => null);
  const identity = useMemo(() => parseIdentity(raw), [raw]);

  // first visit: create the guest identity. setIdentity fires the change event,
  // so the store re-renders us; no setState here.
  useEffect(() => {
    if (raw === null) {
      getIdentity();
    }
  }, [raw]);

  return identity;
}
