import Footer from "@/components/Footer";
import LandingHero from "@/components/LandingHero";
import config from "./config";

export default function HomePage() {
  return (
    <div className="w-full bg-[#F5F2ED]">
      <LandingHero siteName={config.siteName} />
      <Footer className="bg-transparent border-none" />
    </div>
  );
}
