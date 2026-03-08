import { Inter } from "next/font/google";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { api } from "@/lib/api/server";
import { redirect } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-dashboard",
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const caller = await api();
  const [me, unreadCount] = await Promise.all([
    caller.auth.me(),
    caller.notification.unreadCount(),
  ]);

  if (!me) {
    redirect("/auth/login?next=/dashboard");
  }

  return (
    <div
      className={`${inter.variable} dashboard-theme min-h-screen flex font-sans bg-[#1a1a1a] text-white antialiased`}
      style={{ fontFamily: "var(--font-dashboard), Inter, system-ui, sans-serif" }}
    >
      <DashboardSidebar unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          unreadCount={unreadCount}
          user={{
            id: me.id,
            name: me.name,
            username: (me.name ?? me.email.split("@")[0]).toLowerCase(),
            email: me.email,
            avatarUrl: me.avatarUrl ?? null,
            schoolName: null,
            verified: true,
            createdAt: me.createdAt.toISOString(),
          }}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
