"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjectList } from "@/hooks/use-projects";
import { useEffect } from "react";

const MAX_RESULTS = 6;

function SearchBar({ className }: React.ComponentProps<"div">) {
  const router = useRouter();
  const projects = useProjectList();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const returnFocus = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0); // highlighted result

  // tiny local list: filter during render, no debounce or results state needed
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !projects) return [];
    return projects.filter((p) => p.title.toLowerCase().includes(q)).slice(0, MAX_RESULTS);
  }, [query, projects]);

  const showList = open && query.trim() !== "";

  function select(id: string) {
    setQuery("");
    setOpen(false);
    router.push(`/projects/${id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Guard at the top so IME navigation (Arrow keys, Enter, Escape) isn't hijacked
    if (e.nativeEvent.isComposing || e.key === "Process") return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!results.length) return;
      e.preventDefault(); // keep the caret where it is
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[active];
      if (pick) {
        select(pick.id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); // stop the browser's own Ctrl+K
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        setQuery("");
        // go back to where Ctrl+K was pressed, or just leave the field
        const back = returnFocus.current;
        returnFocus.current = null;
        if (back && back !== document.body && document.contains(back)) back.focus();
        else inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // remember where the user was, unless they're already in the search
        if (document.activeElement !== inputRef.current) {
          returnFocus.current = document.activeElement as HTMLElement | null;
        }
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Search projects"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        placeholder="Search projects…"
        autoComplete="off"
        className="border-transparent bg-secondary pl-8 pr-8 [&::-webkit-search-cancel-button]:appearance-none"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />

      {!query && (
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border bg-background px-1.5 text-xs text-muted-foreground">
          Ctrl K
        </kbd>
      )}

      {query && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
          onMouseDown={(e) => e.preventDefault()} // keep focus in the input
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      )}

      <ul
        id={listId}
        role="listbox"
        aria-label="Projects"
        hidden={!showList}
        className="absolute top-full z-30 m-2 w-full overflow-clip rounded-[14px] border bg-popover shadow-md"
      >
        {results.map((p, i) => (
          <li
            key={p.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()} // click before the input blurs
            onMouseEnter={() => setActive(i)}
            onClick={() => select(p.id)}
            className="cursor-pointer truncate px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
          >
            {p.title}
          </li>
        ))}
        {showList && results.length === 0 && (
          <li role="presentation" className="px-3 py-2 text-sm text-muted-foreground">
            No projects found
          </li>
        )}
      </ul>
    </div>
  );
}

export { SearchBar };
