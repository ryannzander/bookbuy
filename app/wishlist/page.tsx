"use client";

import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { data, isLoading } = api.wishlist.getAll.useQuery();
  const utils = api.useUtils();
  const toggle = api.wishlist.toggle.useMutation({ onSuccess: () => utils.wishlist.getAll.invalidate() });

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />Loading...</div></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center"><Heart className="h-7 w-7" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Saved Books</h1><p className="text-muted-foreground">Books you&apos;re interested in</p></div>
      </div>
      {!data || data.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground">No saved books yet</h2>
          <p className="mt-2 text-muted-foreground">Browse the marketplace and save books you&apos;re interested in.</p>
          <Link href="/marketplace" className="block mt-6"><Button>Browse Marketplace</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-5 flex gap-4 hover:border-muted-foreground/30 transition-colors">
              <div className="h-20 w-16 rounded-lg bg-secondary flex items-center justify-center shrink-0"><BookOpen className="h-6 w-6 text-muted-foreground/40" /></div>
              <div className="flex-1 min-w-0">
                <Link href={`/listings/${item.listing.id}`} className="font-semibold text-foreground hover:underline line-clamp-1">{item.listing.title}</Link>
                <p className="text-sm text-muted-foreground mt-0.5">by {item.listing.author}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg font-bold text-foreground">${Number(item.listing.price)}</span>
                  <span className="text-xs text-muted-foreground">{item.listing.condition}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.listing.status === "AVAILABLE" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                    {item.listing.status === "AVAILABLE" ? "Available" : "Sold"}
                  </span>
                </div>
              </div>
              <button onClick={() => toggle.mutate({ listingId: item.listing.id })} className="self-start p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
