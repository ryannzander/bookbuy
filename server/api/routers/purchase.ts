import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ListingStatus, ListingType, PurchaseStatus } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, sensitiveProcedure } from "@/server/api/trpc";
import { createNotification } from "@/server/api/notifications";
import { computePlatformFeeCents } from "@/lib/monetization";

export const purchaseRouter = createTRPCRouter({
  purchase: sensitiveProcedure
    .input(z.object({
      listingId: z.string(),
      stripePaymentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: { seller: { select: { id: true, plan: true } } },
      });
      if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
      if (listing.status !== ListingStatus.AVAILABLE) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Listing is not available" });
      }
      if (listing.type !== ListingType.FIXED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Use bids for auctions" });
      }
      if (listing.sellerId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot buy your own listing" });
      }
      const priceCents = Math.round(Number(listing.price) * 100);
      const isProSeller = listing.seller.plan === "PRO";
      const platformFeeCents = computePlatformFeeCents(priceCents, isProSeller);

      const [purchase] = await ctx.db.$transaction([
        ctx.db.purchase.create({
          data: {
            listingId: listing.id,
            buyerId: ctx.userId,
            sellerId: listing.sellerId,
            status: PurchaseStatus.PENDING,
            finalPrice: listing.price,
            platformFeeCents,
            stripePaymentId: input.stripePaymentId ?? null,
          },
        }),
        ctx.db.listing.update({
          where: { id: listing.id },
          data: { status: ListingStatus.SOLD },
        }),
      ]);
      await createNotification(ctx.db, {
        userId: listing.sellerId,
        type: "SALE",
        title: "Your listing was purchased",
        body: `Someone bought "${listing.title}". Arrange in-person payment.`,
        linkUrl: `/dashboard`,
      });
      await createNotification(ctx.db, {
        userId: ctx.userId,
        type: "PURCHASE",
        title: "Purchase confirmed",
        body: `You bought "${listing.title}". Contact seller to arrange payment. Leave a review after you're done!`,
        linkUrl: `/dashboard`,
      });
      return purchase;
    }),

  myPurchases: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.purchase.findMany({
      where: { buyerId: ctx.userId },
      include: {
        listing: { include: { seller: { select: { id: true, name: true } } } },
        review: true,
        meetup: true,
      },
      orderBy: { purchasedAt: "desc" },
    });
  }),

  mySales: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.purchase.findMany({
      where: { sellerId: ctx.userId },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, email: true } },
        meetup: true,
      },
      orderBy: { purchasedAt: "desc" },
    });
  }),
});
