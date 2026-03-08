"use client";

import { BookOpen, Clock3, Star, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types/entities";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Active Listings",
      value: stats.activeListings,
      icon: BookOpen,
    },
    {
      label: "Books Sold",
      value: stats.booksSold,
      icon: TrendingUp,
    },
    {
      label: "Seller Rating",
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : "N/A",
      icon: Star,
    },
    {
      label: "Pending Exchanges",
      value: stats.pendingOrders,
      icon: Clock3,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl bg-[#242424] border border-[#2e2e2e] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#a3a3a3]">
                {card.label}
              </span>
              <Icon className="h-5 w-5 text-[#4ade80]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white tracking-tight">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
