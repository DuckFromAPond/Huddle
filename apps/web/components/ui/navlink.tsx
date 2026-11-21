import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavLink({
  title,
  url,
  icon: Icon,
  isActive,
}: {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <Link
      href={url}
      data-hover-item
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm",
        isActive
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {title}
    </Link>
  );
}
