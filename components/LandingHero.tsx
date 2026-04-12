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
        className="max-w-4xl w-full flex flex-col items-center -mt-8 sm:-mt-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* --- KHỐI HÌNH ẢNH MỚI --- */}
        <div className="w-full">
          <motion.div variants={fadeIn}> 
            <img 
              src="/assets/images/Nen.jpg" 
              alt="Gia Phả"            
              className="
                w-full 
                h-auto 
                rounded-2xl 
                shadow-2xl 
                object-contain
                border-4 border-amber-200/40
              "
            />
          </motion.div>
        </div>

        {/* --- CỤM NÚT BẤM (Đã đổi thứ tự) --- */}
        <motion.div
          className="
            mt-10 
            flex flex-col sm:flex-row-reverse gap-4 
            justify-center items-center w-full px-4
            z-20
          "
          variants={fadeIn}
        >
          {/* Nút Đăng nhập quản trị - Đưa xuống dưới/sau */}
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all duration-300 w-full sm:w-auto order-2 sm:order-2"
          >
            Đăng nhập quản trị
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Nút Xem gia phả - Ưu tiên lên trước/trên */}
          <button
            onClick={handleGuestLogin}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto order-1 sm:order-1"
          >
            <Users className="size-5" />
            Xem gia phả
          </button>
        </motion.div>

        {/* --- DÒNG CHỮ CHÂN TRANG --- */}
        <motion.p 
          variants={fadeIn}
          className="mt-12 text-stone-400 font-medium text-xs sm:text-sm italic pb-10"
        >
          Hệ thống quản lý gia phả trực tuyến
        </motion.p>

      </motion.div>
    </div>
  );
}
