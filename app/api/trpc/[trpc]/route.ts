import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { NextResponse } from "next/server";

function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Same-origin requests often omit Origin; allow when both are missing
  if (!origin && !referer) return true;

  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    "https://buybook.io",
    "https://www.buybook.io",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ].filter(Boolean) as string[];

  const check = (url: string) => allowed.some((a) => url.startsWith(a));
  if (origin && check(origin)) return true;
  if (referer && check(referer)) return true;

  // Local dev: allow any localhost / 127.0.0.1 origin or referer
  const u = origin ?? referer ?? "";
  try {
    const host = new URL(u).hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
  } catch {
    // ignore invalid URL
  }

  return false;
}

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Cache-Control", "no-store, max-age=0");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const handler = async (req: Request) => {
  if (req.method === "POST" && !isAllowedOrigin(req)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: { "X-Content-Type-Options": "nosniff" } }
    );
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError: ({ error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("tRPC internal error:", error.message);
      }
    },
  });

  return addSecurityHeaders(response);
};

export { handler as GET, handler as POST };
