"use client";

// react and next
import { useEffect, useMemo, useRef, useState } from "react";

// movement with dnd-kit and motion
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

// lib, hooks, and context
import { useCanEdit, useProject } from "@/context/proj-context";
import { useCards } from "@/hooks/use-card";
import { usePreferences } from "@/hooks/use-preferences";
import { dropCard } from "@/lib/doc/cards";
import { type Card, type ColumnId } from "@/lib/schema";
import { useColumns } from "@/hooks/use-columns";
import { getIdentity } from "@/lib/identity";
import { cn } from "@/lib/utils";

// component
import { OutdatedBanner } from "@/components/project/outdated-banner";
import { BoardColumn } from "@/components/board/board-column";
import { useCardParam } from "@/hooks/use-card-param";
import { CardDetail } from "@/components/board/card-detail";
import { BoardDock } from "@/components/board/board-dock";

type Columns = Record<ColumnId, string[]>;

export function Board() {
  const { doc } = useProject();
  const canEdit = useCanEdit();
  const cards = useCards(doc);
  const columnList = useColumns();

  // map card into a map of id with card
  const cardById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  // place cards into respective status column
  const docColumns = useMemo(() => {
    // make status to be key of cols object
    const cols = Object.fromEntries(columnList.map((c) => [c.id, [] as string[]])) as Columns;
    for (const card of cards) cols[card.status]?.push(card.id);
    return cols;
  }, [cards, columnList]);

  // for react to render preview
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
    preview && activeId ? columnList.find((c) => preview[c.id]?.includes(activeId))?.id : undefined;

  const prefs = usePreferences();
  const [addingTo, setAddingTo] = useState<ColumnId | null>(null); /// which column's Add card input is open

  const [query, setQuery] = useState("");
  const cleanQuery = query.trim().toLowerCase();

  const isVisible = (card: Card) => !cleanQuery || card.title.toLowerCase().includes(cleanQuery);
  const matchCount = cleanQuery ? cards.filter(isVisible).length : cards.length;

  // no dragging while searching: hidden cards would make the drop position wrong
  const canDrag = canEdit && !cleanQuery;

  const { cardId, openCard, closeCard } = useCardParam();
  const openedCard = cardId ? cardById.get(cardId) : undefined;

  const lookup = useRef({ cardById, columns, columnList });

  useEffect(() => {
    lookup.current = { cardById, columns, columnList };
  });

  // Screen-reader announcements use card titles and column names, not random ids.
  // They read the latest data through a ref, so the plugin is configured only once.
  const plugins = useMemo(() => {
    const titleOf = (id: unknown) => lookup.current.cardById.get(String(id))?.title || "card";

    const columnOf = (id: unknown) => {
      const { columns, columnList } = lookup.current;

      const col =
        columnList.find((c) => c.id === id) ?? // over a column itself
        columnList.find((c) => columns[c.id]?.includes(String(id))); // over a card in it
      return col?.name;
    };

    // configure accessiblity with dnd-dom
    const accessibility = Accessibility.configure({
      announcements: {
        dragstart: ({ operation }: DragStartEvent) => `Picked up ${titleOf(operation.source?.id)}.`,
        dragover: ({ operation }: DragOverEvent) => {
          const col = columnOf(operation.target?.id);
          return col ? `${titleOf(operation.source?.id)} is over ${col}.` : undefined;
        },
        dragend: ({ operation, canceled }: DragEndEvent) => {
          const title = titleOf(operation.source?.id);
          if (canceled) {
            return `Cancelled. ${title} went back to where it was.`;
          }
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

  // dnd-kit's default uses both Space and Enter to pick up so keep Space, free Enter for opening
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
        KeyboardSensor.configure({
          keyboardCodes: {
            start: ["Space"], // Enter is freed for opening the card detail
            cancel: ["Escape"],
            end: ["Space", "Tab"],
            up: ["ArrowUp"],
            down: ["ArrowDown"],
            left: ["ArrowLeft"],
            right: ["ArrowRight"],
          },
        }),
      ],
    [],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-compact={prefs.compactCards || undefined}
        className="relative flex min-h-0 flex-1 flex-col"
      >
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
          // when hovering over a column, let react render it and not dnd-kit
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
              const to = columnList.find((c) => cols[c.id]?.includes(id))?.id;
              if (to) {
                // writes nothing if unchanged
                dropCard(doc, id, to, cols[to], getIdentity());
              }
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
            {columnList.map((col) => (
              <BoardColumn
                key={col.id}
                status={col.id}
                name={col.name}
                cards={(columns[col.id] ?? [])
                  .map((id) => cardById.get(id))
                  .filter((c): c is Card => !!c && isVisible(c))}
                canEdit={canDrag} // no dragging while searching
                adding={addingTo === col.id}
                onAddingChange={(open) => setAddingTo(open ? col.id : null)}
                highlighted={targetColumn === col.id}
                onOpenCard={openCard}
              />
            ))}
          </div>
        </DragDropProvider>
        {/* closes itself if the open card is deleted */}
        <CardDetail card={openedCard} onClose={closeCard} />
        <BoardDock
          canEdit={canEdit}
          onAddCard={() => setAddingTo(columnList[0].id)}
          query={query}
          onQueryChange={setQuery}
          matchCount={matchCount}
          totalCount={cards.length}
        />
      </div>
    </MotionConfig>
  );
}
