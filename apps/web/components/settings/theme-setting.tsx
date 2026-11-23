"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { changeTheme, type ThemeChoice as Choice } from "@/lib/theme";

const OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const satisfies readonly { value: Choice; label: string; icon: unknown }[];

/** Three-state theme picker for the Settings page (more detailed than theme-toggle). "System" shows what the OS is using now. */
export function ThemeChoice() {
  const { theme, systemTheme, setTheme } = useTheme(); // theme is undefined until mounted

  return (
    <fieldset>
      <legend className="sr-only">Theme</legend>
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const selected = theme === value;
          return (
            <label
              key={value}
              className="relative grid cursor-pointer justify-items-center gap-2 rounded-xl border-2 border-border bg-card p-3 text-sm transition-colors has-checked:border-primary has-focus-visible:ring-2 has-focus-visible:ring-ring motion-reduce:transition-none"
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={selected}
                onChange={() => changeTheme(value, setTheme, systemTheme)}
                className="sr-only"
              />
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-center">
                {label}
                {value === "system" && systemTheme && (
                  <span className="block text-xs text-muted-foreground">
                    Currently {systemTheme}
                  </span>
                )}
              </span>
              {/* non-color selection cue, since the radio itself is hidden */}
              <Check
                aria-hidden="true"
                className={cn(
                  "absolute top-2 right-2 size-4 text-primary",
                  !selected && "invisible",
                )}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
