"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { motion } from "motion/react";
import type { Card, Status } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { CardItem } from "@/components/board/card-item";
import { pointerIntersection } from "@dnd-kit/collision";

/**
 * A draggable card. Three layers, three jobs:
 * - motion <li>: cards appearing / disappearing, and sliding when the order
 *   changes from outside a drag (e.g. another person, later)
 * - <div ref>: dnd-kit's sortable element, moved by dnd-kit while dragging
 * - inner motion <div>: the "lift" (slight scale + tilt) while this card is held
 */
export function SortableCard({
  card,
  index,
  column,
  disabled,
}: {
  card: Card;
  index: number;
  column: Status;
  disabled: boolean;
}) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: column,
    type: "item",
    accept: "item",
    collisionDetector: pointerIntersection,
    disabled,
  });

  return (
    <li className="animate-in fade-in slide-in-from-bottom-1 duration-150 motion-reduce:animate-none">
      <div
        ref={ref}
        aria-label={[
          card.title || "Untitled",
          card.priority === "none" ? null : `${card.priority} priority`,
          "card",
        ]
          .filter(Boolean)
          .join(", ")}
        className={cn(
          "relative touch-manipulation rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !disabled && "cursor-grab active:cursor-grabbing",
          isDragging && "z-10",
        )}
      >
        <motion.div
          animate={isDragging ? { scale: 1.03, rotate: -1.5 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.25 }}
          className={cn("rounded-lg transition-shadow", isDragging && "shadow-lg")}
        >
          <CardItem card={card} />
        </motion.div>
      </div>
    </li>
  );
}
