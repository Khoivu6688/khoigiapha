"use client";

import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Users,
} from "lucide-react";
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

      if (!guestEmail || !guestPass) {
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPass,
      });

      if (data?.user) {
        router.push("/public");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // Đổi bg sang màu giấy cổ để hòa hợp với ảnh Nen.jpg
    <div className="w-full min-h-screen flex justify-center px-4 bg-[#F5F2ED]">
      <motion.div
        className="max-w-4xl w-full flex flex-col items-center pt-10 sm:pt-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* --- TIÊU ĐỀ --- */}
        <motion.h2 
          variants={fadeIn}
          className="text-stone-800 text-2xl sm:text-3xl font-bold mb-8 uppercase tracking-widest"
        >
          Lưu Giữ Cội Nguồn
        </motion.h2>

        {/* --- CỤM NÚT BẤM (Đưa lên trên ảnh) --- */}
        <motion.div
          className="
            mb-10 
            flex flex-col sm:flex-row gap-4 
            justify-center items-center w-full px-4
          "
          variants={fadeIn}
        >
          {/* Nút Xem gia phả - Màu Đỏ Mận (Maroon) */}
          <button
            onClick={handleGuestLogin}
            className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-bold text-white bg-[#800000] hover:bg-[#600000] rounded-full transition-all duration-300 w-full sm:w-auto order-1"
          >
            <Users className="size-5" />
            Xem gia phả
          </button>

          {/* Nút Đăng nhập quản trị - Tông màu trầm hòa hợp nền */}
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-stone-600 border border-stone-300 hover:bg-stone-200/50 rounded-full transition-all duration-300 w-full sm:w-auto order-2"
          >
            Đăng nhập quản trị
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* --- ẢNH NỀN (Bỏ viền, bỏ bóng mờ) --- */}
        <div className="w-full">
          <motion.div variants={fadeIn}> 
            <img 
              src="/assets/images/Nen.jpg" 
              alt="Gia Phả"            
              className="
                w-full 
                h-auto 
                object-contain
                /* Đã loại bỏ shadow, border và opacity để hòa vào nền */
              "
            />
          </motion.div>
        </div>

        {/* --- CHÂN TRANG --- */}
        <motion.p 
          variants={fadeIn}
          className="mt-12 text-stone-400 font-medium text-xs italic pb-10"
        >
          Hệ thống quản lý gia phả trực tuyến © 2026
        </motion.p>

      </motion.div>
    </div>
  );
}
