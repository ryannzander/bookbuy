import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "@/server/db";
import { queryRateLimit, mutationRateLimit, sensitiveRateLimit } from "@/lib/rate-limit";

function isUTSchoolsEmail(email: string | null | undefined) {
  return (email ?? "").toLowerCase().endsWith("@utschools.ca");
}

function getIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
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
        name: supabaseUser.user_metadata?.name ?? supabaseUser.user_metadata?.full_name ?? null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
        schoolName: supabaseUser.user_metadata?.school_name ?? null,
        verified: isUTSchoolsEmail(supabaseUser.email),
      },
      update: {
        email: supabaseUser.email ?? undefined,
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
    ip: getIp(opts.headers),
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

// ─── Rate-limited public procedure (100 queries/min per IP) ─────────────
const rateLimitQuery = t.middleware(({ ctx, next }) => {
  const key = ctx.userId ?? ctx.ip;
  const result = queryRateLimit(key);
  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in ${Math.ceil(result.resetMs / 1000)}s.`,
    });
  }
  return next();
});

export const publicProcedure = t.procedure.use(rateLimitQuery);

// ─── Auth enforcement ───────────────────────────────────────────────────
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

// ─── Rate-limited protected procedure (30 mutations/min per user) ───────
const rateLimitMutation = t.middleware(({ ctx, next }) => {
  const key = ctx.userId ?? ctx.ip;
  const result = mutationRateLimit(key);
  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many actions. Try again in ${Math.ceil(result.resetMs / 1000)}s.`,
    });
  }
  return next();
});

export const protectedProcedure = t.procedure.use(enforceAuth).use(rateLimitMutation);

// ─── Sensitive procedure (10 per 5 min — purchases, deletes, reports) ───
const rateLimitSensitive = t.middleware(({ ctx, next }) => {
  const key = ctx.userId ?? ctx.ip;
  const result = sensitiveRateLimit(key);
  if (!result.success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `This action is rate limited. Try again in ${Math.ceil(result.resetMs / 1000)}s.`,
    });
  }
  return next();
});

export const sensitiveProcedure = t.procedure.use(enforceAuth).use(rateLimitSensitive);

export const listingOwnerInput = z.object({ listingId: z.string() });
