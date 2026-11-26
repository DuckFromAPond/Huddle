"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import { useProject } from "@/context/proj-context";
import { exportProject, getProjectTitle, ImportError } from "@/lib/doc/project";
import { importProject } from "@/lib/storage/projects";
import { getIdentity } from "@/lib/identity";
import { Button } from "@/components/ui/button";
import { HoverGroup } from "@/components/layout/hover-group";
import { BoardMenu } from "@/components/board/board-nav-menu";
import { Text } from "@/components/ui/typography";
import { BoardViewMenu } from "@/components/board/board-view-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DockTip } from "@/components/board/dock-tooltip";
import { motion, useReducedMotion } from "motion/react";

/** Floating bar at the bottom of the board: ☰ menu, Add card, Search. */
export function BoardDock({
  canEdit,
  onAddCard,
  query,
  onQueryChange,
  matchCount,
  totalCount,
}: {
  canEdit: boolean;
  onAddCard: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  matchCount: number;
  totalCount: number;
}) {
  const { doc, id } = useProject();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const refocusButton = useRef(false); // put focus back on the search button after closing

  function openSearch() {
    setSearchOpen(true); // the input focuses itself on mount (autoFocus)
  }

  function closeSearch() {
    onQueryChange("");
    refocusButton.current = true; // the button focuses itself once it is back
    setSearchOpen(false);
  }

  // "/" opens search, unless the user is typing somewhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable='true']"))
        return;
      e.preventDefault();
      setSearchOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // error message clears itself
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  function handleExport() {
    const title = getProjectTitle(doc) ?? "project";
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "project";
    const blob = new Blob([JSON.stringify(exportProject(doc), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.huddle.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); // give the download a moment to start
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again
    if (!file) return;
    try {
      const project = await importProject(await file.text(), getIdentity());
      const newId = project.id;
      await project.close(); // the board page opens it again
      router.push(`/projects/${newId}`);
    } catch (err) {
      setError(
        err instanceof ImportError ? err.message : "Couldn't import that file. Try another.",
      );
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 px-4">
      {error && (
        <Text
          role="alert"
          className="pointer-events-auto rounded-lg bg-destructive px-3 py-1.5 text-sm text-destructive-foreground shadow-md"
        >
          {error}
        </Text>
      )}

      <div
        role="group"
        aria-label="Board tools"
        className="pointer-events-auto rounded-xl border bg-background/90 p-1 shadow-md backdrop-blur"
      >
        <TooltipProvider delay={150}>
          <HoverGroup className="flex items-center gap-1" highlightClassName="bg-secondary-hover">
            <BoardMenu
              currentId={id}
              onImport={() => fileRef.current?.click()}
              onExport={handleExport}
            />

            <span
              role="separator"
              aria-orientation="vertical"
              className="mx-0.5 h-5 w-px bg-border"
            />

            {/* note: a button for add is somewhat redundant but can be useful for phone */}
            {canEdit && (
              <DockTip label="Add card">
                <Button
                  data-hover-item
                  variant="ghost"
                  className="hover:bg-transparent dark:hover:bg-transparent"
                  size="icon-sm"
                  aria-label="Add card"
                  onClick={onAddCard}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </Button>
              </DockTip>
            )}
            {searchOpen ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center gap-1 pl-1.5"
              >
                <Search className="shrink-0 size-4 text-muted-foreground" aria-hidden="true" />
                <input
                  ref={searchRef}
                  autoFocus
                  type="search"
                  aria-label="Search cards on this board"
                  placeholder="Search cards…"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      closeSearch();
                    }
                  }}
                  className="field-sizing-content max-w-56 min-w-36 bg-transparent px-1 py-1 text-sm outline-none [&::-webkit-search-cancel-button]:appearance-none"
                />

                <span
                  className="text-xs whitespace-nowrap text-muted-foreground"
                  aria-live="polite"
                >
                  {query.trim() && `${matchCount} of ${totalCount}`}
                </span>

                <DockTip label="Close search" shortcut="Esc">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close search"
                    onClick={closeSearch}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </DockTip>
              </motion.div>
            ) : (
              <DockTip label="Search cards" shortcut="/">
                <Button
                  ref={searchButtonRef}
                  data-hover-item
                  variant="ghost"
                  className="hover:bg-transparent dark:hover:bg-transparent"
                  size="icon-sm"
                  aria-label="Search cards"
                  aria-keyshortcuts="/"
                  onClick={openSearch}
                >
                  <Search className="size-4" aria-hidden="true" />
                </Button>
              </DockTip>
            )}

            <BoardViewMenu />
          </HoverGroup>
        </TooltipProvider>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
