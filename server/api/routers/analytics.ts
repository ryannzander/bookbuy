import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  dashboardSummary: protectedProcedure.query(async ({ ctx }) => {
    const [activeListings, soldCount, ratings, pendingOrders, unreadMessages] =
      await Promise.all([
        ctx.db.listing.count({
          where: { sellerId: ctx.userId, status: "AVAILABLE" },
        }),
        ctx.db.purchase.count({
          where: { sellerId: ctx.userId, status: "COMPLETED" },
        }),
        ctx.db.review.findMany({
          where: { sellerId: ctx.userId },
          select: { rating: true },
        }),
        ctx.db.purchase.count({
          where: { sellerId: ctx.userId, status: "PENDING" },
        }),
        ctx.db.message.count({
          where: {
            read: false,
            senderId: { not: ctx.userId },
            thread: {
              OR: [{ userAId: ctx.userId }, { userBId: ctx.userId }],
            },
          },
        }),
      ]);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    return {
      activeListings,
      booksSold: soldCount,
      averageRating,
      pendingOrders,
      unreadMessages,
    };
  }),
});
