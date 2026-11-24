"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import {
  Accessibility,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import type { Plugins } from "@dnd-kit/abstract";
import { MotionConfig } from "motion/react";
import { useCanEdit, useProject } from "@/context/proj-context";
import { useCards } from "@/hooks/use-card";
import { dropCard } from "@/lib/doc/cards";
import { STATUS_LABELS, STATUSES, type Card, type Status } from "@/lib/schema";
import { getIdentity } from "@/lib/identity";
import { OutdatedBanner } from "@/components/project/outdated-banner";
import { BoardColumn } from "@/components/board/board-column";

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

  // While dragging, the board shows a local preview; the doc is written once, on drop.
  // The ref mirrors the state so drag handlers always read the latest preview.
  const [preview, setPreview] = useState<Columns | null>(null);
  const previewRef = useRef<Columns | null>(null);
  const updatePreview = (next: Columns | null) => {
    previewRef.current = next;
    setPreview(next);
  };

  const columns = preview ?? docColumns;
  const [activeId, setActiveId] = useState<string | null>(null);
  const targetColumn =
    preview && activeId ? STATUSES.find((s) => preview[s].includes(activeId)) : undefined;

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
          "To move a card, press Space or Enter to pick it up, use the arrow keys to move it within or between columns, then press Space or Enter to drop it. Press Escape to cancel.",
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-0 flex-1 flex-col">
        {!canEdit && (
          <div className="px-6 pb-3">
            <OutdatedBanner />
          </div>
        )}

        <DragDropProvider
          plugins={plugins}
          onDragStart={(event) => {
            setActiveId(String(event.operation.source?.id ?? ""));
            updatePreview(docColumns);
          }}
          onDragOver={(event) => {
            // move() handles both reordering in a column and moving between columns
            if (previewRef.current) updatePreview(move(previewRef.current, event));
          }}

          onDragEnd={(event) => {
            const cols = previewRef.current;

            if (!event.canceled && cols && canEdit) {
              const id = String(event.operation.source?.id ?? "");
              const to = STATUSES.find((s) => cols[s].includes(id));
              // dropCard writes nothing if the card ended up where it started
              if (to) dropCard(doc, id, to, cols[to], getIdentity());
            }

            // always clear, even on cancel or read-only; by now the doc already has the new order
            updatePreview(null);
            setActiveId(null);
          }}
        >
          <div className="flex min-h-0 flex-1 items-start gap-4 overflow-x-auto px-6 pb-6">
            {STATUSES.map((status) => (
              <BoardColumn
                highlighted={targetColumn === status}
                key={status}
                status={status}
                cards={columns[status].map((id) => cardById.get(id)).filter((c): c is Card => !!c)}
                canEdit={canEdit}
              />
            ))}
          </div>
        </DragDropProvider>
      </div>
    </MotionConfig>
  );
}
