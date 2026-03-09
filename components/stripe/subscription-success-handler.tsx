"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function SubscriptionSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const pro = searchParams.get("pro");

    if (pro !== "1" || !sessionId) return;

    fetch("/api/stripe/confirm-subscription", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.json())
      .then(() => {
        router.replace("/dashboard", { scroll: false });
      })
      .catch(() => {
        router.replace("/dashboard", { scroll: false });
      });
  }, [searchParams, router]);

  return null;
}
