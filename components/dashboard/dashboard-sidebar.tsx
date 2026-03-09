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
    <aside className="w-64 shrink-0 flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="text-xl font-bold text-foreground tracking-tight flex items-center gap-3 group">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground inline-flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
            <BookOpen className="h-5 w-5" />
          </span>
          <span>BuyBook</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "active-indicator flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200", 
                isActive 
                  ? "active bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />{item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-2 border-t border-border/50">
        <Link 
          href="/notifications" 
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200", 
            pathname === "/notifications" 
              ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20" 
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
          )}
        >
          <Bell className="h-5 w-5 shrink-0" />Notifications
          {unreadCount > 0 && (
            <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-2 text-xs font-bold text-primary-foreground shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <Link 
          href="/settings" 
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200", 
            pathname === "/settings" 
              ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20" 
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />Settings
        </Link>
      </div>

      <div className="p-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-5">
          <h3 className="text-base font-bold text-foreground">Sell a Textbook</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">List your textbook and connect with students.</p>
          <Link 
            href="/listings/new" 
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            <Plus className="h-4 w-4" />Create Listing
          </Link>
        </div>
      </div>
    </aside>
  );
}
