"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      router.replace("/");
      router.refresh();
    });
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground">Signing out…</p>
    </div>
  );
}
