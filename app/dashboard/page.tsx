import Link from "next/link";
import { getDashboardData } from "@/lib/adapters/dashboard-data";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatsChart } from "@/components/dashboard/stats-chart";
import { ListingsGrid } from "@/components/dashboard/listings-grid";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { ActivityWidget } from "@/components/dashboard/activity-widget";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const result = await getDashboardData();

  if (result.status === "unauthenticated") {
    return (
      <ErrorState
        title="You are signed out"
        description="Please sign in to access your dashboard."
      />
    );
  }

  if (result.status === "error") {
    return (
      <ErrorState title="Could not load dashboard" description={result.message} />
    );
  }

  const { data } = result;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back, {data.user.name ?? data.user.email}
            </p>
          </div>
          <Link href="/listings/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Listing
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <StatsCards stats={data.stats} />

        {/* Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Your Listings
            </h2>
            <Link
              href="/dashboard/listings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          <ListingsGrid
            listings={data.recentListings}
            emptyTitle="No listings yet"
            emptyDescription="Create your first textbook listing and start reaching students."
          />
        </section>

        {/* Chart */}
        <StatsChart data={data.activitySeries} />

        {/* Recent Exchanges */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Exchanges
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <EmptyState
              title="No exchanges yet"
              description="Once purchases are completed, exchange history appears here."
            />
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-card border border-border p-5 flex items-center justify-between hover:border-muted-foreground/30 transition-all"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {order.listingTitle ?? order.listingId}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${order.priceAtPurchase} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground">
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <CalendarWidget />
        <ActivityWidget meetups={data.upcomingMeetups} />
      </aside>
    </div>
  );
}
