"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Calendar, MessageSquare, Star, Clock } from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { data, isLoading } = api.seller.getByUserId.useQuery({ userId });
  const { data: me } = api.auth.me.useQuery(undefined, { retry: false });
  const createThread = api.message.createThread.useMutation({
    onSuccess: (t) => router.push(`/messages?thread=${t.id}`),
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />Loading...</div></div>;
  if (!data) return <div className="text-center py-20"><p className="text-lg font-semibold">User not found</p></div>;

  const { user, listings, reviewsReceived, avgRating, avgResponseMinutes } = data;
  const isOwnProfile = me?.id === userId;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-2xl bg-foreground text-background flex items-center justify-center text-2xl font-bold shrink-0">{user.name?.[0]?.toUpperCase() ?? "?"}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{user.name ?? "User"}</h1>
              {user.verified && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium"><Check className="h-3 w-3" /> Verified</span>}
            </div>
            {user.schoolName && <p className="text-muted-foreground mt-1">{user.schoolName}</p>}
            <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              {avgRating != null && <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-current text-warning" />{avgRating.toFixed(1)} ({reviewsReceived.length} reviews)</span>}
              {avgResponseMinutes != null && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Responds in ~{avgResponseMinutes < 60 ? `${avgResponseMinutes}m` : `${Math.round(avgResponseMinutes / 60)}h`}</span>}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="text-center"><p className="text-2xl font-bold text-foreground">{listings.length}</p><p className="text-xs text-muted-foreground">Listings</p></div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center"><p className="text-2xl font-bold text-foreground">{reviewsReceived.length}</p><p className="text-xs text-muted-foreground">Reviews</p></div>
            </div>
            {!isOwnProfile && (
              <div className="mt-4">
                {me ? (
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={() => createThread.mutate({ otherUserId: userId })}
                    disabled={createThread.isPending}
                  >
                    <MessageSquare className="h-5 w-5" />
                    {createThread.isPending ? "Opening..." : "Message"}
                  </Button>
                ) : (
                  <Link href={"/auth/login?next=/profile/" + userId}>
                    <Button size="lg" variant="outline" className="gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Log in to message
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Active Listings</h2>
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center"><BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No active listings.</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((l) => (
              <Link key={l.id} href={`/listings/${l.id}`} className="rounded-2xl border border-border bg-card p-5 hover:border-muted-foreground/30 transition-colors">
                <h3 className="font-semibold text-foreground line-clamp-1">{l.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{l.author}</p>
                <div className="flex items-center gap-3 mt-3"><span className="text-xl font-bold text-foreground">${Number(l.price)}</span><span className="text-xs text-muted-foreground">{l.condition}</span></div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Star className="h-5 w-5" /> Reviews</h2>
        {reviewsReceived.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center"><Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No reviews yet.</p></div>
        ) : (
          <div className="space-y-4">
            {reviewsReceived.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{r.buyer.name ?? "Buyer"}</span>
                  <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />)}</div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                <p className="text-xs text-muted-foreground mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
