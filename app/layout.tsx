import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindaugas Gudeliūnas",
  description:
    "Lead Frontend Developer Mindaugas Gudeliūnas' interactive portfolio featuring AI-powered mentoring. Explore professional projects, get personalized guidance, and experience cutting-edge web development expertise.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark:text-white bg-white dark:bg-black min-h-dvh flex flex-col justify-between antialiased">
        <main className="flex h-screen px-6 py-2">
          {children}
          <Toaster richColors theme="system" />
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
