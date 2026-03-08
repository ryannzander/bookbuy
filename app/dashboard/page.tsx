"use client";

import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: listings, isLoading: listingsLoading } = api.listing.getMyListings.useQuery();
  const { data: purchases, isLoading: purchasesLoading } = api.purchase.myPurchases.useQuery();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold">My listings</h2>
        {listingsLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !listings?.length ? (
          <p className="text-muted-foreground">You haven&apos;t listed any books yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Link href={`/listings/${listing.id}`} className="font-medium hover:underline">
                      {listing.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">{listing.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{listing.author} · ${Number(listing.price)}</p>
                </CardHeader>
                <CardContent className="pb-2">
                  {listing.status === "AVAILABLE" && (
                    <Link href={`/listings/${listing.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Link href="/listings/new" className="mt-4 inline-block">
          <Button>List a textbook</Button>
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">My purchases</h2>
        {purchasesLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !purchases?.length ? (
          <p className="text-muted-foreground">No purchases yet.</p>
        ) : (
          <div className="space-y-4">
            {purchases.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{p.listing.title}</CardTitle>
                  <CardDescription>
                    ${Number(p.finalPrice)} · Purchased {new Date(p.purchasedAt).toLocaleDateString()}
                    {p.listing.seller && ` · Seller: ${p.listing.seller.name ?? "Unknown"}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Arrange in-person payment with the seller.
                  </p>
                  {!p.review && (
                    <Link href={`/dashboard/review/${p.id}`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        Leave a review
                      </Button>
                    </Link>
                  )}
                  {p.review && (
                    <p className="text-sm text-muted-foreground mt-2">
                      You left a {p.review.rating}-star review.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
