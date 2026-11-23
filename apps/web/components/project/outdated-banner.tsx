"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";

export function OutdatedBanner() {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-[14px] border bg-muted px-4 py-3"
    >
      <Text className="text-sm">
        This project was updated by a newer version of Huddle. You can view it, but editing is off
        until you reload.
      </Text>
      <Button size="sm" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}
