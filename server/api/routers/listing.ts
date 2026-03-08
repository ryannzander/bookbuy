import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ListingType, ListingStatus, type Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { resolveAuctionIfEnded } from "@/server/api/auction";

function isUTSchoolsEmail(email: string) {
  return email.toLowerCase().endsWith("@utschools.ca");
}

const listingCreateInput = z.object({
  title: z.string().min(1),
  courseCode: z.string().optional(),
  author: z.string().min(1),
  isbn: z.string().min(1),
  condition: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().optional(),
  edition: z.string().optional(),
  price: z.number().positive(),
  type: z.enum(["FIXED", "AUCTION"]),
  auctionEndsAt: z.coerce.date().optional(),
  imageUrls: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export const listingRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await resolveAuctionIfEnded(ctx.db, input.id);
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              reviewsReceived: { select: { rating: true } },
            },
          },
          bids: { orderBy: { amount: "desc" }, include: { user: { select: { id: true, name: true } } } },
        },
      });
      return listing;
    }),

  getMany: publicProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      subject: z.string().optional(),
      courseCode: z.string().optional(),
      condition: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      type: z.enum(["FIXED", "AUCTION"]).optional(),
      availability: z.enum(["available", "sold", "all"]).optional(),
      search: z.string().optional(),
      sort: z.enum(["newest", "priceAsc", "priceDesc"]).default("newest"),
    }))
    .query(async ({ ctx, input }) => {
      const where: Prisma.ListingWhereInput = {
        status: ListingStatus.AVAILABLE,
      };
      if (input.availability === "sold") {
        where.status = ListingStatus.SOLD;
      } else if (input.availability === "all") {
        delete where.status;
      }
      if (input.subject) where.subject = input.subject;
      if (input.courseCode) {
        where.courseCode = { contains: input.courseCode, mode: "insensitive" };
      }
      if (input.condition) where.condition = input.condition;
      if (input.type) where.type = input.type as ListingType;
      if (input.minPrice != null || input.maxPrice != null) {
        where.price = {};
        if (input.minPrice != null) where.price.gte = input.minPrice;
        if (input.maxPrice != null) where.price.lte = input.maxPrice;
      }
      if (input.search?.trim()) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { author: { contains: input.search, mode: "insensitive" } },
          { isbn: { contains: input.search, mode: "insensitive" } },
          { courseCode: { contains: input.search, mode: "insensitive" } },
        ];
      }
      const orderBy =
        input.sort === "priceAsc"
          ? { price: "asc" as const }
          : input.sort === "priceDesc"
            ? { price: "desc" as const }
            : { createdAt: "desc" as const };
      const items = await ctx.db.listing.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              reviewsReceived: { select: { rating: true } },
            },
          },
          bids: { orderBy: { amount: "desc" }, take: 1 },
        },
      });
      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next!.id;
      }
      return { items, nextCursor };
    }),

  getMyListings: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.listing.findMany({
      where: { sellerId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(listingCreateInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { verified: true, email: true },
      });
      if (!user || (!user.verified && !isUTSchoolsEmail(user.email))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "A @utschools.ca account is required to create listings",
        });
      }
      if (input.type === "AUCTION" && !input.auctionEndsAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Auction must have auctionEndsAt" });
      }
      const listing = await ctx.db.listing.create({
        data: {
          sellerId: ctx.userId,
          title: input.title,
          author: input.author,
          courseCode: input.courseCode ?? null,
          isbn: input.isbn,
          condition: input.condition,
          subject: input.subject,
          description: input.description ?? null,
          edition: input.edition ?? null,
          price: input.price,
          type: input.type as ListingType,
          auctionEndsAt: input.auctionEndsAt ?? null,
          imageUrls: input.imageUrls ?? null,
          isFeatured: input.isFeatured ?? false,
        },
      });
      await ctx.db.priceHistory.create({ data: { listingId: listing.id, price: input.price } });
      return listing;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(listingCreateInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({ where: { id: input.id } });
      if (!listing || listing.sellerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (listing.status !== ListingStatus.AVAILABLE) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot edit sold or ended listing" });
      }
      const { id, ...data } = input;
      if (data.price != null && data.price !== Number(listing.price)) {
        await ctx.db.priceHistory.create({ data: { listingId: id, price: data.price } });
        const alerts = await ctx.db.priceAlert.findMany({
          where: { listingId: id, triggered: false, targetPrice: { gte: data.price } },
        });
        if (alerts.length > 0) {
          await ctx.db.priceAlert.updateMany({ where: { id: { in: alerts.map((a) => a.id) } }, data: { triggered: true } });
          await ctx.db.notification.createMany({
            data: alerts.map((a) => ({
              userId: a.userId, type: "PRICE_DROP", title: "Price Drop Alert!",
              body: `"${listing.title}" dropped to $${data.price}`, linkUrl: `/listings/${id}`,
            })),
          });
        }
      }
      return ctx.db.listing.update({
        where: { id },
        data: {
          ...data,
          auctionEndsAt: data.auctionEndsAt ?? undefined,
          imageUrls: data.imageUrls ?? undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({ where: { id: input.id } });
      if (!listing || listing.sellerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.listing.delete({ where: { id: input.id } });
      return { ok: true };
    }),

  getSimilar: publicProcedure
    .input(z.object({ listingId: z.string(), limit: z.number().min(1).max(10).default(4) }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({ where: { id: input.listingId }, select: { subject: true, courseCode: true, sellerId: true } });
      if (!listing) return [];
      return ctx.db.listing.findMany({
        where: {
          id: { not: input.listingId },
          status: "AVAILABLE",
          OR: [
            ...(listing.courseCode ? [{ courseCode: listing.courseCode }] : []),
            { subject: listing.subject },
          ],
        },
        include: { seller: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.listing.findMany({
        where: {
          status: "AVAILABLE",
          OR: [
            { title: { contains: input.query, mode: "insensitive" } },
            { author: { contains: input.query, mode: "insensitive" } },
            { isbn: { contains: input.query, mode: "insensitive" } },
            { courseCode: { contains: input.query, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, author: true, price: true, courseCode: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      });
    }),

  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.listing.deleteMany({ where: { id: { in: input.ids }, sellerId: ctx.userId } });
      return { ok: true };
    }),

  bulkMarkSold: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.listing.updateMany({ where: { id: { in: input.ids }, sellerId: ctx.userId, status: "AVAILABLE" }, data: { status: "SOLD" } });
      return { ok: true };
    }),

  archiveExpired: publicProcedure.mutation(async ({ ctx }) => {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await ctx.db.listing.updateMany({
      where: { status: "AVAILABLE", updatedAt: { lt: ninetyDaysAgo } },
      data: { status: "SOLD" },
    });
    return { archived: result.count };
  }),
});
