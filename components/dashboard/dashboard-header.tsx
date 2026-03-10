"use client";

import Link from "next/link";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import type { User } from "@/types/entities";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader({
  user,
  unreadCount,
  isUserLoading = false,
}: {
  user: User;
  unreadCount: number;
  isUserLoading?: boolean;
}) {
  const initials = isUserLoading
    ? "…"
    : user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="hidden sm:flex flex-1 items-center max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search books, courses, sellers..."
            className="w-full h-11 rounded-full border-2 border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* Mobile search */}
        <button
          type="button"
          aria-label="Search"
          className="sm:hidden h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all duration-200"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <ThemeToggle />
        <Link href="/settings" aria-label="Settings" className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all duration-200">
          <Settings className="h-4 w-4" />
        </Link>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full bg-card border border-border pl-1 pr-4 py-1 hover:border-muted-foreground transition-all duration-200">
              <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {isUserLoading ? "Loading..." : (user.name ?? user.email)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isUserLoading ? " " : (user.verified ? "Verified" : "Student")}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/auth/signout"
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
