import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Hover/focus label for a dock button, with an optional keyboard shortcut. */
export function DockTip({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: React.ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="top" sideOffset={8} className="flex items-center gap-2">
        {label}
        {shortcut && (
          <kbd className="rounded border px-1 text-xs text-muted-foreground">{shortcut}</kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
