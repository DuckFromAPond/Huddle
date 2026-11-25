"use client"; // error boundaries run in the browser

import { useEffect } from "react";
import Link from "next/link";
import { Copy, RotateCcw, TriangleAlert } from "lucide-react";
import { Text, Title } from "@/components/ui/typography";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error); // keep the stack trace for debugging
  }, [error]);

  const reference = error.digest ?? error.name; // server ID if there is one, otherwise e.g. "NotFoundError"

  function copyDetails() {
    void navigator.clipboard.writeText(
      [error.name, error.message, error.digest && `digest: ${error.digest}`, error.stack]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return (
    <div role="alert" className="grid min-h-svh place-content-center p-6">
      <div className="grid justify-items-center gap-3 text-center animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
        <TriangleAlert
          aria-hidden="true"
          className="size-8 text-muted-foreground transition-transform duration-300 ease-out hover:-rotate-6 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:transform-none"
        />
        <Title as="h1" className="text-lg font-medium">
          Something went wrong
        </Title>
        <Text className="text-sm text-muted-foreground">
          Your projects are saved on this device, so nothing is lost.
        </Text>

        <div className="flex items-center gap-2">
          <Text className="font-mono text-xs text-muted-foreground">Reference: {reference}</Text>
          <Button variant="ghost" size="sm" onClick={copyDetails}>
            <Copy aria-hidden="true" /> Copy details
          </Button>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={reset} variant={"secondary"} className="group/btn">
            <RotateCcw
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/btn:-rotate-180 motion-reduce:transition-none motion-reduce:group-hover/btn:transform-none"
            />
            Try again
          </Button>
          <Link href="/projects" className={buttonVariants({ variant: "default" })}>
            Back to your projects
          </Link>
        </div>
      </div>
    </div>
  );
}
