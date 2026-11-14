// for getting & storing projects from local storage (in place using state and useeffect)
"use client"

import { useMemo, useSyncExternalStore } from "react"
import type { Project } from "@/lib/types"

const KEY = "projects"             
const EVENT = "projects-changed"

// listens to the (local-)storage changed / for notify func called
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback) 
  window.addEventListener(EVENT, callback)     
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(EVENT, callback)
  }
}

// notify when data has been changed for react to re-render  
export function notifyProjectsChanged() {
  window.dispatchEvent(new Event(EVENT))
}

// when change is notified, re-render with new projs 
export function useProjects(): Project[] | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) ?? "[]",      // re-read data
    () => null                                    //
  )

  // parse raw to project type 
  return useMemo(() => {
    if (raw === null) return null
    try { 
      return JSON.parse(raw) as Project[] 
    } 
    catch { 
      return [] 
    }
  }, [raw])
}