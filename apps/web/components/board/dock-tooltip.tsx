import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Hover/focus label for a dock button, with an optional keyboard shortcut. */
export function DockTip({
  label,
  shortcut,
  disabled,
  children,
}: {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  children: React.ReactElement;
}) {
  return (
    <Tooltip disabled={disabled}>
      <TooltipTrigger render={children} />
      <TooltipContent side="top" sideOffset={8} className="flex items-center gap-2">
        {label}
        {shortcut && (
          <kbd
            data-slot="kbd"
            className="rounded-sm bg-background/20 px-1.5 font-mono text-[10px] text-background"
          >
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
