"use client";

import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, BookOpen, LogOut, Settings, User } from "lucide-react";

export function Navbar() {
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = api.auth.me.useQuery(undefined, { retry: false });
  const isLoggedIn = !!user;
  const { data: unread } = api.notification.unreadCount.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold text-foreground hover:opacity-80 transition-opacity"
        >
          <span className="h-9 w-9 rounded-xl bg-foreground text-background inline-flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">BookBuy</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/marketplace"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Marketplace
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/listings/new">
                <Button variant="outline" size="sm">
                  Sell
                </Button>
              </Link>

              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hidden sm:block"
              >
                Dashboard
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all"
              >
                <Bell className="h-4 w-4" />
                {unread != null && unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold hover:opacity-90 transition-opacity">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">
                      {user.name ?? "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
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
            </>
          ) : !userLoading && userError ? (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
