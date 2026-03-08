"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/auth/reset-password` }
    );
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center"><BookOpen className="h-6 w-6" /></span>
              <span className="text-2xl font-bold text-foreground">BuyBook</span>
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-6"><Mail className="h-8 w-8 text-success" /></div>
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
            <p className="mt-3 text-muted-foreground">We sent a reset link to <span className="font-medium text-foreground">{email}</span></p>
            <Link href="/auth/login" className="block mt-6"><Button variant="outline" size="lg" className="w-full">Back to Log in</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center"><BookOpen className="h-6 w-6" /></span>
            <span className="text-2xl font-bold text-foreground">BuyBook</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
            <p className="mt-2 text-muted-foreground">Enter your email and we&apos;ll send a reset link</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4"><p className="text-sm text-destructive">{error}</p></div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@utschools.ca" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading || !email}>{loading ? "Sending..." : "Send Reset Link"}</Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
