'use client'

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "./sidebar";
import { MessageCircle } from "lucide-react";
import Link from "next/link"
// import { Button } from "./button";
// import { createProj } from "@/lib/projects";
// import { useRouter } from "next/navigation";

// TODO search bar 
function Topbar({className}: React.ComponentProps<"header">) {
    // const router = useRouter(); 

    // function handleCreate() { 
    //     const newProj = { 
    //         id: crypto.randomUUID(), 
    //         name: "Untitled project", 
    //         desc: "",
    //     }; 
    //     createProj(newProj); 
    //     // create and move to new page with the proj
    //     router.push(`/project/${newProj.id}/summary`)
    // }

    return ( 
        <header className={cn(
            "sticky top-0 z-20 flex items-center gap-2 border-b bg-background p-2 h-[var(--topbar-height)]",
            className
        )}> 
            <SidebarTrigger className="m-1.5"/>    
            <Link href="/" className="flex items-center gap-2 px-2">
                <div className="size-7 rounded-full bg-sidebar-primary flex items-center justify-center">
                <MessageCircle className="size-4 text-sidebar-primary-foreground" />
                </div>
                <span className="font-medium text-[15px]">Huddle</span>
            </Link>
            {/* <SearchBar className="flex-1" /> */}
            {/* <Button className="cursor-pointer" onClick={handleCreate}>
                + Create
            </Button> */}
        </header>
    )
}

export { Topbar };