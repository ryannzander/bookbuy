import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const authRouter = createTRPCRouter({
  syncUser: protectedProcedure
    .input(z.object({ email: z.string().email(), name: z.string().optional(), avatarUrl: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.upsert({
        where: { id: ctx.userId },
        create: {
          id: ctx.userId,
          email: input.email,
          name: input.name ?? null,
          avatarUrl: input.avatarUrl ?? null,
        },
        update: {
          email: input.email,
          name: input.name ?? undefined,
          avatarUrl: input.avatarUrl ?? undefined,
        },
      });
      return { ok: true };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.userId },
    });
  }),
});
