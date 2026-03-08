"use client";

import { useCallback, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Filter, Search, Star, X } from "lucide-react";

const CONDITIONS = ["Like New", "Good", "Acceptable", "Worn"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
] as const;

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "");
  const [courseCode, setCourseCode] = useState(
    searchParams.get("courseCode") ?? ""
  );
  const [condition, setCondition] = useState(
    searchParams.get("condition") ?? ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [type, setType] = useState<"FIXED" | "AUCTION" | "">(
    (searchParams.get("type") as "FIXED" | "AUCTION") ?? ""
  );
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [availability, setAvailability] = useState<
    "available" | "sold" | "all"
  >((searchParams.get("availability") as "available" | "sold" | "all") ?? "available");
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

  const clearFilters = () => {
    setSubject("");
    setCourseCode("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setType("");
    setSearch("");
    setAvailability("available");
    setSort("newest");
    window.history.replaceState(null, "", window.location.pathname);
  };

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const hasActiveFilters =
    subject || courseCode || condition || minPrice || maxPrice || type || search;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Marketplace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find textbooks from students at your school
          </p>
        </div>
        <Link href="/listings/new">
          <Button size="lg">Sell a Book</Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-12 h-14 text-base"
          />
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 h-14"
        >
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-foreground" />
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="e.g. Math, Biology"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input
                placeholder="MATH 221"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <select
                className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all"
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
                className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all"
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
                className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all"
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value as "available" | "sold" | "all")
                }
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="all">All</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Min Price ($)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price ($)</Label>
              <Input
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
                className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all"
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "newest" | "priceAsc" | "priceDesc")
                }
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={applyFilters} className="w-full sm:w-auto">
            Apply Filters
          </Button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            Loading listings...
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 py-16 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-semibold text-foreground">No listings found</p>
          <p className="mt-2 text-muted-foreground">
            Try adjusting or clearing your filters
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((listing) => {
              const sellerReviewCount = listing.seller.reviewsReceived?.length ?? 0;
              const sellerAvgRating =
                sellerReviewCount > 0
                  ? listing.seller.reviewsReceived.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / sellerReviewCount
                  : null;

              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group"
                >
                  <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-muted-foreground/30 transition-all duration-200">
                    {/* Image placeholder */}
                    <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            listing.type === "AUCTION"
                              ? "bg-warning/20 text-warning"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {listing.type === "AUCTION" ? "Auction" : "Buy Now"}
                        </span>
                        {listing.type === "AUCTION" && listing.bids?.[0] && (
                          <span className="text-xs font-medium text-muted-foreground">
                            ${Number(listing.bids[0].amount)} bid
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-muted-foreground transition-colors">
                        {listing.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {listing.author}
                      </p>

                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          ${Number(listing.price)}
                        </span>
                        {listing.type === "AUCTION" && (
                          <span className="text-xs text-muted-foreground">
                            starting bid
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{listing.condition}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{listing.subject}</span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {listing.seller.name ?? "Seller"}
                        </span>
                        {sellerAvgRating != null && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-current" />
                            {sellerAvgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            Loading marketplace...
          </div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
