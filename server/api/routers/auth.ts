import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { containsProfanity, PROFANITY_MESSAGE } from "@/lib/profanity";
import { createAdminClient } from "@/lib/supabase/admin";

function isUTSchoolsEmail(email: string) {
  return email.toLowerCase().endsWith("@utschools.ca");
}

export const authRouter = createTRPCRouter({
  syncUser: protectedProcedure
    .input(z.object({ email: z.string().email(), name: z.string().optional().refine((s) => !s || !containsProfanity(s), PROFANITY_MESSAGE), avatarUrl: z.string().optional() }))
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
        username: z.string().min(3).max(30).refine((s) => !containsProfanity(s), PROFANITY_MESSAGE),
        schoolName: z.string().min(2).max(80).optional().refine((s) => !s || !containsProfanity(s), PROFANITY_MESSAGE),
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

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.db.user.delete({ where: { id: ctx.userId } });
    } catch (e) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete account" });
    }
    const admin = createAdminClient();
    if (admin) {
      try {
        await admin.auth.admin.deleteUser(ctx.userId);
      } catch {
        // Supabase auth delete may fail; DB user is already gone
      }
    }
    return { ok: true };
  }),

});
