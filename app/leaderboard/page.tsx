"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardPage() {
  const { data, isLoading } = api.seller.getLeaderboard.useQuery({ limit: 20 });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading leaderboard...</p>;
  }

  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Top Sellers Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by review quality, completed sales, and reputation.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No leaderboard data yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((seller, index) => (
            <Card key={seller.id} className={index < 3 ? "border-primary/40" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-primary/15 px-2 text-sm font-bold text-primary">
                      #{index + 1}
                    </span>
                    <Link href={`/sellers/${seller.id}`} className="hover:text-primary">
                      {seller.name ?? "Seller"}
                    </Link>
                    {seller.verified && (
                      <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                        Verified
                      </span>
                    )}
                  </span>
                  {index === 0 && <Trophy className="h-4 w-4 text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground grid gap-2 sm:grid-cols-4">
                <p>Rating: {seller.averageRating.toFixed(1)} / 5</p>
                <p>Reviews: {seller.reviewCount}</p>
                <p>Sales: {seller.salesCount}</p>
                <p>Active listings: {seller.activeListings}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
