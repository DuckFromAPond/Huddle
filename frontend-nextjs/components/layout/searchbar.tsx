'use client'

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Field } from "@/components/ui/fields"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getAllProjs } from "@/lib/projects"
import type { Project } from "@/lib/types"

function SearchBar({ className }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Project[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim() === "") {
      setResults([])
      return
    }
    const timeout = setTimeout(() => {
      const matches = getAllProjs().filter((proj) =>
        proj.name.toLowerCase().includes(query.toLowerCase())
      )
      setResults(matches.slice(0, 6))
    }, 150)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(id: string) {
    router.push(`/p/${id}`)
    setQuery("")
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Field orientation="horizontal">
        <Input
          type="search"
          placeholder="Search projects..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
      </Field>

      {open && query.trim() !== "" && (
        <div className="absolute top-full mt-2 w-full bg-popover border rounded-[14px] shadow-md overflow-hidden z-30">
          {results.length > 0 ? (
            results.map((proj) => (
              <button
                key={proj.id}
                onClick={() => handleSelect(proj.id)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-sidebar-accent/50 truncate"
              >
                {proj.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2.5 text-sm text-muted-foreground">
              No projects found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { SearchBar }