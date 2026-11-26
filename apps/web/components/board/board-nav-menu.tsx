"use client";

import Link from "next/link";
import { Download, Home, Menu, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRecentProjects } from "@/hooks/use-recent-projects";

/** The board's ☰ menu: navigation and file actions */
export function BoardMenu({
  currentId,
  onImport,
  onExport,
}: {
  currentId: string;
  onImport: () => void;
  onExport: () => void;
}) {
  const { recent } = useRecentProjects();
  const others = recent.filter((p) => p.id !== currentId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            data-hover-item
            variant="ghost"
            className="hover:bg-transparent dark:hover:bg-transparent"
            size="icon-sm"
            aria-label="Menu"
          />
        }
      >
        <Menu className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={10} className="w-32">
        <DropdownMenuItem render={<Link href="/projects" />}>
          <Home className="size-4" aria-hidden="true" /> All projects
        </DropdownMenuItem>

        {others.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Recent</DropdownMenuLabel>
            {others.map((p) => (
              <DropdownMenuItem key={p.id} render={<Link href={`/projects/${p.id}`} />}>
                <span className="truncate">{p.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onImport}>
          <Upload className="size-4" aria-hidden="true" /> Import
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>
          <Download className="size-4" aria-hidden="true" /> Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
