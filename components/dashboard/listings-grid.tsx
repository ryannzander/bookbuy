"use client";

import Link from "next/link";
import type { Listing } from "@/types/entities";
import { EmptyState } from "@/components/shared/empty-state";

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
    return (
      <div className="rounded-2xl border border-[#2e2e2e] bg-[#242424]/50 p-4">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="rounded-2xl bg-[#242424] border border-[#2e2e2e] overflow-hidden flex flex-col"
        >
          <div className="aspect-4/3 bg-[#2e2e2e] flex items-center justify-center">
            <span className="text-4xl text-[#a3a3a3]/50">📚</span>
          </div>
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white line-clamp-2">
                {listing.title}
              </h3>
              <span className="shrink-0 rounded-lg bg-[#4ade80]/20 px-2 py-0.5 text-xs font-medium text-[#4ade80]">
                {listing.condition}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#a3a3a3]">{listing.author}</p>
            <p className="mt-2 text-lg font-bold text-white">
              ${Number(listing.price)}
            </p>
            <p className="mt-1 text-xs text-[#a3a3a3]">
              Listed {new Date(listing.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-2 text-xs text-[#a3a3a3] line-clamp-2">
              {listing.courseCode ?? listing.subject} · {listing.type}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/listings/${listing.id}`}
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#4ade80] px-4 py-2 text-sm font-semibold text-[#4ade80] hover:bg-[#4ade80] hover:text-[#1a1a1a] transition-colors"
              >
                View Details
              </Link>
              <Link
                href={`/listings/${listing.id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-[#2e2e2e] px-3 py-2 text-sm text-[#d4d4d4] hover:text-white hover:border-[#3a3a3a]"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
