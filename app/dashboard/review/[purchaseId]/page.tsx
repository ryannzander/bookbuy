"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, ArrowLeft } from "lucide-react";

const schema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LeaveReviewPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = params.purchaseId as string;
  const { data: purchases } = api.purchase.myPurchases.useQuery();
  const purchase = purchases?.find((p) => p.id === purchaseId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, comment: "" },
  });

  const createReview = api.review.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  function onSubmit(values: FormData) {
    createReview.mutate({
      purchaseId,
      rating: values.rating,
      comment: values.comment,
    });
  }

  if (!purchases) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-foreground font-semibold">Purchase not found.</p>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (purchase.review) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-foreground font-semibold">
          You already left a review for this purchase.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Leave a Review</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rate your experience buying &quot;{purchase.listing.title}&quot;
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="rating" className="text-foreground">
              Rating (1-5 stars)
            </Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              {...form.register("rating")}
            />
            {form.formState.errors.rating && (
              <p className="text-sm text-destructive">
                {form.formState.errors.rating.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment" className="text-foreground">
              Comment (optional)
            </Label>
            <Input
              id="comment"
              {...form.register("comment")}
              placeholder="How did it go?"
            />
          </div>

          {createReview.error && (
            <p className="text-sm text-destructive">
              {createReview.error.message}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createReview.isPending}
              className="flex-1"
            >
              {createReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
