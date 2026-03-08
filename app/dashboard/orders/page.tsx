"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardOrdersPage() {
  const { data: myPurchases = [], isLoading: loadingPurchases } = api.purchase.myPurchases.useQuery();
  const { data: mySales = [], isLoading: loadingSales } = api.purchase.mySales.useQuery();
  const utils = api.useUtils();
  const scheduleMeetup = api.meetup.schedule.useMutation({
    onSuccess: () => {
      utils.purchase.myPurchases.invalidate();
      utils.purchase.mySales.invalidate();
      utils.meetup.upcoming.invalidate();
    },
  });
  const completeOrder = api.meetup.completeOrder.useMutation({
    onSuccess: () => {
      utils.purchase.myPurchases.invalidate();
      utils.purchase.mySales.invalidate();
      utils.meetup.upcoming.invalidate();
    },
  });
  const [meetupDraft, setMeetupDraft] = useState<Record<string, string>>({});

  const orders = useMemo(() => {
    const purchaseOrders = myPurchases.map((p) => ({
      id: p.id,
      listingTitle: p.listing.title,
      price: Number(p.finalPrice),
      status: p.status,
      purchasedAt: p.purchasedAt,
      role: "Buyer" as const,
      meetupDate: p.meetupDate,
    }));
    const salesOrders = mySales.map((p) => ({
      id: p.id,
      listingTitle: p.listing.title,
      price: Number(p.finalPrice),
      status: p.status,
      purchasedAt: p.purchasedAt,
      role: "Seller" as const,
      meetupDate: p.meetupDate,
    }));
    return [...purchaseOrders, ...salesOrders].sort((a, b) => (a.purchasedAt < b.purchasedAt ? 1 : -1));
  }, [myPurchases, mySales]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Orders & Exchanges</h1>
      {(loadingPurchases || loadingSales) && (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      )}
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Purchases and sales will appear here when transactions happen."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-card border border-border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{order.listingTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.role} · {order.status} · ${order.price} · {new Date(order.purchasedAt).toLocaleDateString()}
                  </p>
                  {order.meetupDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Meetup: {new Date(order.meetupDate).toLocaleString()}
                    </p>
                  )}
                </div>
                <span className="rounded-md bg-primary/15 text-primary px-2 py-1 text-xs font-medium">
                  {order.status}
                </span>
              </div>
              {order.status === "PENDING" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Input
                    type="datetime-local"
                    className="max-w-xs"
                    value={meetupDraft[order.id] ?? ""}
                    onChange={(e) =>
                      setMeetupDraft((prev) => ({ ...prev, [order.id]: e.target.value }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const value = meetupDraft[order.id];
                      if (!value) return;
                      scheduleMeetup.mutate({
                        purchaseId: order.id,
                        startTime: new Date(value),
                      });
                    }}
                    disabled={!meetupDraft[order.id] || scheduleMeetup.isPending}
                  >
                    Schedule meetup
                  </Button>
                  <Button
                    onClick={() => completeOrder.mutate({ purchaseId: order.id })}
                    disabled={completeOrder.isPending}
                  >
                    Mark completed
                  </Button>
                </div>
              )}
              {(scheduleMeetup.error || completeOrder.error) && (
                <p className="mt-2 text-sm text-destructive">
                  {scheduleMeetup.error?.message ?? completeOrder.error?.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
