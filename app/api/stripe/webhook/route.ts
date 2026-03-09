import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { createNotification } from "@/server/api/notifications";
import { ListingStatus, PurchaseStatus } from "@prisma/client";
import { BOOST_DAYS } from "@/lib/monetization";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const type = session.metadata?.type;

        if (type === "purchase") {
          const listingId = session.metadata?.listingId;
          const buyerId = session.metadata?.buyerId;
          const feeCents = Number(session.metadata?.feeCents ?? 0);
          if (!listingId || !buyerId) break;

          const listing = await db.listing.findUnique({
            where: { id: listingId },
            include: { seller: { select: { id: true } } },
          });
          if (!listing || listing.status !== ListingStatus.AVAILABLE) break;

          const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

          await db.$transaction([
            db.purchase.create({
              data: {
                listingId,
                buyerId,
                sellerId: listing.sellerId,
                status: PurchaseStatus.PENDING,
                finalPrice: listing.price,
                platformFeeCents: feeCents,
                stripePaymentId: paymentIntentId,
              },
            }),
            db.listing.update({
              where: { id: listingId },
              data: { status: ListingStatus.SOLD },
            }),
          ]);

          await createNotification(db, {
            userId: listing.sellerId,
            type: "SALE",
            title: "Your listing was purchased",
            body: `Someone bought "${listing.title}" and paid with card.`,
            linkUrl: "/dashboard/orders",
          });
          await createNotification(db, {
            userId: buyerId,
            type: "PURCHASE",
            title: "Purchase confirmed",
            body: `You bought "${listing.title}". Contact seller to arrange pickup.`,
            linkUrl: "/dashboard/orders",
          });
        } else if (type === "boost") {
          const listingId = session.metadata?.listingId;
          if (!listingId) break;
          const end = new Date();
          end.setDate(end.getDate() + BOOST_DAYS);
          await db.listing.update({
            where: { id: listingId },
            data: { isFeatured: true, featuredUntil: end },
          });
        } else if (type === "subscription") {
          const userId = session.metadata?.userId;
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          if (!userId) break;
          await db.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              stripeCustomerId: customerId ?? undefined,
              stripeSubscriptionId: subscriptionId ?? undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionId = sub.id;
        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          select: { id: true },
        });
        if (!user) break;
        const active = sub.status === "active" || sub.status === "trialing";
        await db.user.update({
          where: { id: user.id },
          data: {
            plan: active ? "PRO" : "FREE",
            stripeSubscriptionId: active ? subscriptionId : null,
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
