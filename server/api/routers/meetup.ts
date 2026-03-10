import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { MeetupStatus, PurchaseStatus } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createNotification } from "@/server/api/notifications";
import { containsProfanity, PROFANITY_MESSAGE } from "@/lib/profanity";

export const meetupRouter = createTRPCRouter({
  schedule: protectedProcedure
    .input(
      z.object({
        purchaseId: z.string(),
        startTime: z.coerce.date(),
        endTime: z.coerce.date().optional(),
        location: z.string().min(2).max(200).optional().refine((s) => !s || !containsProfanity(s), PROFANITY_MESSAGE),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({
        where: { id: input.purchaseId },
        include: { listing: true },
      });
      if (!purchase) throw new TRPCError({ code: "NOT_FOUND" });
      if (purchase.buyerId !== ctx.userId && purchase.sellerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const meetup = await ctx.db.meetup.upsert({
        where: { purchaseId: purchase.id },
        create: {
          purchaseId: purchase.id,
          startTime: input.startTime,
          endTime: input.endTime ?? null,
          location: input.location ?? null,
          status: MeetupStatus.SCHEDULED,
        },
        update: {
          startTime: input.startTime,
          endTime: input.endTime ?? null,
          location: input.location ?? null,
          status: MeetupStatus.SCHEDULED,
        },
      });
      await ctx.db.purchase.update({
        where: { id: purchase.id },
        data: { meetupDate: input.startTime, status: PurchaseStatus.PENDING },
      });
      const otherUserId = purchase.buyerId === ctx.userId ? purchase.sellerId : purchase.buyerId;
      await createNotification(ctx.db, {
        userId: otherUserId,
        type: "MEETUP_SCHEDULED",
        title: "Exchange meetup scheduled",
        body: `A meetup was scheduled for "${purchase.listing.title}".`,
        linkUrl: "/dashboard/orders",
      });
      return meetup;
    }),

  completeOrder: protectedProcedure
    .input(z.object({ purchaseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.db.purchase.findUnique({ where: { id: input.purchaseId } });
      if (!purchase) throw new TRPCError({ code: "NOT_FOUND" });
      if (purchase.buyerId !== ctx.userId && purchase.sellerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.purchase.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.COMPLETED },
      });
      await ctx.db.meetup.updateMany({
        where: { purchaseId: purchase.id },
        data: { status: MeetupStatus.COMPLETED },
      });
      return { ok: true };
    }),

  upcoming: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.meetup.findMany({
      where: {
        status: { in: [MeetupStatus.SCHEDULED, MeetupStatus.PENDING] },
        purchase: {
          OR: [{ buyerId: ctx.userId }, { sellerId: ctx.userId }],
        },
      },
      include: {
        purchase: {
          include: {
            listing: true,
            buyer: { select: { id: true, name: true } },
            seller: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
  }),
});
