// components/layout/app-sidebar.tsx
"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/ui/navlink";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { useRecentProjects } from "@/hooks/use-recent-projects";
import { HoverGroup } from "@/components/layout/hover-group";
import { useOpenSettings } from "@/components/settings/settings-dialog";

/** Navigation for the dashboard pages. Not used on the board, which has a dock. */
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { loading, recent } = useRecentProjects();

  const [recentOpen, setRecentOpen] = useState(true);
  const recentListId = useId();

  const openSettings = useOpenSettings();

  return (
    <Sidebar className="p-0 shadow-none" {...props}>
      <nav aria-label="Main" className="flex h-full flex-col gap-1 px-4 py-5">
        <SidebarContent className="flex-1 gap-1 p-0">
          <HoverGroup>
            <ul className="flex flex-col gap-1">
              <li>
                <NavLink
                  title="Projects"
                  url="/projects"
                  icon={LayoutGrid}
                  isActive={pathname === "/projects"}
                />
              </li>

              {/* recent projects */}
              <li>
                <button
                  type="button"
                  data-hover-item
                  aria-expanded={recentOpen}
                  aria-controls={recentListId}
                  onClick={() => setRecentOpen((open) => !open)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2.5 pr-2 pl-3 text-sm text-sidebar-foreground/70"
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      "size-3.5 shrink-0 transition-transform motion-reduce:transition-none",
                      recentOpen && "rotate-90",
                    )}
                  />
                  Recent
                </button>

                <ul
                  id={recentListId}
                  hidden={!recentOpen}
                  className="flex flex-col gap-0.5 pt-1 pl-6"
                >
                  {recent.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.id}`}
                        data-hover-item
                        className="block truncate rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      >
                        {project.title}
                      </Link>
                    </li>
                  ))}
                  {!loading && recent.length === 0 && (
                    <li className="px-2 py-1.5 text-sm text-sidebar-foreground/50">
                      Projects you open show up here
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </HoverGroup>
        </SidebarContent>

        <SidebarFooter className="p-0">
          <HoverGroup>
            <button
              type="button"
              data-hover-item
              onClick={openSettings}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70"
            >
              <Settings className="size-4 shrink-0" aria-hidden="true" />
              Settings
            </button>
          </HoverGroup>
        </SidebarFooter>
      </nav>
    </Sidebar>
  );
}
