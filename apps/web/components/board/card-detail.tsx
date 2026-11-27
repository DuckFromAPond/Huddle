"use client";

import * as Y from "yjs";
import { useEffect, useId, useState, useRef, useLayoutEffect } from "react";
import { Trash2 } from "lucide-react";
import { useCanEdit, useProject } from "@/context/proj-context";
import { useCardActivity } from "@/hooks/use-card-activity";
import { useYText } from "@/hooks/use-y-text";
import {
  cardsMap,
  deleteCard,
  getDescription,
  moveCard,
  orderForIndex,
  setPriority,
  setTitle,
} from "@/lib/doc/cards";
import { applyTextDiff } from "@/lib/doc/detail";
import type { CardEvent } from "@/lib/doc/activity";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  type Card,
  type Priority,
  type ColumnId,
  MAX_TITLE_LENGTH,
} from "@/lib/schema";
import { columnName } from "@/lib/doc/columns";
import { useColumns } from "@/hooks/use-columns";
import { getIdentity } from "@/lib/identity";
import { Button } from "@/components/ui/button";
import { Muted, Text, Title } from "@/components/ui/typography";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// calculate time ago for activity log
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const dateFmt = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});
function timeAgo(ms: number) {
  const min = Math.round((ms - Date.now()) / 60_000);
  if (min > -1) {
    return "just now";
  }

  if (min > -60) {
    return rtf.format(min, "minute");
  }

  const h = Math.round(min / 60);
  if (h > -24) {
    return rtf.format(h, "hour");
  }

  const d = Math.round(h / 24);
  return d > -30 ? rtf.format(d, "day") : dateFmt.format(ms);
}

// for deciding activity log
function describe(e: CardEvent, doc: Y.Doc): React.ReactNode {
  switch (e.type) {
    case "created":
      return "created this card";
    case "imported":
      return "imported this card";
    case "status":
      return (
        <>
          moved this card from <span className="text-primary">{columnName(doc, e.from)}</span> to{" "}
          <span className="text-primary">{columnName(doc, e.to)}</span>
        </>
      );
    case "priority":
      return (
        <>
          set priority to{" "}
          <span className="text-primary">{PRIORITY_LABELS[e.to as Priority] ?? e.to}</span>
        </>
      );
    case "renamed":
      return (
        <>
          renamed this card from <span className="text-primary"> &quot;{e.from}&quot; </span> to{" "}
          <span className="text-primary">&quot;{e.to}&quot;</span>
        </>
      );
    case "comment":
      return `commented: ${e.text}`;
    default:
      return "changed this card";
  }
}

