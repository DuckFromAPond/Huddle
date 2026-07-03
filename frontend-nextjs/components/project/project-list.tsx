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



export function ProjectList({ projects } : { projects: Project[] }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup className="gap-4">
        {projects.map((proj) => (
          <Item key={proj.name} variant="outline" role="listitem" render={<a href="#">
            <ItemMedia variant="image">
              <Image
                src={placeholderIMG}
                alt={proj.name}
                width={32}
                height={32}
                className="object-cover grayscale"
              />

              {/* REPLACE THIS IMAGE WITH LIKE A SELECT LIST OF ICONS OR SOMETHING */}
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                {proj.name} -{" "}
                {/* <span className="text-muted-foreground">{song.album}</span> */}
              </ItemTitle>
              {/* <ItemDescription>{song.artist}</ItemDescription> */}
            </ItemContent>
            <ItemContent className="flex-none text-center">
              {/* <ItemDescription>{song.duration}</ItemDescription> */}
            </ItemContent></a>} />
        ))}
      </ItemGroup>
    </div>
  )
}
