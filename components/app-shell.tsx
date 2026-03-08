"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { User } from "@/types/entities";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");
  const isApiRoute = pathname?.startsWith("/api");
  const { data: me } = api.auth.me.useQuery(undefined, { retry: false });
  const { data: unreadCount = 0 } = api.notification.unreadCount.useQuery(
    undefined,
    {
      retry: false,
      enabled: !!me,
    }
  );

  if (isAuthRoute || isApiRoute) {
    return <>{children}</>;
  }

  const fallbackUser: User = {
    id: "guest",
    name: "Guest User",
    username: "guest",
    email: "guest@bookbuy.local",
    avatarUrl: null,
    schoolName: null,
    verified: false,
    createdAt: new Date().toISOString(),
  };

  const user: User = me
    ? {
        id: me.id,
        name: me.name ?? null,
        username: (me.name ?? me.email.split("@")[0]).toLowerCase(),
        email: me.email,
        avatarUrl: me.avatarUrl ?? null,
        schoolName: me.schoolName ?? null,
        verified: me.verified,
        createdAt: me.createdAt.toISOString(),
      }
    : fallbackUser;

  return (
    <div className="min-h-screen flex bg-background text-foreground antialiased">
      <div className="hidden lg:flex">
        <DashboardSidebar unreadCount={unreadCount} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} unreadCount={unreadCount} />
        <nav className="lg:hidden border-b border-border bg-card px-4 py-3">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/marketplace", label: "Marketplace" },
              { href: "/dashboard/orders", label: "Orders" },
              { href: "/messages", label: "Messages" },
              { href: "/notifications", label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
              { href: "/settings", label: "Settings" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                  pathname === item.href
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
