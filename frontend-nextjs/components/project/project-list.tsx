import Image from "next/image"
import placeholderIMG from "@/public/vercel.svg"
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

export function ProjectList({ projects } : { projects: Project[] }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <ItemGroup className="grid grid-cols-2 gap-4">
        {projects.map((proj) => (
          <Item className=" py-4" key={proj.name} variant="outline" role="listitem" render={<a href={`/projects/${proj.id}`}>
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
              <ItemTitle className="line-clamp-1">
                {proj.name}
              </ItemTitle>
              <ItemDescription>{proj.desc}</ItemDescription>
            </ItemContent>
            </a>} 
          />
        ))}
      </ItemGroup>
    </div>
  )
}
