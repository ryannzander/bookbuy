"use client";

import { useCallback, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const CONDITIONS = ["Like New", "Good", "Acceptable", "Worn"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
] as const;

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "");
  const [condition, setCondition] = useState(searchParams.get("condition") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [type, setType] = useState<"FIXED" | "AUCTION" | "">(
    (searchParams.get("type") as "FIXED" | "AUCTION") ?? ""
  );
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc">(
    (searchParams.get("sort") as "newest" | "priceAsc" | "priceDesc") ?? "newest"
  );

  const filters = useMemo(() => ({
    subject: subject || undefined,
    condition: condition || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    type: type || undefined,
    search: search.trim() || undefined,
    sort,
  }), [subject, condition, minPrice, maxPrice, type, search, sort]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.listing.getMany.useInfiniteQuery(
      { ...filters, limit: 12 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
    );

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (type) params.set("type", type);
    if (search.trim()) params.set("search", search.trim());
    if (sort !== "newest") params.set("sort", sort);
    window.history.replaceState(null, "", `${window.location.pathname}${params.toString() ? `?${params}` : ""}`);
  }, [subject, condition, minPrice, maxPrice, type, search, sort]);

  const applyFilters = () => updateUrl();

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketplace</h1>

      <Card>
        <CardHeader className="pb-3">
          <Label className="text-sm font-medium">Filters</Label>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Title, author, ISBN"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Math, Biology"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">Any</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as "FIXED" | "AUCTION" | "")}
              >
                <option value="">Any</option>
                <option value="FIXED">Buy now</option>
                <option value="AUCTION">Auction</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min price ($)</Label>
              <Input
                id="minPrice"
                type="number"
                min={0}
                step={0.01}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                min={0}
                step={0.01}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sort</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "priceAsc" | "priceDesc")}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={applyFilters}>Apply filters</Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Loading listings…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No listings match your filters.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{listing.type}</span>
                      {listing.type === "AUCTION" && listing.bids?.[0] && (
                        <span className="text-xs font-medium">
                          High bid: ${Number(listing.bids[0].amount)}
                        </span>
                      )}
                    </div>
                    <h2 className="font-semibold leading-tight">{listing.title}</h2>
                    <p className="text-sm text-muted-foreground">{listing.author}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">
                      ${Number(listing.price)}
                      {listing.type === "AUCTION" && " starting bid"}
                    </p>
                    <p className="text-xs text-muted-foreground">{listing.condition} · {listing.subject}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <span className="text-xs text-muted-foreground">
                      by {listing.seller.name ?? "Seller"}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading marketplace…</p>}>
      <MarketplaceContent />
    </Suspense>
  );
}
