"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { changeTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { resolvedTheme, systemTheme, setTheme } = useTheme();

  function toggle() {
    const target = resolvedTheme === "dark" ? "light" : "dark"; // opposite of what's on screen
    changeTheme(target === systemTheme ? "system" : target, setTheme, systemTheme); // matches the OS → follow the OS
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
