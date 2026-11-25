"use client";

import Link from "next/link";
import { Download, Home, Menu, Monitor, Moon, SlidersHorizontal, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecentProjects } from "@/hooks/use-recent-projects";
import { usePreferences } from "@/hooks/use-preferences";
import { setPreference } from "@/lib/preferences";
import { changeTheme, type ThemeChoice } from "@/lib/theme";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * The board's ☰ menu (Excalidraw-style): navigation and file actions on top,
 * a Preferences submenu that opens to the right, and the theme inline at the bottom.
 */
export function BoardMenu({
  currentId,
  onImport,
  onExport,
}: {
  currentId: string;
  onImport: () => void;
  onExport: () => void;
}) {
  const { recent } = useRecentProjects();
  const others = recent.filter((p) => p.id !== currentId);
  const prefs = usePreferences();
  const { theme, systemTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button data-hover-item variant="ghost" size="icon-sm" aria-label="Menu" />}
      >
        <Menu className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-60">
        <DropdownMenuItem render={<Link href="/projects" />}>
          <Home className="size-4" aria-hidden="true" /> All projects
        </DropdownMenuItem>

        {others.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Recent</DropdownMenuLabel>
            {others.map((p) => (
              <DropdownMenuItem key={p.id} render={<Link href={`/projects/${p.id}`} />}>
                <span className="truncate">{p.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onImport}>
          <Upload className="size-4" aria-hidden="true" /> Import
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>
          <Download className="size-4" aria-hidden="true" /> Export
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* opens to the right, like Excalidraw's Preferences */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SlidersHorizontal className="size-4" aria-hidden="true" /> Preferences
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <DropdownMenuCheckboxItem
              checked={prefs.dotBackground}
              onCheckedChange={(v) => setPreference("dotBackground", v)}
            >
              Dot background
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={prefs.compactCards}
              onCheckedChange={(v) => setPreference("compactCards", v)}
            >
              Compact cards
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* theme inline: still real menu radio items, laid out as a segmented row */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(v) => changeTheme(v as ThemeChoice, setTheme, systemTheme)}
            className="mx-1 mb-1 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1"
          >
            {THEMES.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                aria-label={label}
                closeOnClick={false}
                className="justify-center rounded-md px-0 py-1.5 data-checked:bg-background data-checked:text-primary data-checked:shadow-xs"
              >
                <Icon className="size-4" aria-hidden="true" />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
