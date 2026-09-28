import Link from "next/link";
import type { CurrentUser } from "@/lib/auth/current-user";
import { NavLinks, type NavItem } from "./nav-links";

export function AppHeader({ user }: { user: CurrentUser }) {
  const roleLabel = user.isLead ? "Team lead" : "Specialist";
  const navItems: NavItem[] = [];
  if (user.isLead) navItems.push({ href: "/queue", label: "Review queue" });

  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-8 px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Reply Review
        </Link>
        <NavLinks items={navItems} />
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="font-medium">{user.fullName}</p>
            <p className="text-caption text-secondary">{roleLabel}</p>
          </div>
          <Link href="/switch" className="btn btn-ghost btn-sm">
            Switch user
          </Link>
        </div>
      </div>
    </header>
  );
}
