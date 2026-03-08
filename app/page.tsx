import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 py-10">
      <section className="rounded-3xl border border-border bg-card/70 p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              Student-to-student textbook exchange
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Buy and sell textbooks faster at UTSchools.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              BookBuy helps students list books, message sellers, schedule meetup exchanges, and
              build trusted reputations with verified reviews.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/auth/signup">
                <Button size="lg">Get started</Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg">Browse marketplace</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost" size="lg">View top sellers</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-5">
            <p className="text-sm font-semibold text-foreground">Why students use BookBuy</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="rounded-xl border border-border/70 bg-card px-3 py-2">
                Verified `@utschools.ca` accounts only
              </li>
              <li className="rounded-xl border border-border/70 bg-card px-3 py-2">
                In-app messages and meetup scheduling
              </li>
              <li className="rounded-xl border border-border/70 bg-card px-3 py-2">
                Seller ratings, reviews, and leaderboard trust
              </li>
              <li className="rounded-xl border border-border/70 bg-card px-3 py-2">
                Fixed-price listings and auction support
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">1. Sign up with school email</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your account with a valid `@utschools.ca` email to join the marketplace.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">2. List or browse books</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Filter by subject, course code, condition, and price to find the right book quickly.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground">3. Meet and complete exchange</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Coordinate in-app, meet in person for payment, and leave reviews after each exchange.
          </p>
        </div>
      </section>
    </div>
  );
}
