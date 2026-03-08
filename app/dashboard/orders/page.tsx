"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Check, Clock } from "lucide-react";

export default function DashboardOrdersPage() {
  const { data: myPurchases = [], isLoading: loadingPurchases } =
    api.purchase.myPurchases.useQuery();
  const { data: mySales = [], isLoading: loadingSales } =
    api.purchase.mySales.useQuery();
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
    return [...purchaseOrders, ...salesOrders].sort((a, b) =>
      a.purchasedAt < b.purchasedAt ? 1 : -1
    );
  }, [myPurchases, mySales]);

  const isLoading = loadingPurchases || loadingSales;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Orders & Exchanges
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your purchases and sales
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          Loading orders...
        </div>
      )}

      {!isLoading && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Purchases and sales will appear here when transactions happen."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-card border border-border p-6 hover:border-muted-foreground/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-foreground text-lg">
                      {order.listingTitle}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        order.role === "Buyer"
                          ? "bg-secondary text-foreground"
                          : "bg-foreground text-background"
                      }`}
                    >
                      {order.role}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      ${order.price}
                    </span>
                    <span>{new Date(order.purchasedAt).toLocaleDateString()}</span>
                    {order.meetupDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.meetupDate).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    order.status === "COMPLETED"
                      ? "bg-success/20 text-success"
                      : order.status === "PENDING"
                        ? "bg-warning/20 text-warning"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {order.status === "PENDING" && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-64">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input
                        type="datetime-local"
                        className="flex-1"
                        value={meetupDraft[order.id] ?? ""}
                        onChange={(e) =>
                          setMeetupDraft((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
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
                      disabled={
                        !meetupDraft[order.id] || scheduleMeetup.isPending
                      }
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meetup
                    </Button>
                    <Button
                      onClick={() =>
                        completeOrder.mutate({ purchaseId: order.id })
                      }
                      disabled={completeOrder.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark Completed
                    </Button>
                  </div>

                  {(scheduleMeetup.error || completeOrder.error) && (
                    <p className="mt-3 text-sm text-destructive">
                      {scheduleMeetup.error?.message ??
                        completeOrder.error?.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
