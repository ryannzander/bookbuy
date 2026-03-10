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
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true, verified: true, schoolName: true },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const listings = await ctx.db.listing.findMany({
        where: { sellerId: input.userId, status: ListingStatus.AVAILABLE },
        orderBy: { createdAt: "desc" },
      });
      const threads = await ctx.db.messageThread.findMany({
        where: { OR: [{ userAId: input.userId }, { userBId: input.userId }] },
        include: {
          messages: { orderBy: { createdAt: "asc" }, select: { senderId: true, createdAt: true } },
        },
      });
      let totalResponseMs = 0;
      let responseCount = 0;
      for (const thread of threads) {
        for (let i = 1; i < thread.messages.length; i++) {
          const prev = thread.messages[i - 1];
          const curr = thread.messages[i];
          if (prev.senderId !== input.userId && curr.senderId === input.userId) {
            totalResponseMs += new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
            responseCount++;
          }
        }
      }
      const avgResponseMinutes = responseCount > 0 ? Math.round(totalResponseMs / responseCount / 60000) : null;
      return { user, listings, avgResponseMinutes };
    }),

  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const sellers = await ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          verified: true,
          schoolName: true,
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
          const salesCount = seller.sales.length;
          const activeListings = seller.listings.length;
          const trustBonus = seller.verified ? 5 : 0;
          const score = salesCount * 3 + activeListings + trustBonus;

          return {
            id: seller.id,
            name: seller.name,
            email: seller.email,
            avatarUrl: seller.avatarUrl,
            verified: seller.verified,
            schoolName: seller.schoolName,
            salesCount,
            activeListings,
            score,
          };
        })
        .filter((seller) => seller.salesCount > 0 || seller.activeListings > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return ranked;
    }),
});
