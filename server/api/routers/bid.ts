import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ListingStatus, ListingType } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createNotification } from "@/server/api/notifications";

export const bidRouter = createTRPCRouter({
  place: protectedProcedure
    .input(z.object({ listingId: z.string(), amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: { seller: true, bids: { orderBy: { amount: "desc" }, take: 1 } },
      });
      if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
      if (listing.status !== ListingStatus.AVAILABLE) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Listing not available" });
      }
      if (listing.type !== ListingType.AUCTION) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not an auction" });
      }
      const endsAt = listing.auctionEndsAt;
      if (!endsAt || new Date() >= endsAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Auction has ended" });
      }
      if (listing.sellerId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot bid on your own listing" });
      }
      const minAmount = listing.bids[0] ? Number(listing.bids[0].amount) : Number(listing.price);
      if (input.amount <= minAmount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Bid must be higher than $${minAmount}` });
      }
      const bid = await ctx.db.bid.create({
        data: {
          listingId: listing.id,
          userId: ctx.userId,
          amount: input.amount,
        },
      });
      await createNotification(ctx.db, {
        userId: listing.sellerId,
        type: "BID_RECEIVED",
        title: "New bid on your listing",
        body: `Someone bid $${input.amount} on "${listing.title}".`,
        linkUrl: `/listings/${listing.id}`,
      });
      const previousHighBidder = listing.bids[0]?.userId;
      if (previousHighBidder && previousHighBidder !== ctx.userId) {
        await createNotification(ctx.db, {
          userId: previousHighBidder,
          type: "OUTBID",
          title: "You were outbid",
          body: `Your bid on "${listing.title}" was exceeded.`,
          linkUrl: `/listings/${listing.id}`,
        });
      }
      return bid;
    }),
});
