import { ArrowUp, ChevronsUp } from "lucide-react";
import { PRIORITY_LABELS } from "@/lib/schema";
import type { Card } from "@/lib/schema";
import { cn } from "@/lib/utils";

// only priorities worth noticing appear on the card face
const SHOWN_PRIORITY = {
  high: { label: "High", icon: ArrowUp, className: "text-foreground" },
  urgent: { label: "Urgent", icon: ChevronsUp, className: "text-destructive" },
} as const;

/** The compact card in a column. */
export function CardItem({ card }: { card: Card }) {
  const priority =
    card.priority in SHOWN_PRIORITY
      ? SHOWN_PRIORITY[card.priority as keyof typeof SHOWN_PRIORITY]
      : null;

  return (
    <article className="grid gap-2 rounded-lg bg-card p-3 shadow-xs transition-[box-shadow] duration-150 ease-out hover:shadow-md motion-reduce:transition-none dark:ring-1 dark:ring-white/5">
      <h3
        className={cn(
          "line-clamp-3 text-sm break-words",
          card.status === "done" && "text-foreground/75",
        )}
      >
        {card.title || "Untitled"}
      </h3>
      {priority && card.status !== "done" && (
        // icon + word, so the priority isn't shown by color alone
        <p className={cn("flex items-center gap-1 text-xs font-medium", priority.className)}>
          <priority.icon className="size-3.5" aria-hidden="true" />
          {PRIORITY_LABELS[card.priority]}
        </p>
      )}
    </article>
  );
}
