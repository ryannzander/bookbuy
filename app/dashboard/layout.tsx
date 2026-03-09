import { Suspense } from "react";
import { SubscriptionSuccessHandler } from "@/components/stripe/subscription-success-handler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SubscriptionSuccessHandler />
      </Suspense>
      {children}
    </>
  );
}
