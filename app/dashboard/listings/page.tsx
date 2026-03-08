import { getDashboardData } from "@/lib/adapters/dashboard-data";
import { ListingsGrid } from "@/components/dashboard/listings-grid";
import { ErrorState } from "@/components/shared/error-state";

export default async function DashboardListingsPage() {
  const result = await getDashboardData();
  if (result.status !== "ok") {
    return (
      <ErrorState
        title="Unable to load listings"
        description={result.status === "error" ? result.message : "Please sign in first."}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">My Listings</h1>
      <ListingsGrid
        listings={result.data.recentListings}
        emptyTitle="No listings yet"
        emptyDescription="Post your first textbook listing to start selling."
      />
    </div>
  );
}
