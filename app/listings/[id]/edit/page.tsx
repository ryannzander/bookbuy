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
import { ArrowLeft, Edit } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

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
}).refine((d) => d.type !== "AUCTION" || (d.auctionEndsAt && new Date(d.auctionEndsAt) > new Date()), { message: "Auction must have an end date in the future", path: ["auctionEndsAt"] });

type FormData = z.infer<typeof schema>;

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: listing, isLoading } = api.listing.getById.useQuery({ id });
  const [type, setType] = useState<"FIXED" | "AUCTION">("FIXED");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { title: "", courseCode: "", author: "", isbn: "", condition: "", subject: "", edition: "", description: "", price: 0, type: "FIXED" } });

  useEffect(() => {
    if (!listing) return;
    if (listing.status !== "AVAILABLE") { router.replace(`/listings/${id}`); return; }
    setType(listing.type as "FIXED" | "AUCTION");
    if (listing.imageUrls) { try { setImageUrls(JSON.parse(listing.imageUrls)); } catch {} }
    form.reset({
      title: listing.title, courseCode: listing.courseCode ?? "", author: listing.author, isbn: listing.isbn,
      condition: listing.condition, subject: listing.subject, edition: listing.edition ?? "", description: listing.description ?? "",
      price: Number(listing.price), type: listing.type as "FIXED" | "AUCTION",
      auctionEndsAt: listing.auctionEndsAt ? new Date(listing.auctionEndsAt).toISOString().slice(0, 16) : "",
    });
  }, [listing, id, router, form]);

  const update = api.listing.update.useMutation({ onSuccess: () => router.push(`/listings/${id}`) });

  function onSubmit(values: FormData) {
    update.mutate({ id, ...values, auctionEndsAt: values.auctionEndsAt ? new Date(values.auctionEndsAt) : undefined, imageUrls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : undefined });
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="flex items-center gap-3 text-muted-foreground"><div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />Loading...</div></div>;
  if (!listing) return <div className="text-center py-20"><p className="text-lg font-semibold text-foreground">Listing not found</p><Link href="/marketplace"><Button variant="outline" className="mt-4">Back to Marketplace</Button></Link></div>;
  if (listing.status !== "AVAILABLE") return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link href={`/listings/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"><ArrowLeft className="h-4 w-4" />Back to listing</Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center"><Edit className="h-7 w-7" /></div>
          <div><h1 className="text-2xl font-bold text-foreground">Edit Listing</h1><p className="text-muted-foreground">Update your textbook listing</p></div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2"><Label>Photos</Label><ImageUpload value={imageUrls} onChange={setImageUrls} maxImages={5} /></div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Title</Label><Input {...form.register("title")} />{form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}</div>
            <div className="space-y-2"><Label>Author</Label><Input {...form.register("author")} />{form.formState.errors.author && <p className="text-sm text-destructive">{form.formState.errors.author.message}</p>}</div>
            <div className="space-y-2"><Label>ISBN</Label><Input {...form.register("isbn")} />{form.formState.errors.isbn && <p className="text-sm text-destructive">{form.formState.errors.isbn.message}</p>}</div>
            <div className="space-y-2"><Label>Subject</Label><Input {...form.register("subject")} />{form.formState.errors.subject && <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>}</div>
            <div className="space-y-2"><Label>Course Code</Label><Input {...form.register("courseCode")} /></div>
            <div className="space-y-2"><Label>Condition</Label><select {...form.register("condition")} className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all"><option value="">Select</option><option value="Like New">Like New</option><option value="Good">Good</option><option value="Acceptable">Acceptable</option><option value="Worn">Worn</option></select>{form.formState.errors.condition && <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>}</div>
            <div className="space-y-2"><Label>Edition</Label><Input {...form.register("edition")} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Description</Label><textarea {...form.register("description")} rows={4} className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all resize-none" /></div>
            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step={0.01} {...form.register("price")} />{form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}</div>
            <div className="space-y-2"><Label>Type</Label><input type="hidden" {...form.register("type")} /><select className="flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-all" value={type} onChange={(e) => { const v = e.target.value as "FIXED" | "AUCTION"; setType(v); form.setValue("type", v); }}><option value="FIXED">Buy Now</option><option value="AUCTION">Auction</option></select></div>
            {type === "AUCTION" && <div className="space-y-2 sm:col-span-2"><Label>Auction End</Label><Input type="datetime-local" {...form.register("auctionEndsAt")} />{form.formState.errors.auctionEndsAt && <p className="text-sm text-destructive">{form.formState.errors.auctionEndsAt.message}</p>}</div>}
          </div>

          {update.error && <p className="text-sm text-destructive">{update.error.message}</p>}
          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" disabled={update.isPending} className="flex-1 sm:flex-none">{update.isPending ? "Saving..." : "Save Changes"}</Button>
            <Link href={`/listings/${id}`}><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
