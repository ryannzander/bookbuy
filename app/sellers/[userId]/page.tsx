"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SellerPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  useEffect(() => {
    router.replace(`/profile/${userId}`);
  }, [userId, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        Redirecting to profile...
      </div>
    </div>
  );
}
