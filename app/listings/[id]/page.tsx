"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function formatEndsAt(auctionEndsAt: Date | null) {
  if (!auctionEndsAt) return null;
  const d = new Date(auctionEndsAt);
  const now = new Date();
  if (d <= now) return "Ended";
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `Ends in ${days}d ${hours}h`;
  if (hours > 0) return `Ends in ${hours}h`;
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `Ends in ${mins}m`;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: listing, isLoading } = api.listing.getById.useQuery({ id });
  const { data: me } = api.auth.me.useQuery(undefined, { retry: false });
  const utils = api.useUtils();
  const isOwner = me && listing && listing.sellerId === me.id;
  const [bidAmount, setBidAmount] = useState("");

  const purchaseMutation = api.purchase.purchase.useMutation({
    onSuccess: () => {
      utils.listing.getById.invalidate({ id });
      router.push("/dashboard");
    },
  });
  const bidMutation = api.bid.place.useMutation({
    onSuccess: () => {
      utils.listing.getById.invalidate({ id });
      setBidAmount("");
    },
  });

  if (isLoading || !listing) {
    return (
      <div className="py-8">
        {isLoading ? <p className="text-muted-foreground">Loading…</p> : <p>Listing not found.</p>}
      </div>
    );
  }

  const isAvailable = listing.status === "AVAILABLE";
  const isAuction = listing.type === "AUCTION";
  const highBid = listing.bids[0];
  const minBid = highBid ? Number(highBid.amount) + 0.01 : Number(listing.price);
  const endsAtLabel = formatEndsAt(listing.auctionEndsAt);
  const hasEnded = listing.auctionEndsAt && new Date(listing.auctionEndsAt) <= new Date();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${listing.type === "AUCTION" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
              {listing.type}
            </span>
            <span className="text-sm text-muted-foreground">{listing.subject} · {listing.condition}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{listing.title}</h1>
          <p className="text-muted-foreground">{listing.author}</p>
          {listing.isbn && <p className="text-sm text-muted-foreground">ISBN: {listing.isbn}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">${Number(listing.price)}</span>
            {isAuction && (
              <span className="text-muted-foreground">
                {highBid ? `Current bid: $${Number(highBid.amount)}` : "Starting bid"}
              </span>
            )}
          </div>
          {isAuction && endsAtLabel && (
            <p className={hasEnded ? "text-muted-foreground" : "font-medium"}>{endsAtLabel}</p>
          )}

          <div className="flex items-center gap-2">
            <Link href={`/sellers/${listing.seller.id}`} className="text-sm text-primary hover:underline">
              {listing.seller.name ?? "Seller"}
            </Link>
            {isOwner && isAvailable && (
              <Link href={`/listings/${id}/edit`}>
                <Button variant="outline" size="sm">Edit listing</Button>
              </Link>
            )}
          </div>

          {isAvailable && isAuction && !hasEnded && (
            <div className="rounded-lg border p-4 space-y-2">
              <Label htmlFor="bid">Place a bid (min ${minBid.toFixed(2)})</Label>
              <div className="flex gap-2">
                <Input
                  id="bid"
                  type="number"
                  min={minBid}
                  step={0.01}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={minBid.toFixed(2)}
                />
                <Button
                  onClick={() => bidMutation.mutate({ listingId: id, amount: Number(bidAmount) })}
                  disabled={!bidAmount || Number(bidAmount) < minBid || bidMutation.isPending}
                >
                  {bidMutation.isPending ? "Placing…" : "Place bid"}
                </Button>
              </div>
              {bidMutation.error && (
                <p className="text-sm text-destructive">{bidMutation.error.message}</p>
              )}
            </div>
          )}

          {isAvailable && listing.type === "FIXED" && (
            <Button
              onClick={() => purchaseMutation.mutate({ listingId: id })}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? "Processing…" : "Buy now"}
            </Button>
          )}
          {purchaseMutation.error && (
            <p className="text-sm text-destructive">{purchaseMutation.error.message}</p>
          )}

          {listing.status === "SOLD" && (
            <p className="text-muted-foreground">This item has been sold.</p>
          )}
          {listing.status === "AUCTION_ENDED" && (
            <p className="text-muted-foreground">
              Auction ended.
              {highBid && ` Winner: ${highBid.user.name ?? "Highest bidder"}`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
