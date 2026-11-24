export type ThemeChoice = "light" | "dark" | "system";

/**
 * Switch theme with a gentle page cross-fade, shared by the
 * topbar toggle and the Settings page. Falls back to an instant switch when the
 * API is missing or the user prefers reduced motion.
 */
export function changeTheme(
  next: ThemeChoice,
  setTheme: (theme: string) => void,
  systemTheme: string | undefined,
) {
  const resolved = next === "system" ? (systemTheme === "dark" ? "dark" : "light") : next;
  const root = document.documentElement;

  const apply = () => {
    // update the page now so the browser captures the "after" picture;
    // next-themes then saves the choice and agrees with what's on screen
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    setTheme(next);
  };

  const looksSame = root.classList.contains("dark") === (resolved === "dark");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // instantly apply changes if condtitions met
  if (looksSame || reduceMotion || !document.startViewTransition) {
    apply();
  } else {
    // takes a snapshot of the page, runs apply(), takes a second snapshot, and smoothly cross-fades between the two
    document.startViewTransition(apply);
  }
}
