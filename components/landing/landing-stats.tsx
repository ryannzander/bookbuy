"use client";

import { api } from "@/lib/trpc/client";

export function LandingStats() {
  const { data, isLoading } = api.analytics.landingStats.useQuery(undefined, {
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return (
      <div className="mt-16 flex flex-wrap gap-12 sm:gap-16">
        <div>
          <p className="text-4xl sm:text-5xl font-bold text-foreground">—</p>
          <p className="mt-1 text-sm text-muted-foreground">Active Listings</p>
        </div>
        <div>
          <p className="text-4xl sm:text-5xl font-bold text-foreground">—</p>
          <p className="mt-1 text-sm text-muted-foreground">Verified Students</p>
        </div>
        <div>
          <p className="text-4xl sm:text-5xl font-bold text-foreground">—</p>
          <p className="mt-1 text-sm text-muted-foreground">Saved by Students</p>
        </div>
      </div>
    );
  }

  const formatSaved = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}K+` : n > 0 ? `$${n}+` : "$0";

  return (
    <div className="mt-16 flex flex-wrap gap-12 sm:gap-16">
      <div>
        <p className="text-4xl sm:text-5xl font-bold text-foreground">
          {data.activeListings}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Active Listings</p>
      </div>
      <div>
        <p className="text-4xl sm:text-5xl font-bold text-foreground">
          {data.verifiedStudents}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Verified Students</p>
      </div>
      <div>
        <p className="text-4xl sm:text-5xl font-bold text-foreground">
          {formatSaved(data.totalSaved)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Saved by Students</p>
      </div>
    </div>
  );
}
