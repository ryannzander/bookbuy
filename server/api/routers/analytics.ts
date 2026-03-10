import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  dashboardSummary: protectedProcedure.query(async ({ ctx }) => {
    const [activeListings, soldCount, pendingOrders, unreadMessages] =
      await Promise.all([
        ctx.db.listing.count({
          where: { sellerId: ctx.userId, status: "AVAILABLE" },
        }),
        ctx.db.purchase.count({
          where: { sellerId: ctx.userId, status: "COMPLETED" },
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

    return {
      activeListings,
      booksSold: soldCount,
      pendingOrders,
      unreadMessages,
    };
  }),
});
