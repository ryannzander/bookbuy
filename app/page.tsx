import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, MessageSquare, Shield, Users } from "lucide-react";
import { LandingStats } from "@/components/landing/landing-stats";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 mb-8">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                Student-to-student textbook exchange
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
              The smarter way to
              <br />
              <span className="text-muted-foreground">buy and sell</span>
              <br />
              textbooks.
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Connect with verified students at your school. List your books, message sellers, and complete exchanges with confidence.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/auth/signup">
                <Button size="xl" className="group">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="xl">
                  Browse Marketplace
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <LandingStats />
          </div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-foreground/5 blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-foreground/3 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Everything you need to trade textbooks
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for students, by students. No fees, no middlemen.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Shield}
              title="Verified Students"
              description="Only @utschools.ca emails allowed. Trade with confidence."
            />
            <FeatureCard
              icon={MessageSquare}
              title="In-App Messaging"
              description="Chat with sellers and schedule meetups directly in the app."
            />
            <FeatureCard
              icon={Users}
              title="Trusted Reviews"
              description="Ratings and reviews help you find reliable sellers."
            />
            <FeatureCard
              icon={BookOpen}
              title="Auctions & Fixed"
              description="List at a fixed price or let buyers bid for the best deal."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three simple steps to start trading textbooks
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <StepCard
              number="01"
              title="Sign up with school email"
              description="Create your account using your @utschools.ca email to join the trusted marketplace."
            />
            <StepCard
              number="02"
              title="List or browse books"
              description="Filter by subject, course code, condition, and price to find exactly what you need."
            />
            <StepCard
              number="03"
              title="Meet and exchange"
              description="Coordinate in-app, meet in person for payment, and leave reviews after each exchange."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
              Ready to save on textbooks?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Join students trading textbooks at your school.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="xl" className="group">
                  Create Free Account
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="outline" size="xl">
                  View Top Sellers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-foreground text-background inline-flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="font-bold text-foreground">BookBuy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:border-muted-foreground/30 transition-all duration-200">
      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="text-7xl font-bold text-foreground/10 mb-4">{number}</div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
