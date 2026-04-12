"use client";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LandingHero() {
  const router = useRouter();
  const supabase = createClient();

  const handleGuestLogin = async () => {
    const { data } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_GUEST_EMAIL!,
      password: process.env.NEXT_PUBLIC_GUEST_PASS!,
    });
    if (data?.user) router.push("/public");
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F2ED] flex flex-col p-0 m-0 overflow-x-hidden">
      
      {/* ẢNH NỀN: object-cover thay vì object-contain → không hở lề trên/dưới */}
      <div className="w-full relative">
        <img
          src="/assets/images/Nen.jpg"
          alt="Gia Phả"
          className="w-full h-[60vh] sm:h-[75vh] object-cover object-top block"
        />
      </div>

      {/* CỤM NÚT BẤM: In-flow (không dùng absolute) → co giãn theo màn hình */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full flex flex-col sm:flex-row items-center justify-center
                   gap-3 sm:gap-4 px-4 py-6 sm:py-8"
      >
        {/* Nút Xem gia phả */}
        <button
          onClick={handleGuestLogin}
          className="group inline-flex items-center justify-center gap-2
                     w-full sm:w-auto
                     px-6 py-3 sm:px-10 sm:py-4
                     text-sm sm:text-lg font-bold
                     text-white bg-[#800000] hover:bg-[#600000]
                     rounded-xl shadow-lg transition-all"
        >
          <Users className="size-4 sm:size-6 flex-shrink-0" />
          <span>Xem gia phả</span>
        </button>

        {/* Nút Đăng nhập quản trị */}
        <Link
          href="/login"
          className="group inline-flex items-center justify-center gap-2
                     w-full sm:w-auto
                     px-5 py-3 sm:px-8 sm:py-4
                     text-sm sm:text-base font-semibold
                     text-stone-600 bg-white/90 backdrop-blur-md
                     border border-stone-200 rounded-xl shadow transition-all
                     hover:bg-white"
        >
          Đăng nhập quản trị
          <ArrowRight className="size-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

    </div>
  );
}
