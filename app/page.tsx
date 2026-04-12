import Footer from "@/components/Footer";
import LandingHero from "@/components/LandingHero";
import config from "./config";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col relative overflow-hidden selection:bg-amber-200 selection:text-amber-900">
      
      {/* Bỏ hết decorative blur/grid — chúng đè lên ảnh Nen.jpg */}

      {/* main: bỏ py-20, px-4 — để LandingHero tự fill */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full p-0">
        <LandingHero siteName={config.siteName} />
      </main>

      {/* Footer giữ nguyên */}
      <Footer className="bg-transparent relative z-10 border-none" />
    </div>
  );
}
