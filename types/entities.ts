export interface User {
  id: string;
  name: string | null;
  username: string;
  email: string;
  avatarUrl: string | null;
  schoolName: string | null;
  verified: boolean;
  createdAt: string;
}

export interface SellerProfile {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  averageRating: number;
  reviewCount: number;
  totalSales: number;
  joinedAt: string;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  altText: string | null;
  position: number;
}

export type ListingStatus = "AVAILABLE" | "SOLD" | "AUCTION_ENDED";
export type ListingType = "FIXED" | "AUCTION";

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  courseCode: string | null;
  subject: string;
  price: number;
  condition: string;
  description: string | null;
  status: ListingStatus;
  edition: string | null;
  author: string;
  imageUrls: string[];
  createdAt: string;
  isFeatured: boolean;
  viewCount: number;
  type: ListingType;
}

export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface Order {
  id: string;
  listingId: string;
  listingTitle?: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  priceAtPurchase: number;
  createdAt: string;
  meetupDate: string | null;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  sellerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export type MeetupStatus = "SCHEDULED" | "PENDING" | "COMPLETED" | "CANCELLED";

export interface Meetup {
  id: string;
  orderId: string;
  buyerName: string;
  listingTitle: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  status: MeetupStatus;
}

export interface DashboardStats {
  activeListings: number;
  booksSold: number;
  averageRating: number;
  pendingOrders: number;
  unreadMessages: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
}
