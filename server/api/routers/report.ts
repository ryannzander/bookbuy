import { z } from "zod";
import { createTRPCRouter, protectedProcedure, sensitiveProcedure } from "@/server/api/trpc";

export const reportRouter = createTRPCRouter({
  create: sensitiveProcedure
    .input(
      z.object({
        targetUserId: z.string().optional(),
        listingId: z.string().optional(),
        reason: z.string().min(3).max(80),
        details: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.report.create({
        data: {
          reporterId: ctx.userId,
          targetUserId: input.targetUserId ?? null,
          listingId: input.listingId ?? null,
          reason: input.reason,
          details: input.details ?? null,
        },
      });
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.report.findMany({
      where: { reporterId: ctx.userId },
      include: {
        targetUser: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
});
