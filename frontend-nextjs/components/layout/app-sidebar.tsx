'use client'

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { NavLink } from "@/components/ui/navlink"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Clock, Archive, Settings, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarHeader,
} from "@/components/ui/sidebar"

// FIXME get recent proj from calculation (can also limit recents to 5 too)
const recentProjects = [
  { title: "My Wireframe", url: "/p/abc123" },
  { title: "Team Brainstorm", url: "/p/def456" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // path to page
  const pathname = usePathname()
  const [recentOpen, setRecentOpen] = useState(false)

  return (
    <Sidebar className="p-0 shadow-none" {...props}>
      <div className="px-4 py-5 flex flex-col gap-1 h-full">
        <SidebarContent className="p-0 flex-1 gap-1">
          {/* home */}
          <NavLink title="Projects" url="/" icon={LayoutGrid} isActive={pathname === "/"} />

          {/* recent */}
          <div>
            {/* FIXME template on click fx remove this later */}
            <div
              className={`flex items-center gap-2.5 pl-3 pr-2 py-2.5 rounded-[14px] text-sm ${
                pathname === "/recent"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                }
              `}
            >
              <Link href="/recent" className="flex items-center gap-2.5 flex-1 min-w-0">
                <Clock className="size-4 shrink-0" />
                <span className="truncate">Recent</span>
              </Link>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setRecentOpen((open) => !open)}
                className="size-6 shrink-0 hover:bg-sidebar-foreground/10"
                aria-label={recentOpen ? "Collapse recent" : "Expand recent"}
              >
                <ChevronRight
                  className={`size-3.5 transition-transform ${recentOpen ? "rotate-90" : ""}`}
                />
              </Button>
            </div>
            
            {/* load each  */}
            {recentOpen && (
              <div className="flex flex-col gap-0.5 pl-8 pr-2 pt-1">
                {recentProjects.map((project) => (
                  <Link
                    key={project.url}
                    href={project.url}
                    className="text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground truncate py-1.5"
                  >
                    {project.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
    
          {/* archive + setting */}
          <NavLink title="Archive" url="/archive" icon={Archive} isActive={pathname === "/archive"} />
          <NavLink title="Settings" url="/settings" icon={Settings} isActive={pathname === "/settings"} />
        </SidebarContent>

        <SidebarFooter className="p-0" />
      </div>
    </Sidebar>
  )
}
