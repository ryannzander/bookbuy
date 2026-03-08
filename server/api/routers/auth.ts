import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

function isUTSchoolsEmail(email: string) {
  return email.toLowerCase().endsWith("@utschools.ca");
}

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
          username: input.email.split("@")[0],
          verified: isUTSchoolsEmail(input.email),
        },
        update: {
          email: input.email,
          name: input.name ?? undefined,
          avatarUrl: input.avatarUrl ?? undefined,
          verified: isUTSchoolsEmail(input.email),
        },
      });
      return { ok: true };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.userId },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3).max(30),
        schoolName: z.string().min(2).max(80).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          username: input.username.toLowerCase(),
          schoolName: input.schoolName ?? null,
        },
      });
    }),

  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({ where: { id: ctx.userId }, data: { onboarded: true } });
    return { ok: true };
  }),

});
