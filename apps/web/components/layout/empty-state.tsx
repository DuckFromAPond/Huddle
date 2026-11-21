import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui/typography";
type EmptyStateProps = React.ComponentProps<typeof Container> & {
  title: string;
  description?: string;
  // opional additionally children of an empty state component
  action?: React.ReactNode;
};

// blank state for when a list has nothing in it
export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <Container
      className={cn("flex flex-col items-center gap-2 py-16 text-center", className)}
      {...props}
    >
      <Heading as="h1">{title}</Heading>
      {description && <p>{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Container>
  );
}
