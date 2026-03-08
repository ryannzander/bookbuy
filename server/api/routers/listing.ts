import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ListingType, ListingStatus } from "@prisma/client";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { resolveAuctionIfEnded } from "@/server/api/auction";

const listingCreateInput = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(1),
  condition: z.string().min(1),
  subject: z.string().min(1),
  price: z.number().positive(),
  type: z.enum(["FIXED", "AUCTION"]),
  auctionEndsAt: z.coerce.date().optional(),
  imageUrls: z.string().optional(),
});

export const listingRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      await resolveAuctionIfEnded(ctx.db, input.id);
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.id },
        include: {
          seller: { select: { id: true, name: true, avatarUrl: true } },
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
      condition: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      type: z.enum(["FIXED", "AUCTION"]).optional(),
      search: z.string().optional(),
      sort: z.enum(["newest", "priceAsc", "priceDesc"]).default("newest"),
    }))
    .query(async ({ ctx, input }) => {
      const where: {
        status: ListingStatus;
        subject?: string;
        condition?: string;
        type?: ListingType;
        price?: { gte?: number; lte?: number };
        OR?: Array<{ title?: { contains: string; mode: "insensitive" }; author?: { contains: string; mode: "insensitive" }; isbn?: { contains: string; mode: "insensitive" } }>;
      } = {
        status: ListingStatus.AVAILABLE,
      };
      if (input.subject) where.subject = input.subject;
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
          seller: { select: { id: true, name: true } },
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
      if (input.type === "AUCTION" && !input.auctionEndsAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Auction must have auctionEndsAt" });
      }
      return ctx.db.listing.create({
        data: {
          sellerId: ctx.userId,
          title: input.title,
          author: input.author,
          isbn: input.isbn,
          condition: input.condition,
          subject: input.subject,
          price: input.price,
          type: input.type as ListingType,
          auctionEndsAt: input.auctionEndsAt ?? null,
          imageUrls: input.imageUrls ?? null,
        },
      });
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
});
