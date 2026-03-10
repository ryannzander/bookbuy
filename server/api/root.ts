import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { listingRouter } from "@/server/api/routers/listing";
import { purchaseRouter } from "@/server/api/routers/purchase";
import { sellerRouter } from "@/server/api/routers/seller";
import { notificationRouter } from "@/server/api/routers/notification";
import { messageRouter } from "@/server/api/routers/message";
import { meetupRouter } from "@/server/api/routers/meetup";
import { reportRouter } from "@/server/api/routers/report";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { wishlistRouter } from "@/server/api/routers/wishlist";
import { adminRouter } from "@/server/api/routers/admin";
import { courseRouter } from "@/server/api/routers/course";
import { priceRouter } from "@/server/api/routers/price";
import { stripeRouter } from "@/server/api/routers/stripe";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  listing: listingRouter,
  purchase: purchaseRouter,
  seller: sellerRouter,
  notification: notificationRouter,
  message: messageRouter,
  meetup: meetupRouter,
  report: reportRouter,
  analytics: analyticsRouter,
  wishlist: wishlistRouter,
  admin: adminRouter,
  course: courseRouter,
  price: priceRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
