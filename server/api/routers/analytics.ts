import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  landingStats: publicProcedure.query(async ({ ctx }) => {
    const [activeListings, verifiedCount, completedSales] = await Promise.all([
      ctx.db.listing.count({ where: { status: "AVAILABLE" } }),
      ctx.db.user.count({ where: { verified: true } }),
      ctx.db.purchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { finalPrice: true },
      }),
    ]);
    const totalSaved = completedSales._sum.finalPrice
      ? Math.round(Number(completedSales._sum.finalPrice))
      : 0;
    return {
      activeListings,
      verifiedStudents: verifiedCount,
      totalSaved,
    };
  }),

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
