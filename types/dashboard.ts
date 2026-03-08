import type {
  DashboardStats,
  Listing,
  Meetup,
  Notification,
  Order,
  SellerProfile,
  User,
} from "@/types/entities";

export interface ActivityPoint {
  dateLabel: string;
  views: number;
  listings: number;
  sales: number;
  messages: number;
}

export interface DashboardData {
  user: User;
  sellerProfile: SellerProfile;
  stats: DashboardStats;
  recentListings: Listing[];
  recentOrders: Order[];
  upcomingMeetups: Meetup[];
  notifications: Notification[];
  activitySeries: ActivityPoint[];
}

export type DashboardDataResult =
  | { status: "ok"; data: DashboardData }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };
