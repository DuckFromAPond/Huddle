import { cn } from "@/lib/utils";

/*
 * The only place text styles are defined. Pages pick a component, never a size.
 * `as` changes the HTML tag (for correct heading levels) without changing the look.
 */

type HeadingTag = "h1" | "h2" | "h3" | "h4";
type HeadingProps = React.ComponentProps<"h1"> & { as?: HeadingTag };

/** Page title, e.g. "Projects", "Settings". */
function Title({ as: Tag = "h1", className, ...props }: HeadingProps) {
  return <Tag className={cn("text-2xl font-semibold tracking-tight", className)} {...props} />;
}

/** A project's name on its board: the one place the serif appears. */
function ProjTitle({ as: Tag = "h1", className, ...props }: HeadingProps) {
  return <Tag className={cn("font-serif text-2xl font-medium", className)} {...props} />;
}

/** Section and card titles. */
function Heading({ as: Tag = "h2", className, ...props }: HeadingProps) {
  return <Tag className={cn("text-base font-semibold", className)} {...props} />;
}

/** Body text: descriptions, longer copy. */
function Text({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-base", className)} {...props} />;
}

/** Secondary text: metadata, hints, empty-state descriptions. */
function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Title, ProjTitle, Heading, Text, Muted };
