import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "@/components/layout/searchbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { IdentityMenu } from "@/components/layout/identity-menu";

function Topbar({ className }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 grid h-(--topbar-height) grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-2 border-b bg-sidebar p-2",
        className,
      )}
    >
      <div className="flex items-center">
        <SidebarTrigger className="m-1.5 max-md:hidden" />
        <MobileNav className="m-1.5 md:hidden" />
        <Link href="/projects" className="flex items-center gap-2 px-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-sidebar-primary">
            <MessageCircle className="size-4 text-sidebar-primary-foreground" aria-hidden="true" />
          </span>
          <span className="text-base font-medium">Huddle</span>
        </Link>
      </div>

      <SearchBar />

      <div className="flex items-center justify-end pr-2">
        <IdentityMenu />
      </div>
    </header>
  );
}

export { Topbar };
