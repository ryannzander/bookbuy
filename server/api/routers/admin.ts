import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.db.user.findUnique({
    where: { id: ctx.userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = createTRPCRouter({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalListings, openReports, totalSales] =
      await Promise.all([
        ctx.db.user.count(),
        ctx.db.listing.count(),
        ctx.db.report.count({ where: { status: "OPEN" } }),
        ctx.db.purchase.count({ where: { status: "COMPLETED" } }),
      ]);
    return { totalUsers, totalListings, openReports, totalSales };
  }),

  getReports: adminProcedure
    .input(
      z.object({
        status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.report.findMany({
        where: input.status ? { status: input.status } : {},
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          targetUser: { select: { id: true, name: true, email: true } },
          listing: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  updateReport: adminProcedure
    .input(
      z.object({
        reportId: z.string(),
        status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.report.update({
        where: { id: input.reportId },
        data: { status: input.status },
      });
    }),

  getUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: "insensitive" as const } },
              { email: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
        : {};
      return ctx.db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          verified: true,
          role: true,
          createdAt: true,
          _count: { select: { listings: true, purchases: true, sales: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  banUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.listing.updateMany({
        where: { sellerId: input.userId, status: "AVAILABLE" },
        data: { status: "SOLD" },
      });
      await ctx.db.notification.create({
        data: {
          userId: input.userId,
          type: "ACCOUNT_BANNED",
          title: "Account Restricted",
          body: "Your account has been restricted by an administrator. Your listings have been removed.",
        },
      });
      return { ok: true };
    }),

  removeListing: adminProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
      });
      if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.listing.delete({ where: { id: input.listingId } });
      await ctx.db.notification.create({
        data: {
          userId: listing.sellerId,
          type: "LISTING_REMOVED",
          title: "Listing Removed",
          body: `Your listing "${listing.title}" was removed by an administrator for policy violations.`,
        },
      });
      return { ok: true };
    }),
});
