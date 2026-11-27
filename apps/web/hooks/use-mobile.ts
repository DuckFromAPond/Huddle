"use client";

import * as React from "react";

// must match Tailwind's 'md' breakpoint (48rem)
const MOBILE_BREAKPOINT_REM = 48;
export const MOBILE_QUERY = `(width < ${MOBILE_BREAKPOINT_REM}rem)`;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
