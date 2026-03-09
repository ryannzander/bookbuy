import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session_id } = (await req.json()) as { session_id?: string };
  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    if (session.metadata?.type !== "subscription" || session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: "Invalid session" }, { status: 403 });
    }

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    await db.user.update({
      where: { id: user.id },
      data: {
        plan: "PRO",
        stripeCustomerId: customerId ?? undefined,
        stripeSubscriptionId: subscriptionId ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Confirm subscription error:", err);
    return NextResponse.json({ error: "Failed to confirm subscription" }, { status: 500 });
  }
}
