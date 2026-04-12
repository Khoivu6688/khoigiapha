"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

interface LandingHeroProps {
  siteName: string;
}

export default function LandingHero({ siteName }: LandingHeroProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleGuestLogin = async () => {
    try {
      const guestEmail = process.env.NEXT_PUBLIC_GUEST_EMAIL;
      const guestPass = process.env.NEXT_PUBLIC_GUEST_PASS;
      if (!guestEmail || !guestPass) return;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPass,
      });
      if (data?.user) router.push("/public");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    /** * p-0 và m-0 đảm bảo không có khoảng cách bao quanh.
     * Nếu vẫn hở, hãy kiểm tra file layout.tsx xem có padding ở Navbar không.
     */
    <div className="w-full min-h-screen bg-[#F5F2ED] flex flex-col items-center p-0 m-0">
      <motion.div
        className="relative w-full flex flex-col items-center p-0 m-0"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* --- ẢNH NỀN: SÁT MÉP TRÊN TUYỆT ĐỐI --- */}
        <div className="w-full block leading-none p-0 m-0 border-none">
          <motion.img
            src="/assets/images/Nen.jpg"
            alt="Gia Phả"
            className="w-full h-auto object-contain block p-0 m-0"
            variants={fadeIn}
          />
        </div>

        {/* --- CỤM NÚT BẤM: KÉO LÊN VỊ TRÍ RỄ CÂY (Tăng Margin âm để kéo cao hơn) --- */}
        <div className="relative w-full flex justify-center px-4 -mt-[150px] sm:-mt-[250px] md:-mt-[350px] lg:-mt-[450px] z-20">
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none"
            variants={fadeIn}
          >
            {/* Nút Xem gia phả - Đỏ Mận - Ưu tiên trên/trước */}
            <button
              onClick={handleGuestLogin}
              className="group inline-flex items-center justify-center gap-3 px-10 py-4 text-lg font-bold text-white bg-[#800000] hover:bg-[#600000] rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 order-1"
            >
              <Users className="size-6" />
              Xem gia phả
            </button>

            {/* Nút Đăng nhập quản trị - Sau/Dưới */}
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-stone-700 bg-white/90 backdrop-blur-md border border-stone-200 hover:bg-white rounded-xl shadow-xl transition-all duration-300 order-2"
            >
              Đăng nhập quản trị
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="pb-20"></div>
      </motion.div>
    </div>
  );
}
