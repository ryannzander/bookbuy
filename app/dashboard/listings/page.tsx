import Link from "next/link";
import { getDashboardData } from "@/lib/adapters/dashboard-data";
import { ListingsGrid } from "@/components/dashboard/listings-grid";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardListingsPage() {
  const result = await getDashboardData();

  if (result.status !== "ok") {
    return (
      <ErrorState
        title="Unable to load listings"
        description={
          result.status === "error" ? result.message : "Please sign in first."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Listings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your textbook listings
          </p>
        </div>
        <Link href="/listings/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      <ListingsGrid
        listings={result.data.recentListings}
        emptyTitle="No listings yet"
        emptyDescription="Post your first textbook listing to start selling."
      />
    </div>
  );
}
