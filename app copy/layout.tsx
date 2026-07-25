import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/providers/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cluster Doctor AI",
    template: "%s | Cluster Doctor AI",
  },
  description:
    "Enterprise AI platform for cluster monitoring, prediction, digital twin visualization, workload migration, and autonomous recovery.",
  applicationName: "Cluster Doctor AI",
  keywords: [
    "AI",
    "Cluster",
    "Digital Twin",
    "Telemetry",
    "Prediction",
    "Recovery",
    "Monitoring",
    "FastAPI",
    "Next.js",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}