"use client";

import { BookOpen, Clock3, Star, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types/entities";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Active Listings",
      value: stats.activeListings,
      icon: BookOpen,
      change: null,
    },
    {
      label: "Books Sold",
      value: stats.booksSold,
      icon: TrendingUp,
      change: null,
    },
    {
      label: "Seller Rating",
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}` : "N/A",
      icon: Star,
      suffix: stats.averageRating ? "/ 5" : "",
    },
    {
      label: "Pending",
      value: stats.pendingOrders,
      icon: Clock3,
      change: null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group rounded-2xl bg-card border border-border p-6 hover:border-muted-foreground/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {card.label}
              </span>
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-200">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <p className="text-4xl font-bold text-foreground tracking-tight">
                {card.value}
              </p>
              {card.suffix && (
                <span className="text-sm text-muted-foreground">{card.suffix}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
