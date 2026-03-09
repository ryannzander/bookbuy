import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { getStripe } from "@/lib/stripe";

function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Pro subscription is not configured" },
      { status: 500 }
    );
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true, email: true },
  });

  const customerId = dbUser?.stripeCustomerId ?? null;

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { type: "subscription", userId: user.id },
    customer: customerId ?? undefined,
    customer_email: customerId ? undefined : dbUser?.email ?? undefined,
    success_url: `${getBaseUrl()}/dashboard?pro=1`,
    cancel_url: `${getBaseUrl()}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
