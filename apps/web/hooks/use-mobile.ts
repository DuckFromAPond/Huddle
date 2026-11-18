import * as React from "react";

// Must match Tailwind's 'md' breakpoint (48rem)
const MOBILE_BREAKPOINT_REM = 48;
const QUERY = `(width < ${MOBILE_BREAKPOINT_REM}rem)`;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
