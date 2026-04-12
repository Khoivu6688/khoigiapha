import Footer from "@/components/Footer";
import LandingHero from "@/components/LandingHero";
import config from "./config";

export default function HomePage() {
  return (
    <div className="w-full bg-[#F5F2ED]">
      <main className="w-full p-0 m-0">
        <LandingHero siteName={config.siteName} />
      </main>
      <Footer className="bg-transparent border-none" />
    </div>
  );
}
