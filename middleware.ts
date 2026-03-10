import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authRateLimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // ─── Rate limit auth routes (login, signup, forgot-password, reset) ───
  if (path.startsWith("/auth/") || path.startsWith("/api/auth")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const result = authRateLimit(ip);
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.resetMs / 1000)),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  }

  // ─── Rate limit tRPC API endpoint ─────────────────────────────────────
  if (path.startsWith("/api/trpc")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const { rateLimit } = await import("@/lib/rate-limit");
    const result = rateLimit(`api:${ip}`, 200, 60 * 1000);
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many API requests. Slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.resetMs / 1000)),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  }

  // ─── Supabase session + protected route redirect ──────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const protectedPaths = ["/dashboard", "/listings/new", "/notifications", "/settings", "/wishlist", "/courses", "/admin", "/messages", "/onboarding"];
  const isProtected = protectedPaths.some((p) => path === p || path.startsWith(p + "/"));
  const isEditListing = /^\/listings\/[^/]+\/edit$/.test(path);
  if ((isProtected || isEditListing) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signup";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  // ─── Security headers on all responses ──────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
