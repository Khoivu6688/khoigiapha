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
        console.error("Thiếu thông tin Guest trong .env.local");
        alert("Cấu hình hệ thống chưa hoàn tất.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPass,
      });

      if (error) {
        console.error("Lỗi đăng nhập:", error.message);
        alert("Không thể đăng nhập tài khoản khách.");
        return;
      }

      if (data?.user) {
        router.push("/public");
      }
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
  };

  return (
    <div className="w-full flex justify-center px-4">
      <motion.div
        className="max-w-4xl w-full flex flex-col items-center -mt-12 sm:-mt-20" // 1. Đẩy toàn bộ khối lên cao nhất
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* --- KHỐI HÌNH ẢNH --- */}
        <div className="w-full space-y-4"> {/* 2. Tạo khoảng cách (gap) giữa Banner và Nen.jpg */}
          
          {/* Banner chính */}
          <motion.div variants={fadeIn}>
            <img
              src="/assets/images/banner.jpg"
              alt="GIA PHẢ HỌ VŨ BÁ TỘC"
              className="w-full h-auto rounded-2xl shadow-lg border-4 border-amber-200/50"
            />
          </motion.div>

          {/* Ảnh nội dung (Nen.jpg) */}
          <motion.div variants={fadeIn}> 
            <img 
              src="/assets/images/Nen.jpg" 
              alt="Giới thiệu Gia phả"            
              className="
                w-full 
                h-auto 
                rounded-2xl 
                shadow-2xl 
                object-contain
                opacity-60         /* Độ mờ 60% */
                border-4 border-amber-200/30
              "
            />
          </motion.div>
        </div>

        {/* --- CỤM NÚT BẤM (Nằm hoàn toàn DƯỚI ảnh) --- */}
        <motion.div
          className="
            mt-8                     /* 3. Khoảng cách dưới ảnh */
            flex flex-col sm:flex-row gap-4 
            justify-center items-center w-full px-4
            z-20
          "
          variants={fadeIn}
        >
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            Đăng nhập Admin
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={handleGuestLogin}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-amber-900 bg-white border border-amber-200 hover:bg-amber-50 rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
          >
            Xem gia phả
            <Users className="size-4 group-hover:scale-110 transition-transform" />
          </button>
        </motion.div>

        {/* --- DÒNG CHỮ PHỤNG LẬP --- */}
        <motion.p 
          variants={fadeIn}
          className="mt-8 text-stone-500 font-medium text-sm sm:text-base italic pb-10"
        >
          VŨ VĂN KHỞI - phụng lập năm Bính Ngọ, 2026
        </motion.p>

      </motion.div>
    </div>
  );
}
