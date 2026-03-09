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
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-xl font-bold text-foreground transition-all"
        >
          <span className="h-9 w-9 rounded-xl bg-primary/20 text-primary inline-flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">BookBuy</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/marketplace"
            className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-4/5"
          >
            Marketplace
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/listings/new">
                <Button variant="primary" size="sm">
                  Sell
                </Button>
              </Link>

              <Link
                href="/dashboard"
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 hidden sm:block after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-4/5"
              >
                Dashboard
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary/80 transition-all"
              >
                <Bell className="h-4 w-4" />
                {unread != null && unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-1.5 text-[10px] font-bold text-primary-foreground animate-pulse">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold hover:bg-primary/90 transition-all">
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
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
