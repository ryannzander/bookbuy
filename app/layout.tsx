import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookBuy – School Book Exchange",
  description: "List, buy, and sell textbooks at your school.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <TRPCProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
