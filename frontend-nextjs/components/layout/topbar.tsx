'use client'

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageCircle, Plus } from "lucide-react";
import Link from "next/link"
import { SearchBar } from "@/components/layout/searchbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createProj, projectPath } from "@/lib/projects";

// FIXME maybe move create to the top bar 
function Topbar({className}: React.ComponentProps<"header">) {
    const router = useRouter(); 

     // create new project 
    function handleCreate() {
        const newProj = createProj("Untitled project")
        router.push(`${projectPath(newProj)}/summary`)
    }

    return ( 
        <header className={cn(
            "sticky top-0 z-20 grid grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-2 border-b bg-background p-2 h-[var(--topbar-height)]",
            className
        )}> 
            <div className="flex items-center">
                <SidebarTrigger className="m-1.5"/>    
           
                <Link href="/" className="flex items-center gap-2 px-2">
                    <div className="size-7 rounded-full bg-sidebar-primary flex items-center justify-center">
                    <MessageCircle className="size-4 text-sidebar-primary-foreground" />
                    </div>
                    <span className="font-medium text-[15px]">Huddle</span>
                </Link>
            </div>
            
            <div className="flex items-center">
                <SearchBar className="flex-1" />
                <Button
                    onClick={handleCreate}
                    className="ml-2 rounded-[14px] bg-sidebar-primary cursor-pointer text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">New project</span>
                </Button>
            </div>

            <div className="flex items-center justify-end">
                {/* TODO theme toggle */}
            </div>
        </header>
    )
}

export { Topbar };