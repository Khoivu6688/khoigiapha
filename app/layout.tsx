import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import config from "./config";
import "./globals.css";
import LandingOverlay from "@/components/LandingOverlay"; // 👈 IMPORT ĐÚNG CHỖ

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Gia phả họ Vũ Bá - Thái Bình",
    template: "%s | Gia phả họ Vũ Bá - Thái Bình",
  },
  description: "Gia phả họ Vũ Bá - Thái Bình",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gia phả họ Vũ Bá - Thái Bình",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="Gia phả họ Vũ Bá - Thái Bình"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Gia phả họ Vũ Bá - Thái Bình" />
        <meta name="theme-color" content="#f59e0b" />
      </head>

      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased relative`}
      >
        {/* 👇 ĐẶT OVERLAY Ở ĐÂY */}
        <LandingOverlay />

        {/* 👇 APP CHÍNH */}
        {children}
      </body>
    </html>
  );
}
