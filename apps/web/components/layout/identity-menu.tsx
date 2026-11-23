"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IdentityForm } from "@/components/layout/identity-form";
import { Muted } from "@/components/ui/typography";
import { useIdentity } from "@/hooks/use-identity";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { safeColor } from "@/lib/identity";
import { useState } from "react";
import { useOpenSettings } from "@/components/settings/settings-dialog";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (
    ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() ||
    "?"
  );
}

/** Your avatar in the topbar: opens a small panel to change the name and color others see. */
export function IdentityMenu() {
  const identity = useIdentity();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const openSettings = useOpenSettings();

  // same size placeholder while loading, so the topbar doesn't shift
  if (!identity) {
    return <span className="size-7" aria-hidden="true" />;
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`You appear as ${identity.name}. Change name and color`}
            className="grid size-7 cursor-pointer place-items-center rounded-full text-xs font-medium text-white ring-2 ring-background transition-transform active:scale-95 motion-reduce:transition-none"
            style={{ backgroundColor: safeColor(identity.color) }}
          />
        }
      >
        {initials(identity.name)}
      </PopoverTrigger>

      <PopoverContent align="end" className="grid w-64 gap-4">
        {/* Enter submits, and browsers already skip it while an IME is composing */}
        <IdentityForm identity={identity} />

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm">Theme</span>
          <ThemeToggle />
        </div>
        <Muted>Shown to people you share boards with, and on your changes in card history.</Muted>

        <button
          type="button"
          className="justify-self-start text-sm text-primary hover:underline"
          onClick={() => {
            setPopoverOpen(false);
            openSettings();
          }}
        >
          All settings
        </button>
      </PopoverContent>
    </Popover>
  );
}
