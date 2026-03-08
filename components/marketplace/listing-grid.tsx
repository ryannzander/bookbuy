import type { Listing } from "@/types/entities";
import { MarketplaceListingCard } from "@/components/marketplace/listing-card";
import { EmptyState } from "@/components/shared/empty-state";

export function MarketplaceListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description="Try adjusting your search or filters."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <MarketplaceListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
