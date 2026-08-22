import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectListSkeleton() {
  return (
    <Container className="p-6 pt-2">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </Container>
  );
}