import Link from "next/link";
import { getDashboardData } from "@/lib/adapters/dashboard-data";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatsChart } from "@/components/dashboard/stats-chart";
import { ListingsGrid } from "@/components/dashboard/listings-grid";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { ActivityWidget } from "@/components/dashboard/activity-widget";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

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
    return <ErrorState title="Could not load dashboard" description={result.message} />;
  }

  const { data } = result;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            Welcome back, {data.user.name ?? data.user.email}. Here is your marketplace pulse.
          </p>
        </div>

        <StatsCards stats={data.stats} />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your live listings</h2>
            <Link
              href="/listings/new"
              className="rounded-xl bg-[#4ade80] px-4 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#22c55e] transition-colors"
            >
              List a Book
            </Link>
          </div>
          <ListingsGrid
            listings={data.recentListings}
            emptyTitle="No listings yet"
            emptyDescription="Create your first textbook listing and start reaching students."
          />
        </section>

        <StatsChart data={data.activitySeries} />

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recent exchanges</h2>
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
                  className="rounded-2xl bg-[#242424] border border-[#2e2e2e] p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{order.listingTitle ?? order.listingId}</p>
                    <p className="text-sm text-[#a3a3a3]">
                      ${order.priceAtPurchase} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-lg border border-[#2e2e2e] px-3 py-1 text-xs text-[#d4d4d4]">
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <CalendarWidget />
        <ActivityWidget meetups={data.upcomingMeetups} />
      </aside>
    </div>
  );
}
