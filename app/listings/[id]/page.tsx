"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen, Clock, CreditCard, Edit, Flag, Heart, MessageSquare, ShoppingCart, Star,
  Trash2, User, Bell, BellOff, ChevronLeft, ChevronRight, TrendingDown, Share2, Copy, Check, Zap,
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
  return `${Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))}m remaining`;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: listing, isLoading } = api.listing.getById.useQuery({ id });
  const { data: me } = api.auth.me.useQuery(undefined, { retry: false });
  const { data: isSaved } = api.wishlist.isSaved.useQuery({ listingId: id }, { retry: false });
  const { data: priceHistory } = api.price.getHistory.useQuery({ listingId: id });
  const { data: priceAlert } = api.price.getAlert.useQuery({ listingId: id }, { retry: false });
  const { data: similar } = api.listing.getSimilar.useQuery({ listingId: id, limit: 4 });
  const utils = api.useUtils();
  const isOwner = me && listing && listing.sellerId === me.id;
  const [bidAmount, setBidAmount] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const purchaseMutation = api.purchase.purchase.useMutation({ onSuccess: () => { utils.listing.getById.invalidate({ id }); router.push("/dashboard"); } });
  const bidMutation = api.bid.place.useMutation({ onSuccess: () => { utils.listing.getById.invalidate({ id }); setBidAmount(""); } });
  const createThread = api.message.createThread.useMutation({ onSuccess: (t) => router.push(`/messages?thread=${t.id}`) });
  const reportMutation = api.report.create.useMutation();
  const deleteMutation = api.listing.delete.useMutation({ onSuccess: () => router.push("/dashboard/listings") });
  const wishlistToggle = api.wishlist.toggle.useMutation({ onSuccess: () => utils.wishlist.isSaved.invalidate({ listingId: id }) });
  const setAlert = api.price.setAlert.useMutation({ onSuccess: () => { utils.price.getAlert.invalidate({ listingId: id }); setAlertPrice(""); } });
  const removeAlert = api.price.removeAlert.useMutation({ onSuccess: () => utils.price.getAlert.invalidate({ listingId: id }) });
  const purchaseCheckout = api.stripe.createPurchaseCheckout.useMutation({ onSuccess: (d) => { if (d.url) window.location.href = d.url; } });
  const boostCheckout = api.stripe.createBoostCheckout.useMutation({ onSuccess: (d) => { if (d.url) window.location.href = d.url; } });

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: listing?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />Loading...</div></div>;
  if (!listing) return <div className="text-center py-20"><p className="text-lg font-semibold text-foreground">Listing not found</p><Link href="/marketplace"><Button variant="outline" className="mt-4">Back to Marketplace</Button></Link></div>;

  const isAvailable = listing.status === "AVAILABLE";
  const isAuction = listing.type === "AUCTION";
  const highBid = listing.bids[0];
  const minBid = highBid ? Number(highBid.amount) + 0.01 : Number(listing.price);
  const endsAtLabel = formatEndsAt(listing.auctionEndsAt);
  const hasEnded = listing.auctionEndsAt && new Date(listing.auctionEndsAt) <= new Date();
  const sellerReviewCount = listing.seller.reviewsReceived?.length ?? 0;
  const sellerAvgRating = sellerReviewCount > 0 ? listing.seller.reviewsReceived.reduce((s, r) => s + r.rating, 0) / sellerReviewCount : null;
  const images: string[] = listing.imageUrls ? (() => { try { return JSON.parse(listing.imageUrls); } catch { return []; } })() : [];
  const daysSinceUpdate = Math.floor((Date.now() - new Date(listing.updatedAt).getTime()) / (24 * 60 * 60 * 1000));
  const isExpiringSoon = isAvailable && daysSinceUpdate >= 75;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Image Gallery */}
          {images.length > 0 ? (
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary">
                <img src={images[imgIdx]} alt={listing.title} className="h-full w-full object-cover" />
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"><ChevronRight className="h-5 w-5" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">{images.map((_, i) => <button key={i} onClick={() => setImgIdx(i)} className={`h-2 w-2 rounded-full transition-colors ${i === imgIdx ? "bg-foreground" : "bg-foreground/30"}`} />)}</div>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-2xl bg-secondary flex items-center justify-center"><BookOpen className="h-20 w-20 text-muted-foreground/30" /></div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Book Details</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {[["Author", listing.author], ["Subject", listing.subject], ["Condition", listing.condition], ...(listing.courseCode ? [["Course Code", listing.courseCode]] : []), ...(listing.isbn ? [["ISBN", listing.isbn]] : []), ...(listing.edition ? [["Edition", listing.edition]] : [])].map(([label, val]) => (
                  <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium text-foreground">{val}</dd></div>
                ))}
              </dl>
            </div>
            {listing.description && <div className="pt-6 border-t border-border"><h2 className="text-lg font-semibold text-foreground mb-3">Description</h2><p className="text-muted-foreground leading-relaxed">{listing.description}</p></div>}
          </div>

          {/* Price History */}
          {priceHistory && priceHistory.length > 1 && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><TrendingDown className="h-5 w-5" /> Price History</h2>
              <div className="flex items-end gap-1 h-24">
                {priceHistory.map((entry) => {
                  const prices = priceHistory.map((e) => Number(e.price));
                  const max = Math.max(...prices), min = Math.min(...prices), range = max - min || 1;
                  return <div key={entry.id} className="flex-1"><div className="w-full rounded-t bg-foreground/20 hover:bg-foreground/40 transition-colors" style={{ height: `${((Number(entry.price) - min) / range) * 80 + 20}%` }} title={`$${Number(entry.price)} - ${new Date(entry.createdAt).toLocaleDateString()}`} /></div>;
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>{new Date(priceHistory[0].createdAt).toLocaleDateString()}</span><span>{new Date(priceHistory[priceHistory.length - 1].createdAt).toLocaleDateString()}</span></div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${isAuction ? "bg-warning/20 text-warning" : "bg-secondary text-foreground"}`}>{isAuction ? "Auction" : "Buy Now"}</span>
                {listing.status === "SOLD" && <span className="rounded-full px-4 py-1.5 text-sm font-medium bg-destructive/20 text-destructive">Sold</span>}
                {isExpiringSoon && <span className="rounded-full px-3 py-1 text-xs font-medium bg-warning/20 text-warning">Expires in {90 - daysSinceUpdate}d</span>}
              </div>
              <button onClick={handleShare} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                {copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
              </button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">{listing.title}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">${Number(listing.price)}</span>
              {isAuction && highBid && <span className="text-muted-foreground">Current bid: ${Number(highBid.amount)}</span>}
            </div>
            {isAuction && endsAtLabel && <div className={`flex items-center gap-2 ${hasEnded ? "text-muted-foreground" : "text-warning"}`}><Clock className="h-5 w-5" /><span className="font-medium">{endsAtLabel}</span></div>}

            <div className="space-y-3">
              {isAvailable && listing.type === "FIXED" && !isOwner && (
                <>
                  <div className="flex gap-2">
                    <Button size="lg" className="flex-1 gap-2" onClick={() => purchaseMutation.mutate({ listingId: id })} disabled={purchaseMutation.isPending}><ShoppingCart className="h-5 w-5" />{purchaseMutation.isPending ? "..." : "Pay in person"}</Button>
                    <Button size="lg" variant="secondary" className="flex-1 gap-2" onClick={() => purchaseCheckout.mutate({ listingId: id })} disabled={purchaseCheckout.isPending}><CreditCard className="h-5 w-5" />{purchaseCheckout.isPending ? "..." : "Pay with card"}</Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Card payments include a small platform fee; seller receives the rest.</p>
                </>
              )}
              {isAvailable && isAuction && !hasEnded && !isOwner && (
                <div className="space-y-3">
                  <div className="space-y-2"><Label>Place a bid (min ${minBid.toFixed(2)})</Label><div className="flex gap-2"><Input type="number" min={minBid} step={0.01} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={minBid.toFixed(2)} /><Button onClick={() => bidMutation.mutate({ listingId: id, amount: Number(bidAmount) })} disabled={!bidAmount || Number(bidAmount) < minBid || bidMutation.isPending}>{bidMutation.isPending ? "..." : "Bid"}</Button></div></div>
                  {bidMutation.error && <p className="text-sm text-destructive">{bidMutation.error.message}</p>}
                </div>
              )}
              {!isOwner && me && (
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" className="flex-1 gap-2" onClick={() => createThread.mutate({ otherUserId: listing.seller.id, listingId: listing.id })} disabled={createThread.isPending}><MessageSquare className="h-5 w-5" />Message</Button>
                  <Button variant="outline" size="lg" onClick={() => wishlistToggle.mutate({ listingId: id })} disabled={wishlistToggle.isPending} className={`gap-2 ${isSaved ? "text-destructive border-destructive/30" : ""}`}><Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} /></Button>
                </div>
              )}
              {isOwner && isAvailable && (
                <>
                  <div className="flex gap-2">
                    <Link href={`/listings/${id}/edit`} className="flex-1"><Button variant="outline" size="lg" className="w-full gap-2"><Edit className="h-5 w-5" /> Edit</Button></Link>
                    <Button variant="destructive" size="lg" className="gap-2" onClick={() => { if (confirm("Delete this listing?")) deleteMutation.mutate({ id }); }} disabled={deleteMutation.isPending}><Trash2 className="h-5 w-5" />{deleteMutation.isPending ? "..." : "Delete"}</Button>
                  </div>
                  <Button variant="outline" size="lg" className="w-full gap-2" onClick={() => boostCheckout.mutate({ listingId: id })} disabled={boostCheckout.isPending}><Zap className="h-5 w-5" />{boostCheckout.isPending ? "..." : "Boost listing ($2.99 for 14 days)"}</Button>
                </>
              )}
            </div>
            {purchaseMutation.error && <p className="text-sm text-destructive">{purchaseMutation.error.message}</p>}
            {listing.status === "SOLD" && <p className="text-muted-foreground text-center">This item has been sold.</p>}
            {listing.status === "AUCTION_ENDED" && <p className="text-muted-foreground text-center">Auction ended.{highBid && ` Winner: ${highBid.user.name ?? "Highest bidder"}`}</p>}
          </div>

          {/* Price Alert */}
          {!isOwner && me && isAvailable && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell className="h-5 w-5" /> Price Alert</h3>
              {priceAlert ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Notify when price drops to <span className="font-bold text-foreground">${Number(priceAlert.targetPrice)}</span></p>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => removeAlert.mutate({ listingId: id })}><BellOff className="h-4 w-4" /> Remove</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Get notified when price drops</p>
                  <div className="flex gap-2"><Input type="number" step={0.01} min={0.01} value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder="Target price" /><Button onClick={() => setAlert.mutate({ listingId: id, targetPrice: Number(alertPrice) })} disabled={!alertPrice || Number(alertPrice) <= 0}><Bell className="h-4 w-4 mr-1" /> Set</Button></div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Seller</h3>
            <Link href={`/profile/${listing.seller.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold">{listing.seller.name?.[0]?.toUpperCase() ?? <User className="h-5 w-5" />}</div>
              <div>
                <p className="font-medium text-foreground">{listing.seller.name ?? "Seller"}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">{sellerAvgRating != null ? <><Star className="h-4 w-4 fill-current" /><span>{sellerAvgRating.toFixed(1)} ({sellerReviewCount} reviews)</span></> : <span>No reviews yet</span>}</div>
              </div>
            </Link>
            {!isOwner && <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-destructive" onClick={() => reportMutation.mutate({ targetUserId: listing.seller.id, listingId: listing.id, reason: "Suspicious listing" })} disabled={reportMutation.isPending || reportMutation.isSuccess}><Flag className="h-4 w-4" />{reportMutation.isSuccess ? "Reported" : "Report Listing"}</Button>}
          </div>
        </div>
      </div>

      {/* Similar Books */}
      {similar && similar.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Similar Books</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <Link key={s.id} href={`/listings/${s.id}`} className="rounded-2xl border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.author}</p>
                <div className="flex items-center gap-2 mt-2"><span className="text-lg font-bold text-foreground">${Number(s.price)}</span><span className="text-xs text-muted-foreground">{s.condition}</span></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
