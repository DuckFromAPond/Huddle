'use client'

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "./sidebar";
import { Button } from "./button";
import { createProj } from "@/lib/projects";
import { useRouter } from "next/navigation";

// TODO search bar 
function Topbar({className}: React.ComponentProps<"header">) {
    const router = useRouter(); 

    function handleCreate() { 
        const newProj = { 
            id: crypto.randomUUID(), 
            name: "Untitled project", 
            desc: "",
        }; 
        createProj(newProj); 
        // create and move to new page with the proj
        router.push(`/project/${newProj.id}/summary`)
    }

    return ( 
        <header className={cn("flex items-center gap-2 border-b p-2", className)}>
            <SidebarTrigger className="m-1.5"/>
            {/* <SearchBar className="flex-1" /> */}
            <Button className="cursor-pointer" onClick={handleCreate}>
                + Create
            </Button>
        </header>
    )
}

export { Topbar };