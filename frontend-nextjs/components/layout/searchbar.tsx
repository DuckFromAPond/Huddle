'use client'

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Field } from "@/components/ui/fields"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getAllProjs } from "@/lib/projects"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { projectPath } from "@/lib/projects"
import type { Project } from "@/lib/types"

function SearchBar({ className }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Project[]>([])
  const [open, setOpen] = useState(false)
   
  const containerRef = useRef<HTMLDivElement>(null)

  // search entry  
  useEffect(() => {
    // clear search when empty 
    if (query.trim() === "") {
      setResults([])
      return
    }
    // uses a timeout to search perioodically after a change
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

  function handleSelect(proj: Project) {
    router.push(`${projectPath(proj)}/summary`)
    setQuery("")
    setResults([])
    setOpen(false)
  }
  
  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Field orientation="horizontal">
      <div className="relative w-full">
        <Input
          type="search"
          className="pr-8 [&::-webkit-search-cancel-button]:appearance-none"
          placeholder="Search projects..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      </Field>

      {open && query.trim() !== "" && (
      <div className="absolute top-full z-30 mt-2 w-full overflow-hidden rounded-[14px] border bg-popover shadow-md">
        {results.length > 0 ? (
          results.map((proj) => (
            <Button
              key={proj.id}
              variant="ghost"
              onClick={() => handleSelect(proj)}
              className="w-full justify-start rounded-none px-3 py-2.5 font-normal"
            >
              <span className="truncate">{proj.name}</span>
            </Button>
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