import { cn } from "@/lib/utils";

function ProjTitle({className, ...props} : React.ComponentProps<"h1">) { 
    return ( 
        <h1
            className={cn("font-bold", className)}
            {...props}
        />
    )
}

// general text style for titles (other than the project title)
function Title({className, ...props} : React.ComponentProps<"h1">) { 
    return ( 
        <h1
            className={cn("font-semibold text-2xl", className)}
            {...props}
        />
    )
}

// general text style for paragraph 
function Text({className, ...props} : React.ComponentProps<"p">) { 
    return ( 
        <p
            className={cn("text-base", className)}
            {...props}
        />
    )
}



export { ProjTitle,Title,Text };
