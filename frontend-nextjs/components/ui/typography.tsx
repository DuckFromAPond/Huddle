import { cn } from "@/lib/utils";

function ProjTitle({className, ...props} : React.ComponentProps<"h1">) { 
    return ( 
        <h1
            className={cn("font-bold", className)}
            {...props}
        />
    )
}



export { ProjTitle };
