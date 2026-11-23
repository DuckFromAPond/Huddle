"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Muted } from "@/components/ui/typography";
import { IdentityForm } from "@/components/layout/identity-form";
import { ThemeChoice } from "@/components/settings/theme-setting";
import { useIdentity } from "@/hooks/use-identity";

/** The settings sections. Rendered inside the settings dialog. */
export function SettingsContent() {
  const identity = useIdentity(); // null on the first paint

  return (
    <div className="grid gap-6">
      <section aria-labelledby="settings-profile" className="grid gap-3">
        <div className="grid gap-1">
          <Heading as="h3" id="settings-profile">
            Profile
          </Heading>
          <Muted>
            How you appear to people you share boards with, and on your changes in card history.
          </Muted>
        </div>
        {identity ? <IdentityForm identity={identity} /> : <Skeleton className="h-36 w-full" />}
      </section>

      <section aria-labelledby="settings-appearance" className="grid gap-3">
        <div className="grid gap-1">
          <Heading as="h3" id="settings-appearance">
            Appearance
          </Heading>
          <Muted>Follow your system, or pick a theme for Huddle only.</Muted>
        </div>
        <ThemeChoice />
      </section>
    </div>
  );
}
