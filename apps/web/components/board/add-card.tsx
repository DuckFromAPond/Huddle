"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { useCanEdit, useProject } from "@/context/proj-context";
import { createCard } from "@/lib/doc/cards";
import { type Status, STATUS_LABELS } from "@/lib/schema";
import { getIdentity } from "@/lib/identity";
import { Muted } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";

/** "Add card" button that turns into an input. Enter adds and stays open for the next card; Escape closes. */
export function AddCard({
  status,
  open,
  onOpenChange,
}: {
  status: Status;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { doc } = useProject();
  const canEdit = useCanEdit();
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!canEdit) return null; // read-only: the banner explains why

  function add(form: HTMLFormElement) {
    const title = (new FormData(form).get("title") as string).trim();
    if (!title) return;
    createCard(doc, { status, title }, getIdentity());
    form.reset(); // keep the input open and empty for quick entry
  }

  // closes the input and puts focus back on the button
  function close() {
    onOpenChange(false);
    // the button mounts on the next render; focus it once it exists
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="mt-1 flex items-center gap-1.5 cursor-pointer rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-secondary-hover hover:text-foreground"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add card
      </button>
    );
  }

  return (
    // a native form: Enter submits, and browsers already skip that while an IME is composing
    <form
      className="mt-2 grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        add(e.currentTarget);
      }}
    >
      <Input
        name="title"
        autoFocus
        autoComplete="off"
        aria-label={`New card in ${STATUS_LABELS[status]}`}
        placeholder="Card title"
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        onBlur={(e) => {
          // clicking away closes it, but only when nothing was typed
          if (!e.currentTarget.value.trim()) {
            close();
          }
        }}
      />
      <Muted className="px-1 text-xs">Enter to add · Esc to close</Muted>
    </form>
  );
}
