import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, MessageSquare, Shield, Users } from "lucide-react";
import { LandingStats } from "@/components/landing/landing-stats";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with teal gradient and orb effect */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3d38] via-[#0a2f2a] to-[#071a18]" />
        
        {/* Large glowing orb in center-bottom */}
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 h-[800px] w-[1200px] rounded-full bg-gradient-to-t from-[#2dd4bf]/40 via-[#2dd4bf]/20 to-transparent blur-[100px]" />
        
        {/* Secondary glow on right */}
        <div className="absolute top-[10%] right-[5%] h-[400px] w-[400px] rounded-full bg-[#2dd4bf]/10 blur-[80px]" />
        
        {/* Subtle top-left accent */}
        <div className="absolute top-0 left-0 h-[300px] w-[500px] bg-gradient-to-br from-[#5eead4]/10 to-transparent blur-[60px]" />
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-start">
            {/* Left Column - Main Content */}
            <div className="max-w-2xl animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.1]">
                Textbook Exchange
                <br />
                <span className="text-[#5eead4]">For Students</span>
              </h1>

              <p className="mt-8 text-lg text-white/60 max-w-md leading-relaxed">
                The trusted marketplace for students to buy and sell textbooks at your school, without the markup.
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
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative mt-8 sm:mt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              number="01"
              title="Verified Students"
              description="Only school email addresses allowed. Trade with confidence knowing you're dealing with real students."
            />
            <FeatureCard
              number="02"
              title="Zero Fees"
              description="No commissions, no hidden charges. Keep 100% of what you sell your books for."
            />
            <FeatureCard
              number="03"
              title="Secure Messaging"
              description="Chat with buyers and sellers directly in-app."
            />
            <FeatureCard
              number="04"
              title="Trusted Reviews"
              description="Ratings help you find reliable sellers. Build your reputation with each successful trade."
              showDescription
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
      <footer className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg bg-[#2dd4bf]/20 text-[#5eead4] inline-flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="font-medium text-white">BookBuy</span>
            </div>
            <p className="text-sm text-white/40">
              Built for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  number,
  title,
  description,
  showDescription = false,
}: {
  number: string;
  title: string;
  description: string;
  showDescription?: boolean;
}) {
  return (
    <div className="group relative rounded-3xl bg-[#0d3d38]/40 backdrop-blur-sm border border-[#2dd4bf]/10 p-6 sm:p-8 min-h-[280px] flex flex-col hover:border-[#2dd4bf]/20 hover:bg-[#0d3d38]/50 transition-all duration-300">
      {/* Number */}
      <span className="text-sm font-medium text-white/40 mb-auto">
        {number}
      </span>
      
      {/* Content at bottom */}
      <div className="mt-auto">
        <h3 className="text-xl font-medium text-white mb-2">
          {title}
        </h3>
        {showDescription && (
          <p className="text-sm text-white/50 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Hover description for non-shown cards */}
      {!showDescription && (
        <div className="absolute inset-0 rounded-3xl bg-[#0d3d38]/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 sm:p-8 flex flex-col">
          <span className="text-sm font-medium text-white/40 mb-auto">
            {number}
          </span>
          <div className="mt-auto">
            <h3 className="text-xl font-medium text-white mb-3">
              {title}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
