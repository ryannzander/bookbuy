"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  author: z.string().min(1, "Author required"),
  isbn: z.string().min(1, "ISBN required"),
  condition: z.string().min(1, "Condition required"),
  subject: z.string().min(1, "Subject required"),
  price: z.coerce.number().positive("Price must be positive"),
  type: z.enum(["FIXED", "AUCTION"]),
  auctionEndsAt: z.string().optional(),
}).refine(
  (data) => data.type !== "AUCTION" || (data.auctionEndsAt && new Date(data.auctionEndsAt) > new Date()),
  { message: "Auction must have an end date in the future", path: ["auctionEndsAt"] }
);

type FormData = z.infer<typeof schema>;

export default function NewListingPage() {
  const router = useRouter();
  const [type, setType] = useState<"FIXED" | "AUCTION">("FIXED");
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      condition: "",
      subject: "",
      price: 0,
      type: "FIXED",
    },
  });

  const create = api.listing.create.useMutation({
    onSuccess: (data) => {
      router.push(`/listings/${data.id}`);
    },
  });

  function onSubmit(values: FormData) {
    create.mutate({
      ...values,
      auctionEndsAt: values.auctionEndsAt ? new Date(values.auctionEndsAt) : undefined,
    });
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>List a textbook</CardTitle>
          <CardDescription>Add your book to the marketplace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} placeholder="Calculus: Early Transcendentals" />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" {...form.register("author")} placeholder="James Stewart" />
              {form.formState.errors.author && (
                <p className="text-sm text-destructive">{form.formState.errors.author.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" {...form.register("isbn")} placeholder="978-0-13-499554-4" />
              {form.formState.errors.isbn && (
                <p className="text-sm text-destructive">{form.formState.errors.isbn.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input id="condition" {...form.register("condition")} placeholder="Good, Like New, etc." />
              {form.formState.errors.condition && (
                <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...form.register("subject")} placeholder="Math, Biology, etc." />
              {form.formState.errors.subject && (
                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
              )}
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
            {create.error && (
              <p className="text-sm text-destructive">{create.error.message}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create listing"}
              </Button>
              <Link href="/">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
