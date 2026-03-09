import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, MessageSquare, Shield, Users, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-4xl animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-8 animate-fade-in delay-100">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Student-to-student textbook exchange
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
              The smarter way to
              <br />
              <span className="gradient-text">buy and sell</span>
              <br />
              textbooks.
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-in delay-200">
              Connect with verified students at your school. List your books, message sellers, and complete exchanges with confidence.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in delay-300">
              <Link href="/auth/signup">
                <Button variant="primary" size="xl" className="group">
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
            <div className="mt-16 flex flex-wrap gap-12 sm:gap-16 animate-fade-in delay-400">
              <div className="group">
                <p className="text-4xl sm:text-5xl font-bold text-foreground group-hover:text-primary transition-colors">500+</p>
                <p className="mt-1 text-sm text-muted-foreground">Active Listings</p>
              </div>
              <div className="group">
                <p className="text-4xl sm:text-5xl font-bold text-foreground group-hover:text-primary transition-colors">1,200+</p>
                <p className="mt-1 text-sm text-muted-foreground">Verified Students</p>
              </div>
              <div className="group">
                <p className="text-4xl sm:text-5xl font-bold text-foreground group-hover:text-primary transition-colors">$45K+</p>
                <p className="mt-1 text-sm text-muted-foreground">Saved by Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background gradients */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-1/3 -left-20 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
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
              delay="delay-100"
            />
            <FeatureCard
              icon={MessageSquare}
              title="In-App Messaging"
              description="Chat with sellers and schedule meetups directly in the app."
              delay="delay-200"
            />
            <FeatureCard
              icon={Users}
              title="Trusted Reviews"
              description="Ratings and reviews help you find reliable sellers."
              delay="delay-300"
            />
            <FeatureCard
              icon={BookOpen}
              title="Auctions & Fixed"
              description="List at a fixed price or let buyers bid for the best deal."
              delay="delay-400"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/50 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
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
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="relative rounded-3xl border border-border bg-card p-8 sm:p-12 lg:p-16 text-center overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 h-[200px] w-[300px] rounded-full bg-primary/10 blur-[80px]" />
              <div className="absolute bottom-0 right-1/4 h-[150px] w-[250px] rounded-full bg-accent/10 blur-[60px]" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
              Ready to save on textbooks?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of students already trading textbooks at your school.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/auth/signup">
                <Button variant="primary" size="xl" className="group">
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
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground inline-flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="font-bold text-foreground">BuyBook</span>
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
  delay = "",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: string;
}) {
  return (
    <div className={`group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_20px_rgba(139,92,246,0.05)] transition-all duration-300 animate-fade-in-up ${delay}`}>
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
        <Icon className="h-6 w-6 text-primary" />
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
    <div className="relative group">
      <div className="text-7xl font-bold bg-gradient-to-br from-primary/20 to-accent/10 bg-clip-text text-transparent mb-4 group-hover:from-primary/30 group-hover:to-accent/20 transition-all">{number}</div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
