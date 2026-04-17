"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import LandingHero from "@/components/LandingHero";
import config from "./config";

export default function HomePage() {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("seenLanding");
    if (seen) setShowOverlay(false);
  }, []);

  // 👇 Khi overlay đang hiện → KHÔNG render gì phía dưới
  if (showOverlay) return null;

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col relative overflow-x-hidden">

      {/* nền nhẹ lại (không cần quá nhiều effect) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_50%_-20%,#fef3c7,transparent)] pointer-events-none" />

      <main className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <LandingHero siteName={config.siteName} />
      </main>

      <Footer className="bg-transparent relative z-10 border-none" />
    </div>
  );
}
