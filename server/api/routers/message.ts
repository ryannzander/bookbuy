import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createNotification } from "@/server/api/notifications";
import { containsProfanity, PROFANITY_MESSAGE } from "@/lib/profanity";

function normalizeThreadUsers(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export const messageRouter = createTRPCRouter({
  listThreads: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.messageThread.findMany({
      where: {
        OR: [{ userAId: ctx.userId }, { userBId: ctx.userId }],
      },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true } },
        userB: { select: { id: true, name: true, avatarUrl: true } },
        listing: { select: { id: true, title: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  getThread: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.messageThread.findUnique({
        where: { id: input.threadId },
        include: {
          userA: { select: { id: true, name: true, avatarUrl: true } },
          userB: { select: { id: true, name: true, avatarUrl: true } },
          listing: { select: { id: true, title: true } },
          messages: {
            orderBy: { createdAt: "asc" },
            include: { sender: { select: { id: true, name: true } } },
          },
        },
      });
      if (!thread || (thread.userAId !== ctx.userId && thread.userBId !== ctx.userId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return thread;
    }),

  createThread: protectedProcedure
    .input(z.object({ otherUserId: z.string(), listingId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (input.otherUserId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot message yourself" });
      }
      const [userAId, userBId] = normalizeThreadUsers(ctx.userId, input.otherUserId);
      const existing = await ctx.db.messageThread.findFirst({
        where: {
          userAId,
          userBId,
          listingId: input.listingId ?? null,
        },
      });
      if (existing) return existing;
      return ctx.db.messageThread.create({
        data: {
          userAId,
          userBId,
          listingId: input.listingId ?? null,
        },
      });
    }),

  send: protectedProcedure
    .input(z.object({ threadId: z.string(), body: z.string().min(1).max(1000).refine((s) => !containsProfanity(s), PROFANITY_MESSAGE) }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.messageThread.findUnique({ where: { id: input.threadId } });
      if (!thread || (thread.userAId !== ctx.userId && thread.userBId !== ctx.userId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const recipientId = thread.userAId === ctx.userId ? thread.userBId : thread.userAId;
      const sender = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { name: true } });
      const message = await ctx.db.$transaction(async (tx) => {
        const msg = await tx.message.create({
          data: { threadId: thread.id, senderId: ctx.userId, body: input.body },
        });
        await tx.messageThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });
        return msg;
      });
      await createNotification(ctx.db, {
        userId: recipientId,
        type: "MESSAGE",
        title: "New message",
        body: `${sender?.name ?? "Someone"}: ${input.body.slice(0, 80)}${input.body.length > 80 ? "..." : ""}`,
        linkUrl: `/messages?thread=${thread.id}`,
      });
      return message;
    }),

  markRead: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.messageThread.findUnique({ where: { id: input.threadId } });
      if (!thread || (thread.userAId !== ctx.userId && thread.userBId !== ctx.userId)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.message.updateMany({
        where: {
          threadId: input.threadId,
          senderId: { not: ctx.userId },
          read: false,
        },
        data: { read: true },
      });
      return { ok: true };
    }),
});
