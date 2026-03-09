import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ListingStatus } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getStripe, getStripePublishableKey } from "@/lib/stripe";
import { BOOST_PRICE_CENTS, BOOST_DAYS, computePlatformFeeCents } from "@/lib/monetization";

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
};

export const stripeRouter = createTRPCRouter({
  createPurchaseCheckout: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: { seller: { select: { id: true, plan: true } } },
      });
      if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
      if (listing.status !== ListingStatus.AVAILABLE) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Listing is not available" });
      }
      if (listing.sellerId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot buy your own listing" });
      }
      const amountCents = Math.round(Number(listing.price) * 100);
      const isPro = listing.seller.plan === "PRO";
      const feeCents = computePlatformFeeCents(amountCents, isPro);

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: listing.title,
                description: `by ${listing.author} • ${listing.condition}`,
                images: listing.imageUrls ? (() => { try { const u = JSON.parse(listing.imageUrls); return Array.isArray(u) ? u.slice(0, 1) : [u]; } catch { return []; } })() : undefined,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "purchase",
          listingId: listing.id,
          buyerId: ctx.userId,
          sellerId: listing.sellerId,
          feeCents: String(feeCents),
        },
        success_url: `${getBaseUrl()}/dashboard/orders?paid=1`,
        cancel_url: `${getBaseUrl()}/listings/${listing.id}`,
      });

      return { url: session.url!, sessionId: session.id };
    }),

  createBoostCheckout: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        select: { id: true, title: true, sellerId: true },
      });
      if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
      if (listing.sellerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your listing" });
      }

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: "Boost listing",
                description: `Feature "${listing.title}" at the top of the marketplace for ${BOOST_DAYS} days`,
              },
              unit_amount: BOOST_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "boost",
          listingId: listing.id,
          userId: ctx.userId,
        },
        success_url: `${getBaseUrl()}/listings/${listing.id}?boosted=1`,
        cancel_url: `${getBaseUrl()}/listings/${listing.id}`,
      });

      return { url: session.url!, sessionId: session.id };
    }),

  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account found" });
    }
    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getBaseUrl()}/settings`,
    });
    return { url: session.url };
  }),

  publishableKey: protectedProcedure.query(() => getStripePublishableKey()),
});
