"use client";

import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { useCanEdit, useProject } from "@/context/proj-context";
import { moveCardToColumn, nudgeCard } from "@/lib/doc/cards";
import type { Card } from "@/lib/schema";
import { useColumns } from "@/hooks/use-columns";
import { getIdentity } from "@/lib/identity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** The non-drag way to move a card: needed on touch screens and for WCAG 2.5.7. */
export function CardMenu({
  card,
  isFirst,
  isLast,
}: {
  card: Card;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { doc } = useProject();
  const columns = useColumns(doc);
  const canEdit = useCanEdit();
  if (!canEdit) return null;

  // after a move to another column this menu unmounts, so put focus on the card in its new spot
  const focusCard = () =>
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-card-id="${card.id}"]`)?.focus(),
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Move ${card.title || "Untitled"}`}
        className={
          "cursor-pointer absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-md text-muted-foreground " +
          "hover:bg-secondary-hover focus-visible:ring-2 focus-visible:ring-ring outline-none " +
          // desktop: show on hover/focus; touch screens (no hover): always visible, bigger target
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100 " +
          "[@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:size-10"
        }
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={isFirst}
          onClick={() => (nudgeCard(doc, card.id, -1, getIdentity()), focusCard())}
        >
          <ArrowUp aria-hidden="true" /> Move up
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isLast}
          onClick={() => (nudgeCard(doc, card.id, 1, getIdentity()), focusCard())}
        >
          <ArrowDown aria-hidden="true" /> Move down
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {columns
            .filter((c) => c.id !== card.status)
            .map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => (
                  moveCardToColumn(doc, card.id, c.id, "bottom", getIdentity()),
                  focusCard()
                )}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
