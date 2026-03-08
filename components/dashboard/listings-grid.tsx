"use client";

import Link from "next/link";
import type { Listing } from "@/types/entities";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { BookOpen, Edit, Eye } from "lucide-react";

export function ListingsGrid({
  listings,
  emptyTitle,
  emptyDescription,
}: {
  listings: Listing[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (listings.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="group rounded-2xl bg-card border border-border overflow-hidden flex flex-col hover:border-muted-foreground/30 transition-all duration-200"
        >
          {/* Image placeholder */}
          <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                {listing.title}
              </h3>
              <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                {listing.condition}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
              {listing.author}
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                ${Number(listing.price)}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{listing.courseCode ?? listing.subject}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span>{listing.type}</span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Listed {new Date(listing.createdAt).toLocaleDateString()}
            </p>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
              <Link href={`/listings/${listing.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </Link>
              <Link href={`/listings/${listing.id}/edit`} className="flex-1">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
