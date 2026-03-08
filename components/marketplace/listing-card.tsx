import Link from "next/link";
import type { Listing } from "@/types/entities";

export function MarketplaceListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow block"
    >
      <div className="aspect-4/3 rounded-lg bg-muted mb-3" />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
        <span className="text-xs rounded-md bg-accent px-2 py-0.5">{listing.condition}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{listing.author}</p>
      <p className="font-semibold mt-2">${listing.price}</p>
    </Link>
  );
}
