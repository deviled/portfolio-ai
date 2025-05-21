import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
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
    <html lang="en" className="dark">
      <body className="dark:text-white bg-white dark:bg-black min-h-dvh flex flex-col justify-between antialiased">
        {children}
        <Toaster richColors theme="system" />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
