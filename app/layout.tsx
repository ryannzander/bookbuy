import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { AppShell } from "@/components/app-shell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuyBook – School Book Exchange",
  description: "List, buy, and sell textbooks at your school.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <TRPCProvider>
          <AppShell>{children}</AppShell>
        </TRPCProvider>
        <Analytics />
      </body>
    </html>
  );
}
