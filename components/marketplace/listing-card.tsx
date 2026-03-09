import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Listing } from "@/types/entities";

export function MarketplaceListingCard({ listing }: { listing: Listing }) {
  const conditionClass = listing.condition === 'Like New' 
    ? 'condition-excellent' 
    : listing.condition === 'Good' 
      ? 'condition-good' 
      : listing.condition === 'Acceptable' 
        ? 'condition-fair' 
        : 'condition-poor';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_20px_rgba(139,92,246,0.05)] transition-all duration-300 hover-lift block"
    >
      <div className="aspect-[4/3] bg-secondary flex items-center justify-center overflow-hidden img-zoom">
        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{listing.title}</h3>
          <span className="flex items-center gap-1.5 text-xs rounded-full bg-secondary/80 px-2.5 py-1 text-muted-foreground shrink-0">
            <span className={`condition-dot ${conditionClass}`} />
            {listing.condition}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{listing.author}</p>
        <p className="font-bold text-xl mt-3 gradient-text">${listing.price}</p>
      </div>
    </Link>
  );
}
