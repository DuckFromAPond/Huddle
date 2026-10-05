import Link from "next/link"
import Image from "next/image"
import placeholderIMG from "@/public/vercel.svg"
import { projectPath } from "@/lib/projects"
import type { Project } from "@/lib/types"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

// for home page showing proj list
export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <ItemGroup className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
        {projects.map((proj) => (
          <Item
            className="py-4 bg-card transition-colors hover:bg-muted"
            key={proj.id}
            variant="outline"
            role="listitem"
            render={
              <Link href={projectPath(proj)}>
                <ItemMedia variant="image">
                  <Image
                    src={placeholderIMG}
                    alt={proj.name}
                    width={32}
                    height={32}
                    className="object-cover grayscale"
                  />
                  {/* TODO REPLACE THIS IMAGE WITH LIKE A SELECT LIST OF ICONS OR SOMETHING */}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">{proj.name}</ItemTitle>
                  <ItemDescription>{proj.desc}</ItemDescription>
                </ItemContent>
              </Link>
            }
          />
        ))}
      </ItemGroup>
    </div>
  )
}