"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SellerPage() {
  const params = useParams();
  const userId = params.userId as string;
  const { data, isLoading } = api.seller.getByUserId.useQuery({ userId });

  if (isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  if (!data) {
    return <p>Seller not found.</p>;
  }

  const { user, listings } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{user.name ?? user.email ?? "Seller"}</h1>
              <div className="mt-1 flex items-center gap-2">
                {user.verified && (
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    Verified
                  </span>
                )}
                {user.schoolName && (
                  <span className="text-xs text-muted-foreground">{user.schoolName}</span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Listings</h2>
        {listings.length === 0 ? (
          <p className="text-muted-foreground">No active listings.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader className="pb-2">
                    <h3 className="font-medium">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">{listing.author}</p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="font-medium">${Number(listing.price)}</p>
                    <p className="text-xs text-muted-foreground">{listing.condition} · {listing.subject}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
