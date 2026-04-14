import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import LandingOverlay from "@/components/LandingOverlay";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <LandingOverlay />
        {children}
      </body>
    </html>
  );
}
