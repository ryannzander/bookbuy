import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "@/server/db";

function isUTSchoolsEmail(email: string | null | undefined) {
  return (email ?? "").toLowerCase().endsWith("@utschools.ca");
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (supabaseUser) {
    await db.user.upsert({
      where: { id: supabaseUser.id },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
                  username: (supabaseUser.email ?? "").split("@")[0] || null,
        name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
                  schoolName: supabaseUser.user_metadata?.school_name ?? null,
                  verified: isUTSchoolsEmail(supabaseUser.email),
      },
      update: {
        email: supabaseUser.email ?? undefined,
                  username: (supabaseUser.email ?? "").split("@")[0] || undefined,
        name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? undefined,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? undefined,
                  schoolName: supabaseUser.user_metadata?.school_name ?? undefined,
                  verified: isUTSchoolsEmail(supabaseUser.email),
        lastActiveAt: new Date(),
      },
    });
  }
  return {
    db,
    userId: supabaseUser?.id ?? null,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { ...ctx, userId: ctx.userId },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

export const listingOwnerInput = z.object({ listingId: z.string() });
