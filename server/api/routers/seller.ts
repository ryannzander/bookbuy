import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ListingStatus } from "@prisma/client";
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
});
