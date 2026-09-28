import Link from "next/link"

export function NavLink({
  title,
  url,
  icon: Icon,
  isActive,
}: {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}) {
  return (
    <Link
      href={url}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-sm ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
      }`}
    >
      <Icon className="size-4" />
      {title}
    </Link>
  )
}