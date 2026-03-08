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
  const { data: unreadCount = 0 } = api.notification.unreadCount.useQuery(undefined, {
    retry: false,
    enabled: !!me,
  });

  if (isAuthRoute || isApiRoute) {
    return <>{children}</>;
  }

  const fallbackUser: User = {
    id: "guest",
    name: "Guest User",
    username: "guest",
    email: "guest@buybook.local",
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
    <div className="dashboard-theme min-h-screen flex bg-[#1a1a1a] text-white antialiased">
      <div className="hidden lg:flex">
        <DashboardSidebar unreadCount={unreadCount} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} unreadCount={unreadCount} />
        <nav className="lg:hidden border-b border-border bg-background/95 px-3 py-2">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
            <Link href="/dashboard" className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground">Dashboard</Link>
            <Link href="/marketplace" className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground">Marketplace</Link>
            <Link href="/dashboard/orders" className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground">Orders</Link>
            <Link href="/messages" className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground">Messages</Link>
            <Link href="/notifications" className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground">Alerts {unreadCount > 0 ? `(${unreadCount})` : ""}</Link>
            <Link href="/settings" className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground">Settings</Link>
          </div>
        </nav>
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
