"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import {
  Accessibility,
  KeyboardSensor,
  PointerActivationConstraints,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import type { Plugins, Sensors } from "@dnd-kit/abstract";
import { MotionConfig } from "motion/react";
import { useCanEdit, useProject } from "@/context/proj-context";
import { useCards } from "@/hooks/use-card";
import { dropCard } from "@/lib/doc/cards";
import { STATUS_LABELS, STATUSES, type Card, type Status } from "@/lib/schema";
import { getIdentity } from "@/lib/identity";
import { OutdatedBanner } from "@/components/project/outdated-banner";
import { BoardColumn } from "@/components/board/board-column";
import { cn } from "@/lib/utils";
import { useCardParam } from "@/hooks/use-card-param";
import { CardDetail } from "@/components/board/card-detail";

type Columns = Record<Status, string[]>;

export function Board() {
  const { doc } = useProject();
  const canEdit = useCanEdit();
  const cards = useCards(doc);

  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const docColumns = useMemo(() => {
    const cols = Object.fromEntries(STATUSES.map((s) => [s, [] as string[]])) as Columns;
    for (const card of cards) {
      // cards are already in display order
      cols[card.status].push(card.id);
    }
    return cols;
  }, [cards]);

  const [preview, setPreview] = useState<Columns | null>(null);
  const previewRef = useRef<Columns | null>(null);
  const updatePreview = (next: Columns | null) => {
    previewRef.current = next;
    setPreview(next);
  };
  const [activeId, setActiveId] = useState<string | null>(null);

  const columns = preview ?? docColumns;
  const dragging = preview !== null;
  const targetColumn =
    preview && activeId ? STATUSES.find((s) => preview[s].includes(activeId)) : undefined;

  const { cardId, openCard, closeCard } = useCardParam();
  const openedCard = cardId ? cardById.get(cardId) : undefined;

  // Screen-reader announcements use card titles and column names, not random ids.
  // They read the latest data through a ref, so the plugin is configured only once.
  const lookup = useRef({ cardById, columns });

  useEffect(() => {
    lookup.current = { cardById, columns };
  });

  const plugins = useMemo(() => {
    const titleOf = (id: unknown) => lookup.current.cardById.get(String(id))?.title || "card";
    const columnOf = (id: unknown) => {
      const { columns } = lookup.current;
      const col = STATUSES.includes(id as Status)
        ? (id as Status)
        : STATUSES.find((s) => columns[s].includes(String(id)));
      return col ? STATUS_LABELS[col] : undefined;
    };
    const accessibility = Accessibility.configure({
      announcements: {
        dragstart: ({ operation }: DragStartEvent) => `Picked up ${titleOf(operation.source?.id)}.`,
        dragover: ({ operation }: DragOverEvent) => {
          const col = columnOf(operation.target?.id);
          return col ? `${titleOf(operation.source?.id)} is over ${col}.` : undefined;
        },
        dragend: ({ operation, canceled }: DragEndEvent) => {
          const title = titleOf(operation.source?.id);
          if (canceled) return `Cancelled. ${title} went back to where it was.`;
          const col = columnOf(operation.target?.id);
          return col ? `Dropped ${title} in ${col}.` : `Dropped ${title}.`;
        },
      },
      screenReaderInstructions: {
        draggable:
          "Press Enter to open a card. To move it, press Space to pick it up, use the arrow keys to move it within or between columns, then press Space to drop it. Press Escape to cancel.",
      },
    });
    // replace the default accessibility plugin, keep every other default
    return (defaults: Plugins): Plugins => [
      ...defaults.filter(
        (p) => p !== Accessibility && !("plugin" in p && p.plugin === Accessibility),
      ),
      accessibility,
    ];
  }, []);

  // dnd-kit's default uses both Space and Enter to pick up; keep Space, free Enter for opening
  const sensors = useMemo(
    () =>
      (defaults: Sensors): Sensors => [
        ...defaults.filter(
          (s) =>
            s !== KeyboardSensor &&
            !("plugin" in s && s.plugin === KeyboardSensor) &&
            s !== PointerSensor &&
            !("plugin" in s && s.plugin === PointerSensor),
        ),
        // a click stays a click: mouse drags start after 5px of movement,
        // touch drags after a 250ms press-and-hold (so swiping still scrolls)
        PointerSensor.configure({
          activationConstraints(event) {
            if (event.pointerType === "touch") {
              return [new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 })];
            }
            return [new PointerActivationConstraints.Distance({ value: 5 })];
          },
        }),
        KeyboardSensor.configure({/* your existing keyboardCodes */}),
      ],
    [],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-0 flex-1 flex-col">
        {!canEdit && (
          <div className="px-6 pb-3">
            <OutdatedBanner />
          </div>
        )}

        {/* sets the column as droppable target */}
        <DragDropProvider
          plugins={plugins}
          sensors={sensors}
          onDragStart={(event) => {
            setActiveId(String(event.operation.source?.id ?? ""));
            updatePreview(docColumns);
          }}
          onDragOver={(event) => {
            if (!previewRef.current) return;
            // React moves the card (even into another column), so React's record of the page stays true
            updatePreview(move(previewRef.current, event));
            // and dnd-kit doesn't move it as well: exactly one thing changes the page during a drag
            event.preventDefault();
          }}
          onDragEnd={(event) => {
            const cols = previewRef.current;
            if (!event.canceled && cols && canEdit) {
              const id = String(event.operation.source?.id ?? "");
              const to = STATUSES.find((s) => cols[s].includes(id));
              if (to) dropCard(doc, id, to, cols[to], getIdentity()); // writes nothing if unchanged
            }
            updatePreview(null); // the doc now holds the same order, so nothing jumps
            setActiveId(null);
          }}
        >
          <div
            className={cn(
              "flex min-h-0 flex-1 items-start gap-3 overflow-x-auto px-4 pb-6 md:gap-4 md:px-6",
              // mobile: swipe one column at a time; desktop: free layout
              "snap-x snap-mandatory scroll-px-4 md:snap-none",
              dragging && "snap-none", // never fight dnd-kit's auto-scroll mid-drag
            )}
          >
            {STATUSES.map((status) => (
              <BoardColumn
                highlighted={targetColumn === status}
                key={status}
                status={status}
                cards={columns[status].map((id) => cardById.get(id)).filter((c): c is Card => !!c)}
                canEdit={canEdit}
                onOpenCard={openCard}
              />
            ))}
          </div>
        </DragDropProvider>
        {/* closes itself if the open card is deleted */}
        <CardDetail card={openedCard} onClose={closeCard} />
      </div>
    </MotionConfig>
  );
}
