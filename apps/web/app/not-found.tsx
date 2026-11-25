import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Text, Title } from "@/components/ui/typography";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-content-center p-6">
      <div className="group grid justify-items-center gap-3 text-center animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
        <FileQuestion
          aria-hidden="true"
          className="size-8 text-muted-foreground transition-transform duration-300 ease-out hover:-rotate-6 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:transform-none"
        />
        <Title as="h1" className="text-lg font-medium">
          Page not found
        </Title>
        <Text className="text-sm text-muted-foreground">
          This page doesn&apos;t exist, or the link is broken.
        </Text>
        <Link
          href="/projects"
          className={buttonVariants({ variant: "secondary", className: "mt-2" })}
        >
          Back to your projects
        </Link>
      </div>
    </main>
  );
}
