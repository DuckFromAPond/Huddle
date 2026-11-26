"use client";

import { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsContent } from "@/components/settings/settings-content";

const OpenSettingsContext = createContext<(() => void) | null>(null);

/** Mount once near the root. Any component can then open Settings with useOpenSettings(). */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <OpenSettingsContext.Provider value={() => setOpen(true)}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] gap-4 overflow-y-auto p-8 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Your name, color and theme, saved on this device.</DialogDescription>
          </DialogHeader>
          <SettingsContent />
        </DialogContent>
      </Dialog>
    </OpenSettingsContext.Provider>
  );
}

export function useOpenSettings(): () => void {
  const open = useContext(OpenSettingsContext);
  if (!open) {
    throw new Error("useOpenSettings() must be used inside <SettingsProvider>.");
  }
  return open;
}
