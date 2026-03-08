"use client";

import { SearchInput } from "@/components/marketplace/search-input";
import { SortDropdown, type MarketplaceSort } from "@/components/marketplace/sort-dropdown";

export type MarketplaceFilters = {
  search: string;
  courseCode: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  availability: "all" | "available" | "sold";
  sort: MarketplaceSort;
};

export function FilterBar({
  filters,
  onChange,
}: {
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <SearchInput
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input
          value={filters.courseCode}
          onChange={(e) => onChange({ ...filters, courseCode: e.target.value })}
          placeholder="Course code"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <input
          value={filters.condition}
          onChange={(e) => onChange({ ...filters, condition: e.target.value })}
          placeholder="Condition"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <input
          value={filters.minPrice}
          onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
          placeholder="Min price"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <input
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          placeholder="Max price"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <select
          value={filters.availability}
          onChange={(e) =>
            onChange({
              ...filters,
              availability: e.target.value as MarketplaceFilters["availability"],
            })
          }
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>
        <SortDropdown
          value={filters.sort}
          onChange={(sort) => onChange({ ...filters, sort })}
        />
      </div>
    </div>
  );
}
