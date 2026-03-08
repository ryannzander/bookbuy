import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { listingRouter } from "@/server/api/routers/listing";
import { purchaseRouter } from "@/server/api/routers/purchase";
import { reviewRouter } from "@/server/api/routers/review";
import { sellerRouter } from "@/server/api/routers/seller";
import { bidRouter } from "@/server/api/routers/bid";
import { notificationRouter } from "@/server/api/routers/notification";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  listing: listingRouter,
  purchase: purchaseRouter,
  review: reviewRouter,
  seller: sellerRouter,
  bid: bidRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
