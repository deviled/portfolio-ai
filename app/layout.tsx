import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindaugas Gudeliūnas • Lead frontend developer",
  description:
    "AI-powered portfolio and mentoring platform by Mindaugas Gudeliūnas, Lead Frontend Developer. A modern web application showcasing professional expertise and providing interactive mentoring capabilities through advanced AI integration.",
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
      </body>
    </html>
  );
}
