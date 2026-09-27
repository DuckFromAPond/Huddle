'use client'

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus, LayoutGrid, Clock, Archive, Settings, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarHeader,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation";
import { createProj } from "@/lib/projects";

// FIXME get recent proj from calculation (can also limit recents to 5 too)
const recentProjects = [
  { title: "My Wireframe", url: "/p/abc123" },
  { title: "Team Brainstorm", url: "/p/def456" },
]


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // path to page
  const pathname = usePathname()
  const [recentOpen, setRecentOpen] = useState(false)
  const router = useRouter(); 

  // create new project 
  function handleCreate() {
    const newProj = createProj("Untitled project")
    router.push(`/p/${newProj.id}`)
  }

  return (
    <Sidebar className="p-0 shadow-none" {...props}>
      <div className="px-4 py-5 flex flex-col gap-1 h-full">
        {/* logo + home */}
        {/* <SidebarHeader className="p-0 pb-5">
          <Link href="/" className="flex items-center gap-2 px-2">
            <div className="size-7 rounded-full bg-sidebar-primary flex items-center justify-center">
              <MessageCircle className="size-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-medium text-[15px]">Huddle</span>
          </Link>
        </SidebarHeader> */}

        <button 
          className="flex items-center gap-2.5 justify-start bg-sidebar-primary rounded-[14px] px-3 py-2.5 mb-3"
          onClick={handleCreate}
        >
          <Plus className="size-4 text-sidebar-primary-foreground" />
          <span className="text-sm font-medium text-sidebar-primary-foreground">
            New project
          </span>
        </button>

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

              <button
                onClick={(e) => {
                  e.preventDefault()
                  setRecentOpen((open) => !open)
                }}
                className="shrink-0 p-0.5 rounded hover:bg-sidebar-foreground/10"
                aria-label={recentOpen ? "Collapse recent" : "Expand recent"}
              >
                <ChevronRight 
                  className={`size-3.5 transition-transform ${recentOpen ? "rotate-90" : ""}`}
                />
              </button>
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

function NavLink({
  title,
  url,
  icon: Icon,
  isActive,
}: {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}) {
  return (
    <Link
      href={url}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-sm ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
      }`}
    >
      <Icon className="size-4" />
      {title}
    </Link>
  )
}