// components/layout/hover-group.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Rect = { x: number; y: number; width: number; height: number };
/** Position of `item` relative to `group`, which is where the highlight is drawn. */
function rectOf(item: HTMLElement, group: HTMLElement): Rect {
  const r = item.getBoundingClientRect();
  const g = group.getBoundingClientRect();
  return { x: r.left - g.left, y: r.top - g.top, width: r.width, height: r.height };
}

/** One shared hover background for every child marked with `data-hover-item`. */
export function HoverGroup({
  children,
  className,
  highlightClassName = "bg-sidebar-accent",
}: {
  children: React.ReactNode;
  className?: string;
  highlightClassName?: string;
}) {
  const current = useRef<HTMLElement | null>(null); // the item the highlight is on
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(false); // slide only when moving between items

  const placed = useRef<Rect | null>(null); // where the highlight was last placed

  // keep the highlight on its item when the layout changes:
  // hide it if the item is gone (Search turning into the field), follow it if it moved
  useEffect(() => {
    const group = ref.current;
    if (!group) return;

    function sync() {
      const item = current.current;
      if (!item || !group) return;
      if (!group.contains(item)) {
        current.current = null;
        setVisible(false);
        return;
      }
      const next = rectOf(item, group);
      const prev = placed.current;
      if (
        prev &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.width === next.width &&
        prev.height === next.height
      )
        return; // nothing moved: leave any slide alone
      placed.current = next;
      setSlide(false); // the layout moved it: follow instantly instead of springing behind
      setRect(next);
    }

    const resize = new ResizeObserver(sync);
    const mutation = new MutationObserver(sync);
    resize.observe(group);
    mutation.observe(group, { childList: true, subtree: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  function moveTo(target: EventTarget) {
    const item = (target as HTMLElement).closest<HTMLElement>("[data-hover-item]");
    const group = ref.current;
    if (!item || !group || !group.contains(item)) return;

    if (item.getAttribute("aria-current") === "page") {
      setVisible(false);
      return;
    }

    current.current = item;
    placed.current = rectOf(item, group);
    setSlide(visible); // already showing → slide; coming from outside → jump
    setRect(placed.current);
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
        className={cn(
          "pointer-events-none absolute top-0 left-0 -z-10 rounded-lg bg-sidebar-accent",
          highlightClassName,
        )}
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
