"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowRight, Check, Mail } from "lucide-react";

function isAllowedSchoolEmail(value: string) {
  const email = value.trim().toLowerCase();
  return /^[^@\s]+@utschools\.ca$/.test(email);
}

function cleanAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("user already")) {
    return "An account with this email already exists. Try logging in.";
  }
  if (lower.includes("password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  return message;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!isAllowedSchoolEmail(normalizedEmail)) {
      setError("You must sign up with a @utschools.ca email address.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: name || undefined } },
    });
    setLoading(false);
    if (err) {
      setError(cleanAuthError(err.message));
      return;
    }
    setSent(true);
    router.refresh();
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </span>
              <span className="text-2xl font-bold text-foreground">BuyBook</span>
            </Link>
          </div>

          {/* Success Card */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-6">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Check your email
            </h1>
            <p className="mt-3 text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Click it to finish signing up.
            </p>
            <Link href="/auth/login" className="block mt-6">
              <Button variant="outline" size="lg" className="w-full">
                Back to Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </span>
              <span className="text-2xl font-bold text-foreground">BuyBook</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Create your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Join the student textbook marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@utschools.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                  Use your school email (@utschools.ca) to get verified seller status
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Sign up
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-foreground hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
