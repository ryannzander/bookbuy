import { Bell, Search, Settings } from "lucide-react";
import type { User } from "@/types/entities";

export function DashboardHeader({
  user,
  unreadCount,
}: {
  user: User;
  unreadCount: number;
}) {

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[#2e2e2e] bg-[#1a1a1a]/95 backdrop-blur px-6">
      <div className="flex-1 flex items-center gap-3 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            type="search"
            placeholder="Search books, course codes, sellers..."
            className="w-full rounded-xl border border-[#2e2e2e] bg-[#242424] py-2 pl-9 pr-4 text-sm text-white placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-full bg-[#242424] border border-[#2e2e2e] flex items-center justify-center text-[#d4d4d4] hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#4ade80] px-1 text-[10px] font-semibold text-[#1a1a1a]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label="Settings"
          className="h-9 w-9 rounded-full bg-[#242424] border border-[#2e2e2e] flex items-center justify-center text-[#d4d4d4] hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </button>
        <div className="h-9 w-9 rounded-full bg-[#242424] border border-[#2e2e2e] flex items-center justify-center text-sm font-semibold text-[#4ade80]">
          {user.name?.[0] ?? user.email[0] ?? "?"}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white">
            {user.name ?? "User"}
          </p>
          <p className="text-xs text-[#a3a3a3]">Student Seller</p>
        </div>
      </div>
    </header>
  );
}
