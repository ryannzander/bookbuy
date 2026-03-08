"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Upload } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ value, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      setUploading(true);
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (value.length + newUrls.length >= maxImages) break;
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("listing-images")
          .upload(path, file, { upsert: false });
        if (!error) {
          const { data } = supabase.storage
            .from("listing-images")
            .getPublicUrl(path);
          newUrls.push(data.publicUrl);
        }
      }
      onChange([...value, ...newUrls]);
      setUploading(false);
      e.target.value = "";
    },
    [value, onChange, maxImages, supabase]
  );

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary">
            <img src={url} alt={`Listing image ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        ))}
        {value.length < maxImages && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-6 w-6 animate-pulse" />
                <span className="text-xs">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Add photo</span>
              </div>
            )}
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxImages} images uploaded
      </p>
    </div>
  );
}
