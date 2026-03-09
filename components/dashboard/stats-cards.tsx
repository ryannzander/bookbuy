"use client";

import { BookOpen, Clock3, Star, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types/entities";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Active Listings",
      value: stats.activeListings,
      icon: BookOpen,
      gradient: "from-primary/20 to-accent/10",
      iconBg: "from-primary to-accent",
    },
    {
      label: "Books Sold",
      value: stats.booksSold,
      icon: TrendingUp,
      gradient: "from-success/20 to-success/5",
      iconBg: "from-success to-success/80",
    },
    {
      label: "Seller Rating",
      value: stats.averageRating ? `${stats.averageRating.toFixed(1)}` : "N/A",
      icon: Star,
      suffix: stats.averageRating ? "/ 5" : "",
      gradient: "from-warning/20 to-warning/5",
      iconBg: "from-warning to-warning/80",
    },
    {
      label: "Pending",
      value: stats.pendingOrders,
      icon: Clock3,
      gradient: "from-accent/20 to-primary/5",
      iconBg: "from-accent to-primary",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`group rounded-2xl bg-card border border-border p-6 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_20px_rgba(45,212,191,0.08)] transition-all duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {card.label}
              </span>
              <div className={`stats-icon bg-gradient-to-br ${card.iconBg}`}>
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
