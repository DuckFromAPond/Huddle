"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { IdentityMenu } from "@/components/layout/identity-menu";
import { useRef, useState } from "react";
import { useCanEdit, useProject } from "@/context/proj-context";
import { useProjectTitle } from "@/hooks/use-project-title";
import { MAX_TITLE_LENGTH } from "@/lib/schema";
import { setProjectTitle } from "@/lib/doc/project";

function ProjectTitle() {
  const { doc } = useProject();
  const canEdit = useCanEdit();
  const title = useProjectTitle(doc);
  const [editing, setEditing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const style = "max-w-xs truncate font-display text-sm font-medium";
  if (!canEdit) return <span className={style}>{title}</span>;

  function finish(value?: string) {
    if (value !== undefined) setProjectTitle(doc, value); // empty → ignored, old name stays
    setEditing(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  if (!editing) {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Rename project ${title}`}
        className={`${style} cursor-text rounded-md px-1.5 py-0.5 hover:bg-secondary-hover`}
      >
        {title}
      </button>
    );
  }

  return (
    // native form: Enter saves, and browsers skip that while an IME is composing
    <form
      onSubmit={(e) => {
        e.preventDefault();
        finish(new FormData(e.currentTarget).get("title") as string);
      }}
    >
      <input
        name="title"
        defaultValue={title}
        maxLength={MAX_TITLE_LENGTH}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          // cancel: nothing saved
          if (e.key === "Escape") {
            finish();
          }
        }}
        onBlur={(e) => finish(e.currentTarget.value)}
        aria-label="Project name"
        className="field-sizing-content min-w-24 max-w-xs rounded-md bg-secondary px-1.5 py-0.5 font-display text-sm font-medium outline-none"
      />
    </form>
  );
}

/** Floating corners over the board: back to projects + title (left), you (right). */
export function BoardTopbar() {
  return (
    <div className="flex min-w-0 shrink-0 items-start justify-between p-3">
      <div className="flex min-w-0 items-center gap-2 rounded-xl border bg-card py-1 pr-3 pl-1 shadow-sm backdrop-blur">
        <Link
          href="/projects"
          aria-label="Back to your projects"
          className="grid size-8 place-items-center rounded-lg hover:bg-secondary-hover"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-primary">
            <MessageCircle className="size-3.5 text-primary-foreground" aria-hidden="true" />
          </span>
        </Link>
        <ProjectTitle />
      </div>

      <div className="flex items-center p-1">
        <IdentityMenu />
      </div>
    </div>
  );
}
