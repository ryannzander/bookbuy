import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ListingStatus, PurchaseStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const sellerRouter = createTRPCRouter({
  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, name: true, avatarUrl: true, createdAt: true, verified: true, schoolName: true },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const [listings, reviewsReceived] = await Promise.all([
        ctx.db.listing.findMany({
          where: { sellerId: input.userId, status: ListingStatus.AVAILABLE },
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.review.findMany({
          where: { sellerId: input.userId },
          include: { buyer: { select: { id: true, name: true } }, purchase: { include: { listing: { select: { title: true } } } } },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      const avgRating =
        reviewsReceived.length > 0
          ? reviewsReceived.reduce((s, r) => s + r.rating, 0) / reviewsReceived.length
          : null;
      return { user, listings, reviewsReceived, avgRating };
    }),

  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const sellers = await ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          verified: true,
          schoolName: true,
          reviewsReceived: { select: { rating: true } },
          sales: {
            where: { status: PurchaseStatus.COMPLETED },
            select: { id: true },
          },
          listings: {
            where: { status: ListingStatus.AVAILABLE },
            select: { id: true },
          },
        },
      });

      const ranked = sellers
        .map((seller) => {
          const reviewCount = seller.reviewsReceived.length;
          const averageRating =
            reviewCount > 0
              ? seller.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              : 0;
          const salesCount = seller.sales.length;
          const activeListings = seller.listings.length;
          const trustBonus = seller.verified ? 5 : 0;
          const score = averageRating * 20 + salesCount * 3 + reviewCount * 2 + trustBonus;

          return {
            id: seller.id,
            name: seller.name,
            avatarUrl: seller.avatarUrl,
            verified: seller.verified,
            schoolName: seller.schoolName,
            averageRating,
            reviewCount,
            salesCount,
            activeListings,
            score,
          };
        })
        .filter((seller) => seller.salesCount > 0 || seller.reviewCount > 0 || seller.activeListings > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return ranked;
    }),
});
