import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createNotification } from "@/server/api/notifications";
import { containsProfanity, PROFANITY_MESSAGE } from "@/lib/profanity";

export const reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      purchaseId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional().refine((s) => !s || !containsProfanity(s), PROFANITY_MESSAGE),
    }))
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.purchaseId },
        include: { listing: true },
      });
      if (!purchase) throw new TRPCError({ code: "NOT_FOUND" });
      if (purchase.buyerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the buyer can review" });
      }
      const existing = await ctx.db.review.findUnique({
        where: { purchaseId: input.purchaseId },
      });
      if (existing) throw new TRPCError({ code: "BAD_REQUEST", message: "Already reviewed" });
      const review = await ctx.db.review.create({
        data: {
          purchaseId: input.purchaseId,
          sellerId: purchase.listing.sellerId,
          buyerId: ctx.userId,
          rating: input.rating,
          comment: input.comment ?? null,
        },
      });
      await createNotification(ctx.db, {
        userId: purchase.listing.sellerId,
        type: "REVIEW_RECEIVED",
        title: "You received a new review",
        body: `Your buyer left a ${input.rating}-star review.`,
        linkUrl: `/profile/${purchase.listing.sellerId}`,
      });
      return review;
    }),
});
