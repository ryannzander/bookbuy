"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Clock,
  Edit,
  Flag,
  MessageSquare,
  ShoppingCart,
  Star,
  Trash2,
  User,
} from "lucide-react";

function formatEndsAt(auctionEndsAt: Date | null) {
  if (!auctionEndsAt) return null;
  const d = new Date(auctionEndsAt);
  const now = new Date();
  if (d <= now) return "Ended";
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${mins}m remaining`;
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
  const createThread = api.message.createThread.useMutation({
    onSuccess: (thread) => {
      router.push(`/messages?thread=${thread.id}`);
    },
  });
  const reportMutation = api.report.create.useMutation();
  const deleteMutation = api.listing.delete.useMutation({
    onSuccess: () => router.push("/dashboard/listings"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold text-foreground">Listing not found</p>
        <Link href="/marketplace">
          <Button variant="outline" className="mt-4">
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const isAvailable = listing.status === "AVAILABLE";
  const isAuction = listing.type === "AUCTION";
  const highBid = listing.bids[0];
  const minBid = highBid ? Number(highBid.amount) + 0.01 : Number(listing.price);
  const endsAtLabel = formatEndsAt(listing.auctionEndsAt);
  const hasEnded =
    listing.auctionEndsAt && new Date(listing.auctionEndsAt) <= new Date();
  const sellerReviewCount = listing.seller.reviewsReceived?.length ?? 0;
  const sellerAvgRating =
    sellerReviewCount > 0
      ? listing.seller.reviewsReceived.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / sellerReviewCount
      : null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Image placeholder */}
          <div className="aspect-[4/3] rounded-2xl bg-secondary flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-muted-foreground/30" />
          </div>

          {/* Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Book Details
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Author</dt>
                  <dd className="font-medium text-foreground">{listing.author}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Subject</dt>
                  <dd className="font-medium text-foreground">{listing.subject}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Condition</dt>
                  <dd className="font-medium text-foreground">{listing.condition}</dd>
                </div>
                {listing.courseCode && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Course Code</dt>
                    <dd className="font-medium text-foreground">
                      {listing.courseCode}
                    </dd>
                  </div>
                )}
                {listing.isbn && (
                  <div>
                    <dt className="text-sm text-muted-foreground">ISBN</dt>
                    <dd className="font-medium text-foreground font-mono text-sm">
                      {listing.isbn}
                    </dd>
                  </div>
                )}
                {listing.edition && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Edition</dt>
                    <dd className="font-medium text-foreground">{listing.edition}</dd>
                  </div>
                )}
              </dl>
            </div>

            {listing.description && (
              <div className="pt-6 border-t border-border">
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            {/* Type Badge */}
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  isAuction
                    ? "bg-warning/20 text-warning"
                    : "bg-secondary text-foreground"
                }`}
              >
                {isAuction ? "Auction" : "Buy Now"}
              </span>
              {listing.status === "SOLD" && (
                <span className="rounded-full px-4 py-1.5 text-sm font-medium bg-destructive/20 text-destructive">
                  Sold
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
              {listing.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">
                ${Number(listing.price)}
              </span>
              {isAuction && highBid && (
                <span className="text-muted-foreground">
                  Current bid: ${Number(highBid.amount)}
                </span>
              )}
            </div>

            {/* Auction Timer */}
            {isAuction && endsAtLabel && (
              <div
                className={`flex items-center gap-2 ${
                  hasEnded ? "text-muted-foreground" : "text-warning"
                }`}
              >
                <Clock className="h-5 w-5" />
                <span className="font-medium">{endsAtLabel}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {isAvailable && listing.type === "FIXED" && !isOwner && (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => purchaseMutation.mutate({ listingId: id })}
                  disabled={purchaseMutation.isPending}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {purchaseMutation.isPending ? "Processing..." : "Buy Now"}
                </Button>
              )}

              {isAvailable && isAuction && !hasEnded && !isOwner && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Place a bid (min ${minBid.toFixed(2)})</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={minBid}
                        step={0.01}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={minBid.toFixed(2)}
                      />
                      <Button
                        onClick={() =>
                          bidMutation.mutate({
                            listingId: id,
                            amount: Number(bidAmount),
                          })
                        }
                        disabled={
                          !bidAmount ||
                          Number(bidAmount) < minBid ||
                          bidMutation.isPending
                        }
                      >
                        {bidMutation.isPending ? "..." : "Bid"}
                      </Button>
                    </div>
                  </div>
                  {bidMutation.error && (
                    <p className="text-sm text-destructive">
                      {bidMutation.error.message}
                    </p>
                  )}
                </div>
              )}

              {!isOwner && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() =>
                    createThread.mutate({
                      otherUserId: listing.seller.id,
                      listingId: listing.id,
                    })
                  }
                  disabled={createThread.isPending}
                >
                  <MessageSquare className="h-5 w-5" />
                  Message Seller
                </Button>
              )}

              {isOwner && isAvailable && (
                <div className="flex gap-2">
                  <Link href={`/listings/${id}/edit`} className="flex-1">
                    <Button variant="outline" size="lg" className="w-full gap-2">
                      <Edit className="h-5 w-5" /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                    onClick={() => {
                      if (confirm("Delete this listing? This cannot be undone.")) {
                        deleteMutation.mutate({ id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-5 w-5" />
                    {deleteMutation.isPending ? "..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>

            {purchaseMutation.error && (
              <p className="text-sm text-destructive">
                {purchaseMutation.error.message}
              </p>
            )}

            {listing.status === "SOLD" && (
              <p className="text-muted-foreground text-center">
                This item has been sold.
              </p>
            )}

            {listing.status === "AUCTION_ENDED" && (
              <p className="text-muted-foreground text-center">
                Auction ended.
                {highBid && ` Winner: ${highBid.user.name ?? "Highest bidder"}`}
              </p>
            )}
          </div>

          {/* Seller Card */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Seller</h3>
            <Link
              href={`/sellers/${listing.seller.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
                {listing.seller.name?.[0]?.toUpperCase() ?? <User className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {listing.seller.name ?? "Seller"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {sellerAvgRating != null ? (
                    <>
                      <Star className="h-4 w-4 fill-current" />
                      <span>
                        {sellerAvgRating.toFixed(1)} ({sellerReviewCount} reviews)
                      </span>
                    </>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                </div>
              </div>
            </Link>

            {!isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-muted-foreground hover:text-destructive"
                onClick={() =>
                  reportMutation.mutate({
                    targetUserId: listing.seller.id,
                    listingId: listing.id,
                    reason: "Suspicious listing",
                  })
                }
                disabled={reportMutation.isPending || reportMutation.isSuccess}
              >
                <Flag className="h-4 w-4" />
                {reportMutation.isSuccess ? "Reported" : "Report Listing"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
