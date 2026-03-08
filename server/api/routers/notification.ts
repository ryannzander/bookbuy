import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  getMine: protectedProcedure
    .input(z.object({
      unreadOnly: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where = { userId: ctx.userId, ...(input.unreadOnly ? { read: false } : {}) };
      const items = await ctx.db.notification.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });
      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next!.id;
      }
      return { items, nextCursor };
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.count({
      where: { userId: ctx.userId, read: false },
    });
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        await ctx.db.notification.updateMany({
          where: { id: input.id, userId: ctx.userId },
          data: { read: true },
        });
      } else {
        await ctx.db.notification.updateMany({
          where: { userId: ctx.userId },
          data: { read: true },
        });
      }
      return { ok: true };
    }),
});
