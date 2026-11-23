// components/layout/hover-group.tsx
"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Rect = { x: number; y: number; width: number; height: number };

/** One shared hover background for every child marked with `data-hover-item`. */
export function HoverGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(false); // slide only when moving between items

  function moveTo(target: EventTarget) {
    const item = (target as HTMLElement).closest<HTMLElement>("[data-hover-item]");
    const group = ref.current;
    if (!item || !group || !group.contains(item)) return;

    if (item.getAttribute("aria-current") === "page") {
      setVisible(false);
      return;
    }

    const r = item.getBoundingClientRect();
    const g = group.getBoundingClientRect();
    setSlide(visible); // already showing → slide; coming from outside → jump
    setRect({ x: r.left - g.left, y: r.top - g.top, width: r.width, height: r.height });
    setVisible(true);
  }

  const move =
    slide && !reduceMotion
      ? { type: "spring" as const, bounce: 0.15, duration: 0.3 }
      : { duration: 0 };

  return (
    <div
      ref={ref}
      className={cn("relative isolate", className)}
      onPointerOver={(e) => moveTo(e.target)}
      onPointerLeave={() => setVisible(false)}
      onFocus={(e) => moveTo(e.target)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setVisible(false);
      }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 -z-10 rounded-lg bg-sidebar-accent"
        initial={false}
        animate={rect ? { ...rect, opacity: visible ? 1 : 0 } : { opacity: 0 }}
        transition={{
          x: move,
          y: move,
          width: move,
          height: move,
          opacity: { duration: visible ? 0.12 : 0.25, ease: "easeOut" },
        }}
      />
      {children}
    </div>
  );
}
