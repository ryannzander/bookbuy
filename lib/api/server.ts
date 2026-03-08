import { headers } from "next/headers";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export async function api() {
  const headersList = await headers();
  const ctx = await createTRPCContext({ headers: headersList });
  return createCaller(ctx);
}
