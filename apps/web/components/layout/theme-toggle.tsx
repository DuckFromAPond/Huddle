"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, systemTheme, setTheme } = useTheme();

  function toggle() {
    const target = resolvedTheme === "dark" ? "light" : "dark"; // opposite of what's on screen
    const next = target === systemTheme ? "system" : target; // matches the OS → follow the OS

    const apply = () => {
      // update the page right now, so the browser can capture the "after" picture
      const root = document.documentElement;
      root.classList.toggle("dark", target === "dark");
      root.style.colorScheme = target;
      setTheme(next); // next-themes saves the choice and keeps its own state in sync
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) apply();
    else document.startViewTransition(apply);
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle}>
      <Sun className="size-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-4 dark:block" aria-hidden="true" />
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
    </Button>
  );
}
