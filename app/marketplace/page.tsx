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
  const [courseCode, setCourseCode] = useState(searchParams.get("courseCode") ?? "");
  const [condition, setCondition] = useState(searchParams.get("condition") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [type, setType] = useState<"FIXED" | "AUCTION" | "">(
    (searchParams.get("type") as "FIXED" | "AUCTION") ?? ""
  );
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [availability, setAvailability] = useState<"available" | "sold" | "all">(
    (searchParams.get("availability") as "available" | "sold" | "all") ?? "available"
  );
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc">(
    (searchParams.get("sort") as "newest" | "priceAsc" | "priceDesc") ?? "newest"
  );

  const filters = useMemo(
    () => ({
      subject: subject || undefined,
      courseCode: courseCode || undefined,
      condition: condition || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      type: type || undefined,
      search: search.trim() || undefined,
      availability,
      sort,
    }),
    [subject, courseCode, condition, minPrice, maxPrice, type, search, availability, sort]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.listing.getMany.useInfiniteQuery(
      { ...filters, limit: 12 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
    );

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (courseCode) params.set("courseCode", courseCode);
    if (condition) params.set("condition", condition);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (type) params.set("type", type);
    if (search.trim()) params.set("search", search.trim());
    if (availability !== "available") params.set("availability", availability);
    if (sort !== "newest") params.set("sort", sort);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.toString() ? `?${params}` : ""}`
    );
  }, [subject, courseCode, condition, minPrice, maxPrice, type, search, availability, sort]);

  const applyFilters = () => updateUrl();

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace</h1>
        <p className="mt-1 text-muted-foreground">Find textbooks from students at your school</p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <Label className="text-sm font-semibold text-foreground">Filters</Label>
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
              <Label htmlFor="courseCode">Course code</Label>
              <Input
                id="courseCode"
                placeholder="MATH 221"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">Any</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={type}
                onChange={(e) => setType(e.target.value as "FIXED" | "AUCTION" | "")}
              >
                <option value="">Any</option>
                <option value="FIXED">Buy now</option>
                <option value="AUCTION">Auction</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as "available" | "sold" | "all")}
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="all">All</option>
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
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "priceAsc" | "priceDesc")}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={applyFilters} className="mt-1">
            Apply filters
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading listings…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
          <p className="text-muted-foreground">No listings match your filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-border group-hover:bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex rounded-md px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary">
                        {listing.type === "AUCTION" ? "Auction" : "Buy now"}
                      </span>
                      {listing.type === "AUCTION" && listing.bids?.[0] && (
                        <span className="text-xs font-medium text-muted-foreground">
                          ${Number(listing.bids[0].amount)} bid
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 font-semibold leading-snug text-foreground group-hover:text-primary">
                      {listing.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{listing.author}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-lg font-semibold text-foreground">
                      ${Number(listing.price)}
                      {listing.type === "AUCTION" && (
                        <span className="text-sm font-normal text-muted-foreground"> starting bid</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {listing.condition} · {listing.subject}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {(() => {
                      const sellerReviewCount = listing.seller.reviewsReceived?.length ?? 0;
                      const sellerAvgRating =
                        sellerReviewCount > 0
                          ? listing.seller.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
                            sellerReviewCount
                          : null;
                      return (
                        <span className="text-xs text-muted-foreground">
                          by {listing.seller.name ?? "Seller"} ·{" "}
                          {sellerAvgRating != null ? `${sellerAvgRating.toFixed(1)} / 5` : "No ratings yet"}
                        </span>
                      );
                    })()}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
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
