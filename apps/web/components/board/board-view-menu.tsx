"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePreferences } from "@/hooks/use-preferences";
import { setPreference } from "@/lib/preferences";
import { DockTip } from "@/components/board/dock-tooltip";

/** Board preferences/view toggles. Ticking keeps the menu open. */
export function BoardViewMenu() {
  const prefs = usePreferences();

  return (
    <DropdownMenu>
      <DockTip label="Preferences">
        <DropdownMenuTrigger
          render={
            <Button
              data-hover-item
              variant="ghost"
              size="icon-sm"
              aria-label="Preferences"
              className="hover:bg-transparent dark:hover:bg-transparent"
            />
          }
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        </DropdownMenuTrigger>
      </DockTip>

      <DropdownMenuContent side="top" align="start" sideOffset={10} className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={prefs.dotBackground}
            onCheckedChange={(v) => setPreference("dotBackground", v)}
            className={"cursor-pointer"}
          >
            Dot background
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={prefs.compactCards}
            onCheckedChange={(v) => setPreference("compactCards", v)}
            className={"cursor-pointer"}
          >
            Compact cards
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
