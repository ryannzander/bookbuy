"use client";

import Link from "next/link";
import { Trophy, TrendingUp, BookOpen, Shield } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { EmptyState } from "@/components/shared/empty-state";

export default function LeaderboardPage() {
  const { data, isLoading } = api.seller.getLeaderboard.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          Loading leaderboard...
        </div>
      </div>
    );
  }

  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-foreground text-background mb-4">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Top Sellers</h1>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Ranked by completed sales and reputation
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No leaderboard data yet"
          description="Start selling to appear on the leaderboard."
        />
      ) : (
        <div className="space-y-4">
          {rows.map((seller, index) => {
            const isTop3 = index < 3;
            const rankColors = [
              "bg-yellow-500/20 text-yellow-500",
              "bg-gray-300/20 text-gray-300",
              "bg-amber-600/20 text-amber-600",
            ];

            return (
              <div
                key={seller.id}
                className={`rounded-2xl border bg-card p-6 transition-all duration-200 hover:border-muted-foreground/30 ${
                  isTop3 ? "border-foreground/30" : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                      isTop3
                        ? rankColors[index]
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold shrink-0">
                    {seller.name?.[0]?.toUpperCase() ?? "S"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/sellers/${seller.id}`}
                        className="text-lg font-semibold text-foreground hover:underline"
                      >
                        {seller.name ?? "Seller"}
                      </Link>
                      {seller.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                          <Shield className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                      {index === 0 && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" />
                        {seller.salesCount} sales
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        {seller.activeListings} active
                      </span>
                    </div>
                  </div>

                  {/* View Profile */}
                  <Link
                    href={`/sellers/${seller.id}`}
                    className="hidden sm:inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
