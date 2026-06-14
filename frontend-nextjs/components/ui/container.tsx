import { cn } from "@/lib/utils"

export function Container({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
        data-slot="container"
        className={cn(
            "flex flex-1 flex-col rounded-md bg-background p-4",
            className
        )}
        {...props}
        />
  )
}