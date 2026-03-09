"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchStreamLink, httpLink, splitLink } from "@trpc/client";
import superjson from "superjson";
import { api } from "@/lib/trpc/client";
import { useState } from "react";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
}

const url = `${getBaseUrl()}/api/trpc`;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === "mutation",
          true: httpLink({
            url,
            transformer: superjson,
            methodOverride: "POST",
          }),
          false: httpBatchStreamLink({
            url,
            transformer: superjson,
          }),
        }),
      ],
    })
  );
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
