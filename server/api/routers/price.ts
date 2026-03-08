import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const priceRouter = createTRPCRouter({
  getHistory: publicProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.priceHistory.findMany({
        where: { listingId: input.listingId },
        orderBy: { createdAt: "asc" },
      });
    }),

  setAlert: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        targetPrice: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.priceAlert.upsert({
        where: {
          userId_listingId: {
            userId: ctx.userId,
            listingId: input.listingId,
          },
        },
        create: {
          userId: ctx.userId,
          listingId: input.listingId,
          targetPrice: input.targetPrice,
        },
        update: {
          targetPrice: input.targetPrice,
          triggered: false,
        },
      });
    }),

  removeAlert: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.priceAlert.deleteMany({
        where: { userId: ctx.userId, listingId: input.listingId },
      });
      return { ok: true };
    }),

  myAlerts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.priceAlert.findMany({
      where: { userId: ctx.userId },
      include: {
        listing: {
          select: { id: true, title: true, price: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAlert: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.priceAlert.findUnique({
        where: {
          userId_listingId: {
            userId: ctx.userId,
            listingId: input.listingId,
          },
        },
      });
    }),
});
