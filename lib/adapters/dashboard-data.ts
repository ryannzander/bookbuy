import { api } from "@/lib/api/server";
import type {
  DashboardData,
  DashboardDataResult,
  ActivityPoint,
} from "@/types/dashboard";
import type { Listing, Meetup, Notification, Order } from "@/types/entities";

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string");
    }
  } catch {
    // keep fallback
  }
  return [raw];
}

function toCourseCode(isbn: string): string | null {
  const match = isbn.match(/[A-Za-z]{2,4}\s?-?\s?\d{3}/);
  return match ? match[0].toUpperCase() : null;
}

function toListing(input: {
  id: string;
  sellerId: string;
  title: string;
  author: string;
  isbn: string;
  subject: string;
  condition: string;
  price: { toString(): string } | number;
  status: "AVAILABLE" | "SOLD" | "AUCTION_ENDED";
  imageUrls: string | null;
  createdAt: Date;
  type: "FIXED" | "AUCTION";
}): Listing {
  return {
    id: input.id,
    sellerId: input.sellerId,
    title: input.title,
    courseCode: toCourseCode(input.isbn),
    subject: input.subject,
    price: Number(input.price),
    condition: input.condition,
    description: null,
    status: input.status,
    edition: null,
    author: input.author,
    imageUrls: parseImageUrls(input.imageUrls),
    createdAt: input.createdAt.toISOString(),
    isFeatured: false,
    viewCount: 0,
    type: input.type,
  };
}

function buildActivitySeries(listings: Listing[], orders: Order[]): ActivityPoint[] {
  const today = new Date();
  const points: ActivityPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const dayListings = listings.filter((l) => l.createdAt.slice(0, 10) === key).length;
    const daySales = orders.filter((o) => o.createdAt.slice(0, 10) === key).length;
    points.push({
      dateLabel: day.toLocaleDateString(undefined, { weekday: "short" }),
      views: dayListings * 8,
      listings: dayListings,
      sales: daySales,
      messages: 0,
    });
  }
  return points;
}

export async function getDashboardData(): Promise<DashboardDataResult> {
  try {
    const caller = await api();
    const me = await caller.auth.me();
    if (!me) return { status: "unauthenticated" };

    const [listingsRaw, purchasesRaw, unreadCount, notificationsRaw, sellerSummary] =
      await Promise.all([
        caller.listing.getMyListings(),
        caller.purchase.myPurchases(),
        caller.notification.unreadCount(),
        caller.notification.getMine({ limit: 10 }),
        caller.seller.getByUserId({ userId: me.id }).catch(() => null),
      ]);

    const recentListings = listingsRaw.map(toListing);

    const recentOrders: Order[] = purchasesRaw.map((p) => ({
      id: p.id,
      listingId: p.listingId,
      listingTitle: p.listing.title,
      buyerId: p.buyerId,
      sellerId: p.listing.sellerId,
      status: "COMPLETED",
      priceAtPurchase: Number(p.finalPrice),
      createdAt: p.purchasedAt.toISOString(),
      meetupDate: null,
    }));

    const upcomingMeetups: Meetup[] = [];

    const notifications: Notification[] = notificationsRaw.items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      linkUrl: n.linkUrl ?? null,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    const averageRating = sellerSummary?.avgRating ?? 0;
    const reviewCount = sellerSummary?.reviewsReceived.length ?? 0;

    const data: DashboardData = {
      user: {
        id: me.id,
        name: me.name ?? null,
        username: (me.name ?? me.email.split("@")[0]).toLowerCase().replace(/\s+/g, ""),
        email: me.email,
        avatarUrl: me.avatarUrl ?? null,
        schoolName: null,
        verified: true,
        createdAt: me.createdAt.toISOString(),
      },
      sellerProfile: {
        userId: me.id,
        displayName: me.name ?? me.email,
        bio: null,
        avatarUrl: me.avatarUrl ?? null,
        averageRating,
        reviewCount,
        totalSales: recentOrders.length,
        joinedAt: me.createdAt.toISOString(),
      },
      stats: {
        activeListings: recentListings.filter((l) => l.status === "AVAILABLE").length,
        booksSold: recentOrders.length,
        averageRating,
        pendingOrders: 0,
        unreadMessages: unreadCount,
      },
      recentListings: recentListings.slice(0, 6),
      recentOrders: recentOrders.slice(0, 6),
      upcomingMeetups,
      notifications,
      activitySeries: buildActivitySeries(recentListings, recentOrders),
    };

    return { status: "ok", data };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to load dashboard",
    };
  }
}
