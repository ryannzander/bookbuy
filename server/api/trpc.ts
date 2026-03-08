import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "@/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (supabaseUser) {
    await db.user.upsert({
      where: { id: supabaseUser.id },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
      },
      update: {
        email: supabaseUser.email ?? undefined,
        name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? undefined,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? undefined,
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
