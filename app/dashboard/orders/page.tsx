import { getDashboardData } from "@/lib/adapters/dashboard-data";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

export default async function DashboardOrdersPage() {
  const result = await getDashboardData();
  if (result.status !== "ok") {
    return (
      <ErrorState
        title="Unable to load orders"
        description={result.status === "error" ? result.message : "Please sign in first."}
      />
    );
  }

  const orders = result.data.recentOrders;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your completed exchanges will appear here."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-[#242424] border border-[#2e2e2e] p-4"
            >
              <p className="font-medium text-white">{order.listingTitle ?? order.listingId}</p>
              <p className="text-sm text-[#a3a3a3] mt-1">
                {order.status} · ${order.priceAtPurchase} · {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
