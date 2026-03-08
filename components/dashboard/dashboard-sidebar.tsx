"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  List,
  MessageSquare,
  Gavel,
  Bell,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Marketplace", icon: BookOpen },
  { href: "/dashboard/listings", label: "My Listings", icon: List },
  { href: "/dashboard/orders", label: "Orders", icon: ArrowRightLeft },
  { href: "/notifications", label: "Messages", icon: MessageSquare },
  { href: "/", label: "Auctions", icon: Gavel },
] as const;

export function DashboardSidebar({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-[#2e2e2e] bg-[#1a1a1a]">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="h-8 w-8 rounded-xl bg-[#4ade80] text-[#1a1a1a] inline-flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </span>
          BookBuy
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#242424] text-[#4ade80]"
                  : "text-[#a3a3a3] hover:bg-[#242424] hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Link
          href="/notifications"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#a3a3a3] hover:bg-[#242424] hover:text-white transition-colors"
        >
          <Bell className="h-5 w-5 shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#4ade80] px-1.5 text-xs font-semibold text-[#1a1a1a]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
      <div className="p-4">
        <div className="rounded-2xl bg-[#242424] border border-[#2e2e2e] p-4">
          <p className="text-sm font-semibold text-white">Create a new listing</p>
          <p className="mt-1 text-xs text-[#a3a3a3]">
            Post your textbook and connect with students looking for your course materials.
          </p>
          <Link
            href="/listings/new"
            className="mt-3 flex items-center justify-center rounded-xl bg-[#4ade80] px-3 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#22c55e] transition-colors"
          >
            List a Book
          </Link>
        </div>
      </div>
    </aside>
  );
}
