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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    createReview.mutate({ purchaseId, rating: values.rating, comment: values.comment });
  }

  if (!purchases) {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  if (!purchase) {
    return (
      <div>
        <p>Purchase not found.</p>
        <Link href="/dashboard"><Button variant="outline" className="mt-4">Back to dashboard</Button></Link>
      </div>
    );
  }
  if (purchase.review) {
    return (
      <div>
        <p>You already left a review for this purchase.</p>
        <Link href="/dashboard"><Button variant="outline" className="mt-4">Back to dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Leave a review</CardTitle>
          <CardDescription>
            Rate your experience buying &quot;{purchase.listing.title}&quot; from {purchase.listing.seller?.name ?? "the seller"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1–5 stars)</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                {...form.register("rating")}
              />
              {form.formState.errors.rating && (
                <p className="text-sm text-destructive">{form.formState.errors.rating.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Input id="comment" {...form.register("comment")} placeholder="How did it go?" />
            </div>
            {createReview.error && (
              <p className="text-sm text-destructive">{createReview.error.message}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending ? "Submitting…" : "Submit review"}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
