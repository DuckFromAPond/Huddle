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
}: {
  status: Status;
  cards: Card[];
  canEdit: boolean;
  highlighted: boolean;
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
        "flex max-h-full min-w-64 max-w-md flex-1 basis-0 flex-col rounded-xl p-2 transition-colors",
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

      <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2 [scrollbar-gutter:stable]">
        {cards.map((card, index) => (
          <SortableCard
            key={card.id}
            card={card}
            index={index}
            column={status}
            disabled={!canEdit}
          />
        ))}

        {cards.length === 0 && (
          <li className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            No cards yet
          </li>
        )}
      </ul>

      <AddCard status={status} />
    </section>
  );
}
