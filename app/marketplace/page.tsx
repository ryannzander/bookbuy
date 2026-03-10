"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Filter, Search, X } from "lucide-react";

function SearchAutocomplete({ value, onChange, onSubmit }: { value: string; onChange: (v: string) => void; onSubmit: () => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.trim().length < 2) { setDebouncedQuery(""); return; }
    timerRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const { data: results } = api.listing.search.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-1">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by title, author, or ISBN..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter") { setOpen(false); onSubmit(); } }}
        className="pl-12 h-14 text-base"
      />
      {open && results && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden animate-fade-in-down">
          {results.map((r) => (
            <Link key={r.id} href={`/listings/${r.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors" onClick={() => setOpen(false)}>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.author}{r.courseCode ? ` · ${r.courseCode}` : ""}</p>
              </div>
              <span className="price-badge ml-3">${Number(r.price)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
      search: search.trim() || undefined,
      availability,
      sort,
    }),
    [subject, courseCode, condition, minPrice, maxPrice, search, availability, sort]
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
    if (search.trim()) params.set("search", search.trim());
    if (availability !== "available") params.set("availability", availability);
    if (sort !== "newest") params.set("sort", sort);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.toString() ? `?${params}` : ""}`
    );
  }, [subject, courseCode, condition, minPrice, maxPrice, search, availability, sort]);

  const applyFilters = () => updateUrl();

  const clearFilters = () => {
    setSubject("");
    setCourseCode("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setAvailability("available");
    setSort("newest");
    window.history.replaceState(null, "", window.location.pathname);
  };

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const hasActiveFilters =
    subject || courseCode || condition || minPrice || maxPrice || search;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Marketplace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find textbooks from students at your school
          </p>
        </div>
        <Link href="/listings/new">
          <Button variant="primary" size="lg">Sell a Book</Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchAutocomplete value={search} onChange={setSearch} onSubmit={applyFilters} />
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
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-6 animate-fade-in-down">
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
                className="flex h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/50 transition-all"
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
              <Label>Availability</Label>
              <select
                className="flex h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/50 transition-all"
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
                className="flex h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/50 transition-all"
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

          <Button variant="primary" onClick={applyFilters} className="w-full sm:w-auto">
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
            {items.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group"
                >
                  <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_20px_rgba(45,212,191,0.08)] transition-all duration-300 hover-lift">
                    <div className="aspect-[4/3] bg-secondary flex items-center justify-center overflow-hidden img-zoom">
                      {listing.imageUrls ? (() => { try { const imgs = JSON.parse(listing.imageUrls); return imgs[0] ? <img src={imgs[0]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500" /> : <BookOpen className="h-12 w-12 text-muted-foreground/30" />; } catch { return <BookOpen className="h-12 w-12 text-muted-foreground/30" />; } })() : <BookOpen className="h-12 w-12 text-muted-foreground/30" />}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary/20 to-accent/10 text-primary border border-primary/20">
                          Buy Now
                        </span>
                      </div>

                      <h3 className="mt-3 font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {listing.author}
                      </p>

                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-bold gradient-text">
                          ${Number(listing.price)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`condition-dot ${listing.condition === 'Like New' ? 'condition-excellent' : listing.condition === 'Good' ? 'condition-good' : listing.condition === 'Acceptable' ? 'condition-fair' : 'condition-poor'}`} />
                        <span>{listing.condition}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                        <span>{listing.subject}</span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/50">
                        <span className="text-sm text-muted-foreground">
                          {listing.seller.name ?? listing.seller.email ?? "Seller"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
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
