// hooks/use-projects.ts
"use client"
import { useMemo, useSyncExternalStore } from "react"
import type { Project } from "@/lib/types"

const KEY = "projects" // use the key getAllProjs / getProjBySlug actually read
const EVENT = "projects-changed"

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback) // other tabs
  window.addEventListener(EVENT, callback)     // this tab
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(EVENT, callback)
  }
}

export function notifyProjectsChanged() {
  window.dispatchEvent(new Event(EVENT))
}

export function useProjects(): Project[] | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) ?? "[]", // string, so the snapshot is stable
    () => null                               // server
  )
  return useMemo(() => {
    if (raw === null) return null
    try { return JSON.parse(raw) as Project[] } catch { return [] }
  }, [raw])
}