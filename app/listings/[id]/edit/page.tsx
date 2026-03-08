"use client";

import { useEffect, useState } from "react";
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
  title: z.string().min(1, "Title required"),
  courseCode: z.string().optional(),
  author: z.string().min(1, "Author required"),
  isbn: z.string().min(1, "ISBN required"),
  condition: z.string().min(1, "Condition required"),
  subject: z.string().min(1, "Subject required"),
  edition: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  type: z.enum(["FIXED", "AUCTION"]),
  auctionEndsAt: z.string().optional(),
}).refine(
  (data) => data.type !== "AUCTION" || (data.auctionEndsAt && new Date(data.auctionEndsAt) > new Date()),
  { message: "Auction must have an end date in the future", path: ["auctionEndsAt"] }
);

type FormData = z.infer<typeof schema>;

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: listing, isLoading } = api.listing.getById.useQuery({ id });
  const [type, setType] = useState<"FIXED" | "AUCTION">("FIXED");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      courseCode: "",
      author: "",
      isbn: "",
      condition: "",
      subject: "",
      edition: "",
      description: "",
      price: 0,
      type: "FIXED",
    },
  });

  useEffect(() => {
    if (!listing) return;
    if (listing.status !== "AVAILABLE") {
      router.replace(`/listings/${id}`);
      return;
    }
    setType(listing.type as "FIXED" | "AUCTION");
    form.reset({
      title: listing.title,
      courseCode: listing.courseCode ?? "",
      author: listing.author,
      isbn: listing.isbn,
      condition: listing.condition,
      subject: listing.subject,
      edition: listing.edition ?? "",
      description: listing.description ?? "",
      price: Number(listing.price),
      type: listing.type as "FIXED" | "AUCTION",
      auctionEndsAt: listing.auctionEndsAt
        ? new Date(listing.auctionEndsAt).toISOString().slice(0, 16)
        : "",
    });
  }, [listing, id, router]);

  const update = api.listing.update.useMutation({
    onSuccess: () => {
      router.push(`/listings/${id}`);
    },
  });

  function onSubmit(values: FormData) {
    update.mutate({
      id,
      ...values,
      auctionEndsAt: values.auctionEndsAt ? new Date(values.auctionEndsAt) : undefined,
    });
  }

  if (isLoading || !listing) {
    return (
      <div className="py-8">
        {isLoading ? <p className="text-muted-foreground">Loading…</p> : <p>Listing not found.</p>}
      </div>
    );
  }

  if (listing.status !== "AVAILABLE") {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit listing</CardTitle>
          <CardDescription>Update your textbook listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" {...form.register("author")} />
              {form.formState.errors.author && (
                <p className="text-sm text-destructive">{form.formState.errors.author.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course code (optional)</Label>
              <Input id="courseCode" {...form.register("courseCode")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" {...form.register("isbn")} />
              {form.formState.errors.isbn && (
                <p className="text-sm text-destructive">{form.formState.errors.isbn.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input id="condition" {...form.register("condition")} />
              {form.formState.errors.condition && (
                <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...form.register("subject")} />
              {form.formState.errors.subject && (
                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edition">Edition (optional)</Label>
              <Input id="edition" {...form.register("edition")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                {...form.register("description")}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step={0.01} {...form.register("price")} />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Listing type</Label>
              <input type="hidden" {...form.register("type")} />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(e) => {
                  const v = e.target.value as "FIXED" | "AUCTION";
                  setType(v);
                  form.setValue("type", v);
                }}
              >
                <option value="FIXED">Buy now (fixed price)</option>
                <option value="AUCTION">Auction</option>
              </select>
            </div>
            {type === "AUCTION" && (
              <div className="space-y-2">
                <Label htmlFor="auctionEndsAt">Auction end (date & time)</Label>
                <Input
                  id="auctionEndsAt"
                  type="datetime-local"
                  {...form.register("auctionEndsAt")}
                />
                {form.formState.errors.auctionEndsAt && (
                  <p className="text-sm text-destructive">{form.formState.errors.auctionEndsAt.message}</p>
                )}
              </div>
            )}
            {update.error && (
              <p className="text-sm text-destructive">{update.error.message}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Link href={`/listings/${id}`}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
