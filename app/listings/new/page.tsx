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
import { ArrowLeft, BookOpen } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

const schema = z
  .object({
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
  })
  .refine(
    (data) =>
      data.type !== "AUCTION" ||
      (data.auctionEndsAt && new Date(data.auctionEndsAt) > new Date()),
    {
      message: "Auction must have an end date in the future",
      path: ["auctionEndsAt"],
    }
  );

type FormData = z.infer<typeof schema>;

export default function NewListingPage() {
  const router = useRouter();
  const [type, setType] = useState<"FIXED" | "AUCTION">("FIXED");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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

  const create = api.listing.create.useMutation({
    onSuccess: (data) => {
      router.push(`/listings/${data.id}`);
    },
  });

  function onSubmit(values: FormData) {
    create.mutate({
      ...values,
      auctionEndsAt: values.auctionEndsAt
        ? new Date(values.auctionEndsAt)
        : undefined,
      imageUrls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create a Listing</h1>
            <p className="text-muted-foreground">Add your textbook to the marketplace</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <ImageUpload value={imageUrls} onChange={setImageUrls} maxImages={5} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
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
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...form.register("subject")} placeholder="Math, Biology, etc." />
              {form.formState.errors.subject && (
                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code (optional)</Label>
              <Input id="courseCode" {...form.register("courseCode")} placeholder="MATH 221" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                {...form.register("condition")}
                className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all"
              >
                <option value="">Select condition</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Acceptable">Acceptable</option>
                <option value="Worn">Worn</option>
              </select>
              {form.formState.errors.condition && (
                <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edition">Edition (optional)</Label>
              <Input id="edition" {...form.register("edition")} placeholder="8th edition" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea
                id="description"
                {...form.register("description")}
                rows={4}
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all resize-none"
                placeholder="Highlight notes, wear, missing pages, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" step={0.01} {...form.register("price")} placeholder="25.00" />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Listing Type</Label>
              <input type="hidden" {...form.register("type")} />
              <select
                className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all"
                value={type}
                onChange={(e) => {
                  const v = e.target.value as "FIXED" | "AUCTION";
                  setType(v);
                  form.setValue("type", v);
                }}
              >
                <option value="FIXED">Buy Now (Fixed Price)</option>
                <option value="AUCTION">Auction</option>
              </select>
            </div>

            {type === "AUCTION" && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="auctionEndsAt">Auction End Date & Time</Label>
                <Input id="auctionEndsAt" type="datetime-local" {...form.register("auctionEndsAt")} />
                {form.formState.errors.auctionEndsAt && (
                  <p className="text-sm text-destructive">{form.formState.errors.auctionEndsAt.message}</p>
                )}
              </div>
            )}
          </div>

          {create.error && (
            <p className="text-sm text-destructive">{create.error.message}</p>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" disabled={create.isPending} className="flex-1 sm:flex-none">
              {create.isPending ? "Creating..." : "Create Listing"}
            </Button>
            <Link href="/marketplace">
              <Button type="button" variant="outline" size="lg">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