// helper to guard new Date(e.at).toISOString
function isoOrUndefined(ms: number) {
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

function ActivityItem({ event, doc }: { event: CardEvent; doc: Y.Doc }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return; // while expanded, keep the button so "Show less" stays

    // check if full text is longer than 2 lines, if so then show more button renders
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1); // +1: sub-pixel rounding
    check();

    // the panel can change width (window resize, phone rotation), which changes the line count
    const observer = new ResizeObserver(check);
    observer.observe(el);

    return () => observer.disconnect();
  }, [expanded]);

  return (
    <li className="flex gap-2 text-sm pt-2">
      <span
        aria-hidden="true"
        className="mt-1.5 size-2 shrink-0 rounded-full"
        style={{ backgroundColor: event.by.color }}
      />
      <div className="min-w-0">
        <Text ref={textRef} className={cn("text-sm wrap-anywhere", !expanded && "line-clamp-2")}>
          <span className="font-medium">{event.by.name} </span>
          {describe(event, doc)}
          <span className="text-muted-foreground">
            {" · "}
            <time dateTime={isoOrUndefined(event.at)} title={isoOrUndefined(event.at)}>
              {timeAgo(event.at)}
            </time>
          </span>
        </Text>

        {clamped && (
          <Button
            variant="link"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
    </li>
  );
}
// fields for detail component
function CardFields({ card, onDeleted }: { card: Card; onDeleted: () => void }) {
  const { doc } = useProject();
  const canEdit = useCanEdit();
  const columns = useColumns(doc);

  const ids = { title: useId(), status: useId(), priority: useId(), description: useId() };

  const description = getDescription(doc, card.id);
  const descriptionValue = useYText(description);
  const activity = useCardActivity(cardsMap(doc).get(card.id));
  const [confirmDelete, setConfirmDelete] = useState(false);

  // "Delete" asks once more; the question resets after a few seconds
  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 4000);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  function commitTitle(value: string) {
    const title = value.trim();
    if (title && title !== card.title) {
      setTitle(doc, card.id, title, getIdentity());
    }
  }

  function changeStatus(status: ColumnId) {
    if (status === card.status) return;
    // dropdown alternative to dragging: goes to the bottom of the new column
    moveCard(doc, card.id, status, orderForIndex(doc, status, Infinity, card.id), getIdentity());
  }

  // TODO refine later

  return (
    <>
      <SheetHeader className="p-0">
        <SheetTitle className="sr-only">Card details</SheetTitle>
        <SheetDescription className="sr-only">
          Edit the card&apos;s title, column, priority and description.
        </SheetDescription>
        {/* native form: Enter saves, and browsers skip that while an IME is composing */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commitTitle(new FormData(e.currentTarget).get("title") as string);
          }}
        >
          <label htmlFor={ids.title} className="sr-only">
            Title
          </label>
          <input
            key={card.title} // reset if the title changes elsewhere
            id={ids.title}
            name="title"
            defaultValue={card.title}
            maxLength={MAX_TITLE_LENGTH}
            readOnly={!canEdit}
            onBlur={(e) => commitTitle(e.currentTarget.value)}
            className="w-full rounded-lg bg-transparent px-1 py-1 text-base font-semibold outline-none hover:bg-secondary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label htmlFor={ids.status} className="text-xs font-medium text-muted-foreground">
            Column (status)
          </label>
          <select
            id={ids.status}
            value={card.status}
            disabled={!canEdit}
            onChange={(e) => changeStatus(e.target.value)}
            className={fieldClass}
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor={ids.priority} className="text-xs font-medium text-muted-foreground">
            Priority
          </label>
          <select
            id={ids.priority}
            value={card.priority}
            disabled={!canEdit}
            onChange={(e) => setPriority(doc, card.id, e.target.value as Priority, getIdentity())}
            className={fieldClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={ids.description} className="text-xs font-medium text-muted-foreground">
          Description/Notes
        </label>
        <textarea
          id={ids.description}
          value={descriptionValue}
          readOnly={!canEdit || !description}
          placeholder={canEdit ? "Add more detail…" : "No description"}
          onChange={(e) =>
            description && applyTextDiff(description, descriptionValue, e.target.value)
          }
          className={`${fieldClass} min-h-24 resize-none field-sizing-content max-h-96`}
        />

        {canEdit && (
          <div className="mt-4">
            <Button
              variant={"destructive"}
              onClick={() => {
                if (!confirmDelete) return setConfirmDelete(true);
                deleteCard(doc, card.id);
                onDeleted();
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {confirmDelete ? "Click again to delete" : "Delete card"}
            </Button>
          </div>
        )}
      </div>

      <section aria-labelledby={`${ids.title}-activity`} className="grid gap-3">
        <Title
          as="h3"
          id={`${ids.title}-activity`}
          className="text-xs font-medium text-muted-foreground"
        >
          Activity
        </Title>
        {activity.length === 0 ? (
          <Muted>No activity yet.</Muted>
        ) : (
          <ol className="grid gap-2.5">
            {activity.map((event) => (
              <ActivityItem
                key={`${event.at}-${event.by.id}-${event.type}`}
                event={event}
                doc={doc}
              />
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

/** Side panel for one card. Renders nothing when no card is open. */
export function CardDetail({ card, onClose }: { card: Card | undefined; onClose: () => void }) {
  return (
    <Sheet open={!!card} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-6 overflow-y-auto p-6 sm:max-w-md"
      >
        {card && <CardFields key={card.id} card={card} onDeleted={onClose} />}
      </SheetContent>
    </Sheet>
  );
}
