"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Listing } from "@/types/entities";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc/client";
import { BookOpen, Edit, Eye, Trash2, CheckSquare, Square, Package } from "lucide-react";

export function ListingsGrid({ listings, emptyTitle, emptyDescription }: { listings: Listing[]; emptyTitle: string; emptyDescription: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const deleteMutation = api.listing.delete.useMutation({ onSuccess: () => router.refresh() });
  const bulkDelete = api.listing.bulkDelete.useMutation({ onSuccess: () => { setSelected(new Set()); setBulkMode(false); router.refresh(); } });
  const bulkSold = api.listing.bulkMarkSold.useMutation({ onSuccess: () => { setSelected(new Set()); setBulkMode(false); router.refresh(); } });

  function toggleSelect(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectAll() { setSelected(new Set(listings.map((l) => l.id))); }

  if (listings.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  function parseImages(listing: Listing): string[] {
    if (!listing.imageUrls) return [];
    try { const p = JSON.parse(listing.imageUrls as unknown as string); return Array.isArray(p) ? p : []; } catch { return []; }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }} className="gap-2">
          {bulkMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          {bulkMode ? "Cancel" : "Bulk Select"}
        </Button>
        {bulkMode && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={selectAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Select all ({listings.length})</button>
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" className="gap-1" disabled={selected.size === 0 || bulkSold.isPending} onClick={() => { if (confirm(`Mark ${selected.size} as sold?`)) bulkSold.mutate({ ids: [...selected] }); }}>
              <Package className="h-3.5 w-3.5" /> Mark Sold
            </Button>
            <Button size="sm" variant="destructive" className="gap-1" disabled={selected.size === 0 || bulkDelete.isPending} onClick={() => { if (confirm(`Delete ${selected.size} listings?`)) bulkDelete.mutate({ ids: [...selected] }); }}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => {
          const images = parseImages(listing);
          const isSelected = selected.has(listing.id);
          return (
            <div key={listing.id} className={`group rounded-2xl bg-card border overflow-hidden flex flex-col hover:border-muted-foreground/30 transition-all duration-200 ${isSelected ? "border-foreground" : "border-border"}`}
              onClick={bulkMode ? () => toggleSelect(listing.id) : undefined}>
              <div className="aspect-[4/3] bg-secondary flex items-center justify-center overflow-hidden relative">
                {images.length > 0 ? <img src={images[0]} alt={listing.title} className="h-full w-full object-cover" /> : <BookOpen className="h-12 w-12 text-muted-foreground/30" />}
                {bulkMode && <div className={`absolute top-3 left-3 h-6 w-6 rounded-md border-2 flex items-center justify-center ${isSelected ? "bg-foreground border-foreground" : "bg-background/80 border-border"}`}>
                  {isSelected && <CheckSquare className="h-4 w-4 text-background" />}
                </div>}
                {listing.status === "SOLD" && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><span className="text-sm font-bold text-foreground px-4 py-1.5 rounded-full bg-destructive/20 text-destructive">SOLD</span></div>}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">{listing.title}</h3>
                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{listing.condition}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-1">{listing.author}</p>
                <div className="mt-4 flex items-baseline gap-1"><span className="text-2xl font-bold text-foreground">${Number(listing.price)}</span></div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{listing.courseCode ?? listing.subject}</span><span className="h-1 w-1 rounded-full bg-muted-foreground" /><span>{listing.type}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Listed {new Date(listing.createdAt).toLocaleDateString()}</p>
                {!bulkMode && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                    <Link href={`/listings/${listing.id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full gap-2"><Eye className="h-4 w-4" />View</Button></Link>
                    <Link href={`/listings/${listing.id}/edit`} className="flex-1"><Button variant="ghost" size="sm" className="w-full gap-2"><Edit className="h-4 w-4" />Edit</Button></Link>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: listing.id }); }} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
