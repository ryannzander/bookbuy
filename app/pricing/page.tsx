"use client";

import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Check, Zap, Star } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { data: me } = api.auth.me.useQuery(undefined, { retry: false });
  const createCheckout = api.stripe.createSubscriptionCheckout.useMutation({
    onSuccess: (data) => { if (data.url) window.location.href = data.url; },
  });
  const isPro = (me as { plan?: string } | undefined)?.plan === "PRO";

  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground">Simple pricing</h1>
        <p className="mt-3 text-muted-foreground text-lg">Free to browse and sell. Upgrade to Pro for more.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center"><Star className="h-6 w-6 text-muted-foreground" /></div>
            <h2 className="text-xl font-bold text-foreground">Free</h2>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> Up to 5 active listings</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> Browse & buy</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> Messages & reviews</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> 5% platform fee on sales</li>
          </ul>
          <Link href="/auth/signup" className="mt-8"><Button variant="outline" size="lg" className="w-full">Get started</Button></Link>
        </div>

        <div className="rounded-2xl border-2 border-foreground bg-card p-8 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-foreground text-background text-xs font-semibold">Popular</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center"><Zap className="h-6 w-6" /></div>
            <h2 className="text-xl font-bold text-foreground">Pro</h2>
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">$4.99<span className="text-base font-normal text-muted-foreground">/month</span></p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> Unlimited active listings</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> Everything in Free</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> Lower fee: 2% on sales</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> Pro badge on profile</li>
          </ul>
          {isPro ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">You&apos;re on Pro</p>
          ) : me ? (
            <Button size="lg" className="w-full mt-8 gap-2" onClick={() => createCheckout.mutate()} disabled={createCheckout.isPending}>
              {createCheckout.isPending ? "Loading..." : "Upgrade to Pro"}
            </Button>
          ) : (
            <Link href="/auth/login?next=/pricing" className="mt-8 block"><Button size="lg" className="w-full">Sign in to upgrade</Button></Link>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">Cancel anytime. Secure payment via Stripe.</p>
    </div>
  );
}
