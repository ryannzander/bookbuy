"use client";

export type MarketplaceSort = "newest" | "priceAsc" | "priceDesc";

export function SortDropdown({
  value,
  onChange,
}: {
  value: MarketplaceSort;
  onChange: (value: MarketplaceSort) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as MarketplaceSort)}
      className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="newest">Newest</option>
      <option value="priceAsc">Price: Low to High</option>
      <option value="priceDesc">Price: High to Low</option>
    </select>
  );
}
