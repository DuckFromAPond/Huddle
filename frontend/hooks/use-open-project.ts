"use client"
import { useEffect, useState } from "react"
import { openProject, type OpenProject } from "@/lib/storage/projects"

type State =
| { status: "loading" }
| { status: "not-found" }
| { status: "ready"; project: OpenProject }

export function useOpenProject(id: string): State {
    const [state, setState] = useState<State>({ status: "loading" })

    // re-render when another proj is requested to open
    useEffect(() => {
        let cancelled = false
        let opened: OpenProject | undefined

        openProject(id).then((proj) => {
            if (cancelled) { 
                // effect already cleaned up
                proj.close(); 
                return 
            }   

            // set state to the opened proj 
            opened = proj
            setState(proj.existedLocally ? { status: "ready", project: proj } : { status: "not-found" })
        })

        // clean when proj changed or unmounted
        return () => { 
            cancelled = true; 
            opened?.close() 
        }
    }, [id])

    return state
}
