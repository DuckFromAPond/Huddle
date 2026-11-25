"use client";

import { useEffect, useId, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCanEdit, useProject } from "@/context/proj-context";
import { useCardActivity } from "@/hooks/use-card-activity";
import { useYText } from "@/hooks/use-detail";
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
import { STATUS_LABELS, STATUSES, type Card, type Priority, type Status } from "@/lib/schema";
import { getIdentity } from "@/lib/identity";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// adjust if your Priority type uses different values
const PRIORITY_LABELS: Record<Priority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
function timeAgo(ms: number) {
  const min = Math.round((ms - Date.now()) / 60_000);
  if (min > -1) return "just now";
  if (min > -60) return rtf.format(min, "minute");
  const h = Math.round(min / 60);
  return h > -24 ? rtf.format(h, "hour") : rtf.format(Math.round(h / 24), "day");
}

function describe(e: CardEvent): string {
  switch (e.type) {
    case "created":
      return "created this card";
    case "imported":
      return "imported this card";
    case "status":
      return `moved it from ${STATUS_LABELS[e.from as Status] ?? e.from} to ${STATUS_LABELS[e.to as Status] ?? e.to}`;
    case "priority":
      return `set priority to ${PRIORITY_LABELS[e.to as Priority] ?? e.to}`;
    case "renamed":
      return `renamed it from "${e.from}"`;
    case "comment":
      return `commented: ${e.text}`;
    default:
      return "changed this card";
  }
}

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

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

function CardFields({ card, onDeleted }: { card: Card; onDeleted: () => void }) {
  const { doc } = useProject();
  const canEdit = useCanEdit();
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
    if (title && title !== card.title) setTitle(doc, card.id, title, getIdentity());
  }

  function changeStatus(status: Status) {
    if (status === card.status) return;
    // dropdown alternative to dragging: goes to the bottom of the new column
    moveCard(doc, card.id, status, orderForIndex(doc, status, Infinity, card.id), getIdentity());
  }

  return (
    <>
      <SheetHeader className="p-0">
        <SheetTitle className="sr-only">Card details</SheetTitle>
        <SheetDescription className="sr-only">
          Edit the card's title, column, priority and description.
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
            readOnly={!canEdit}
            onBlur={(e) => commitTitle(e.currentTarget.value)}
            className="w-full rounded-lg bg-transparent px-1 py-1 text-base font-semibold outline-none hover:bg-secondary focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label htmlFor={ids.status} className="text-xs font-medium text-muted-foreground">
            Column
          </label>
          <select
            id={ids.status}
            value={card.status}
            disabled={!canEdit}
            onChange={(e) => changeStatus(e.target.value as Status)}
            className={fieldClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
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
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={ids.description} className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        <textarea
          id={ids.description}
          value={descriptionValue}
          readOnly={!canEdit || !description}
          placeholder={canEdit ? "Add more detail…" : "No description"}
          onChange={(e) => description && applyTextDiff(description, e.target.value)}
          className={`${fieldClass} min-h-24 resize-none field-sizing-content max-h-96`}
        />
      </div>

      {canEdit && (
        <div className="mt-auto">
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

      <section aria-labelledby={`${ids.title}-activity`} className="grid gap-3">
        <h3 id={`${ids.title}-activity`} className="text-xs font-medium text-muted-foreground">
          Activity
        </h3>
        {activity.length === 0 ? (
          <Muted>No activity yet.</Muted>
        ) : (
          <ol className="grid gap-2.5">
            {activity.map((e, i) => (
              <li key={`${e.at}-${i}`} className="flex gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: e.by.color }}
                />
                <p>
                  <span className="font-medium">{e.by.name}</span> {describe(e)}
                  <span className="text-muted-foreground"> · {timeAgo(e.at)}</span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
