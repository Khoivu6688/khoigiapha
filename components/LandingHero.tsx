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
    // Màu nền tiệp với màu ảnh để tạo cảm giác không viền
    <div className="w-full min-h-screen bg-[#F5F2ED] flex flex-col items-center">
      <motion.div
        className="relative w-full max-w-[1400px] flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* --- ẢNH NỀN (Mở rộng tối đa, không viền) --- */}
        <div className="w-full overflow-hidden">
          <motion.img
            src="/assets/images/Nen.jpg"
            alt="Gia Phả"
            className="w-full h-auto object-cover sm:object-contain"
            variants={fadeIn}
          />
        </div>

        {/* --- CỤM NỘI DUNG CHÈN LÊN ẢNH --- */}
        {/* Vị trí này sẽ nằm dưới rễ cây và trên dòng chữ lưu trữ cội nguồn */}
        <div className="flex flex-col items-center w-full px-4 -mt-20 sm:-mt-32 z-10">
          
          {/* Cụm nút bấm: Cân đối, Xem gia phả đứng trước */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-md sm:max-w-none justify-center"
            variants={fadeIn}
          >
            {/* Nút Xem gia phả - Màu Đỏ Mận */}
            <button
              onClick={handleGuestLogin}
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-bold text-white bg-[#800000] hover:bg-[#600000] rounded-xl shadow-lg transition-all duration-300 order-1"
            >
              <Users className="size-5" />
              Xem gia phả
            </button>

            {/* Nút Đăng nhập quản trị */}
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-stone-700 bg-white/80 backdrop-blur-sm border border-stone-300 hover:bg-white rounded-xl shadow-md transition-all duration-300 order-2"
            >
              Đăng nhập quản trị
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Dòng chữ giữ nguyên vị trí dưới cùng */}
          <motion.h2
            variants={fadeIn}
            className="text-stone-800 text-xl sm:text-2xl font-bold uppercase tracking-[0.3em] text-center pb-10"
          >
            Lưu Giữ Cội Nguồn
          </motion.h2>
        </div>

      </motion.div>
    </div>
  );
}
