"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
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
import { MOBILE_QUERY } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

export function MobileNav({ className }: { className?: string }) {
  const { recent } = useRecentProjects();
  const [open, setOpen] = useState(false);

  // the menu only exists on narrow screens: close it when the window becomes wide
  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      if (!mobile.matches) setOpen(false);
    };
    mobile.addEventListener("change", onChange);
    return () => mobile.removeEventListener("change", onChange);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className={className} aria-label="Menu" />}
      >
        <Menu className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        <DropdownMenuItem render={<Link href="/projects" />}>Projects</DropdownMenuItem>
        {recent.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Recent</DropdownMenuLabel>
              {recent.map((p) => (
                <DropdownMenuItem key={p.id} render={<Link href={`/projects/${p.id}`} />}>
                  <span className="truncate">{p.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
