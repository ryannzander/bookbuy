"use client";

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
        schoolName: null,
        verified: true,
        createdAt: me.createdAt.toISOString(),
      }
    : fallbackUser;

  return (
    <div className="dashboard-theme min-h-screen flex bg-[#1a1a1a] text-white antialiased">
      <DashboardSidebar unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} unreadCount={unreadCount} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
