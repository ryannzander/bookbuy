import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const wishlistRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.wishlist.findUnique({
        where: {
          userId_listingId: {
            userId: ctx.userId,
            listingId: input.listingId,
          },
        },
      });
      if (existing) {
        await ctx.db.wishlist.delete({ where: { id: existing.id } });
        return { saved: false };
      }
      await ctx.db.wishlist.create({
        data: { userId: ctx.userId, listingId: input.listingId },
      });
      return { saved: true };
    }),

  isSaved: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.wishlist.findUnique({
        where: {
          userId_listingId: {
            userId: ctx.userId,
            listingId: input.listingId,
          },
        },
      });
      return !!item;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.wishlist.findMany({
      where: { userId: ctx.userId },
      include: {
        listing: {
          include: {
            seller: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
