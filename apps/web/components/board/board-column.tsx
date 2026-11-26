"use client";

import { useId } from "react";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { STATUS_LABELS, type Card, type Status } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui/typography";
import { SortableCard } from "@/components/board/sortable-card";
import { AddCard } from "@/components/board/add-card";
import { pointerIntersection } from "@dnd-kit/collision";

export function BoardColumn({
  status,
  cards,
  canEdit,
  highlighted,
  onOpenCard,
  adding,
  onAddingChange,
}: {
  status: Status;
  cards: Card[];
  canEdit: boolean;
  highlighted: boolean;
  onOpenCard: (id: string) => void;
  adding: boolean;
  onAddingChange: (open: boolean) => void;
}) {
  const headingId = useId();

  // the whole column is a drop target, so empty columns accept cards too.
  // Low priority: when the pointer is over a card, the card wins.
  const { ref } = useDroppable({
    id: status,
    type: "column",
    accept: "item",
    collisionPriority: CollisionPriority.Low,
    collisionDetector: pointerIntersection, // only when the pointer is inside the column
    disabled: !canEdit,
  });
  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      className={cn(
        "relative flex max-h-full flex-col rounded-xl p-2 transition-colors",
        // mobile: one column per screen, with a peek of the next
        "w-[85vw] shrink-0 snap-start",
        // tablet and up: your current fluid columns
        "md:w-auto md:min-w-64 md:max-w-md md:flex-1 md:basis-0 md:shrink",
        highlighted && "bg-accent/60",
      )}
    >
      <header className="flex items-baseline gap-2 px-2 pt-1 pb-2">
        <Heading as="h2" id={headingId} className="text-sm">
          {STATUS_LABELS[status]}
        </Heading>
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          {cards.length}
        </span>
        <span className="sr-only">{cards.length} cards</span>
      </header>

      <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2 [scrollbar-gutter:stable] in-data-compact:gap-1">
        {cards.map((card, index) => (
          <SortableCard
            key={card.id}
            card={card}
            index={index}
            column={status}
            disabled={!canEdit}
            isLast={index === cards.length - 1}
            onOpen={onOpenCard}
          />
        ))}

        {cards.length === 0 && (
          <li className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            No cards yet
          </li>
        )}
      </ul>

      <AddCard status={status} open={adding} onOpenChange={onAddingChange} />
    </section>
  );
}
