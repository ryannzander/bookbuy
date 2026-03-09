"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, List, MessageSquare, Gavel, Bell, ArrowRightLeft,
  Flag, Trophy, Settings, Plus, Heart, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: BookOpen },
  { href: "/dashboard/listings", label: "My Listings", icon: List },
  { href: "/dashboard/orders", label: "Orders", icon: ArrowRightLeft },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/wishlist", label: "Saved Books", icon: Heart },
  { href: "/courses", label: "My Courses", icon: GraduationCap },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/reports", label: "Reports", icon: Flag },
] as const;

export function DashboardSidebar({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-card h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="h-9 w-9 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-foreground">BookBuy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", 
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-3 border-t border-border space-y-1">
        <Link 
          href="/notifications" 
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", 
            pathname === "/notifications" 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Bell className="h-4 w-4 shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <Link 
          href="/settings" 
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", 
            pathname === "/settings" 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>

      {/* CTA Card */}
      <div className="p-3">
        <div className="rounded-xl bg-secondary/50 border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Sell a Textbook</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">List your books and connect with buyers.</p>
          <Link 
            href="/listings/new" 
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Listing
          </Link>
        </div>
      </div>
    </aside>
  );
}
