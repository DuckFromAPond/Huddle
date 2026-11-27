"use client";

import type { Card, ColumnId } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { CardItem } from "@/components/board/card-item";
import { pointerIntersection } from "@dnd-kit/collision";
import { useEffect, useRef } from "react";
import { useDragDropMonitor } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { CardMenu } from "@/components/board/card-menu";

const MAX_TILT = 8; // degrees
const TILT_PER_SPEED = 5; // degrees per (px/ms);

/**
 * A draggable card.
 * - dnd-kit's sortable element, moved by dnd-kit while dragging
 * - inner motion: lifts (scale) while held, and leans into sideways movement
 */
export function SortableCard({
  card,
  index,
  column,
  disabled,
  columnName,
  isLast,
  onOpen,
}: {
  card: Card;
  index: number;
  column: ColumnId;
  disabled: boolean;
  columnName: string;
  isLast: boolean;
  onOpen: (id: string) => void;
}) {
  // set ref for what can move, and handleRef for where to grab
  const { ref, handleRef, isDragging } = useSortable({
    id: card.id,
    index,
    group: column,
    type: "item",
    accept: "item",
    data: { title: card.title || "Untitled", columnName },
    collisionDetector: pointerIntersection,
    disabled,
  });

  const reduceMotion = useReducedMotion();
  const swingTarget = useMotionValue(0);
  const swing = useSpring(swingTarget, { stiffness: 260, damping: 18, mass: 0.6 });

  const last = useRef<{ x: number; t: number } | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // dnd-kit stops pointer events from reaching window during a drag,
  // so read the movement from dnd-kit itself
  // this movement helps in creating swing motion when moved
  useDragDropMonitor({
    onDragMove(event) {
      if (reduceMotion || event.operation.source?.id !== card.id) return; // only the held card

      const x = event.operation.position.current.x;
      const t = performance.now();
      const prev = last.current;

      if (prev && t > prev.t) {
        const speed = (x - prev.x) / (t - prev.t); // px per ms
        swingTarget.set(Math.max(-MAX_TILT, Math.min(MAX_TILT, speed * TILT_PER_SPEED)));
      }

      last.current = { x, t };
      clearTimeout(settle.current);
      settle.current = setTimeout(() => swingTarget.set(0), 80); // stopped moving: ease back
    },
  });

  // for guarding a drag's release firing a click
  const dragged = useRef(false);
  useEffect(() => {
    if (isDragging) dragged.current = true;
  }, [isDragging]);

  // when the drag ends (or the card unmounts), land flat instantly
  useEffect(() => {
    if (isDragging) return;
    clearTimeout(settle.current);
    last.current = null;
    swingTarget.set(0);
    swing.jump(0);
  }, [isDragging, swingTarget, swing]);

  useEffect(() => () => clearTimeout(settle.current), []);

  return (
    <li ref={ref} className="group relative">
      <div
        ref={handleRef}
        data-card-id={card.id}
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
        )}

        // opening detail
        onPointerDown={() => {
          dragged.current = false; // a new press starts clean
        }}
        onClick={() => {
          if (dragged.current) return; // this click is the end of a drag, not a request to open
          onOpen(card.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onOpen(card.id);
          }
        }}
      >
        <motion.div
          style={{ rotate: swing }} // tilt: only from movement
          animate={{ scale: isDragging ? 1.03 : 1 }} // lift: only scale, so nothing fights over rotate
          transition={{ type: "spring", bounce: 0.3, duration: 0.25 }}
          className={cn("rounded-lg transition-shadow", isDragging && "shadow-lg")}
        >
          <CardItem card={card} />
        </motion.div>
      </div>
      {/* sibling, not child: the draggable stays a single control; hidden mid-drag because
          dnd-kit moves the card div but not this button */}
      {!isDragging && <CardMenu card={card} isFirst={index === 0} isLast={isLast} />}
    </li>
  );
}
