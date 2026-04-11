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
        className="max-w-4xl w-full flex flex-col items-center -mt-10 sm:-mt-16" // Đẩy toàn bộ khối lên sát đỉnh
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* --- PHẦN HÌNH ẢNH --- */}
        <div className="w-full relative">
          {/* Banner chính */}
          <motion.div variants={fadeIn} className="relative z-0">
            <img
              src="/assets/images/banner.jpg"
              alt="GIA PHẢ HỌ VŨ BÁ TỘC"
              className="w-full h-auto rounded-t-2xl shadow-lg border-x-4 border-t-4 border-amber-200/50"
            />
          </motion.div>

          {/* Ảnh nội dung (Nen.jpg) */}
          <motion.div variants={fadeIn} className="relative z-0 -mt-1"> 
            <img 
              src="/assets/images/Nen.jpg" 
              alt="Giới thiệu Gia phả"            
              className="
                w-full 
                h-auto 
                rounded-b-2xl 
                shadow-2xl 
                object-contain
                opacity-60         /* Đã chỉnh độ mờ 60% */
                border-x-4 border-b-4 border-amber-200/30
              "
            />
          </motion.div>

          {/* --- CỤM NÚT BẤM (Nằm trong relative của ảnh để kiểm soát vị trí) --- */}
          <motion.div
            className="
              absolute bottom-8 left-0 right-0     /* Đưa nút vào trong khung ảnh */
              flex flex-col sm:flex-row gap-4 justify-center items-center px-4
              z-10
            "
            variants={fadeIn}
          >
            {/* Hiệu ứng nền mờ dưới nút để nổi bật chữ */}
            <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full -z-10 mx-auto w-2/3 h-20"></div>

            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-stone-900/90 hover:bg-stone-800 rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              Đăng nhập Admin
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleGuestLogin}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-amber-900 bg-white/90 backdrop-blur-sm border border-amber-200 hover:bg-amber-50 rounded-xl shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              Xem gia phả
              <Users className="size-4 group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* --- DÒNG CHỮ PHỤNG LẬP (Nằm dưới nút, tách biệt hẳn) --- */}
        <motion.p 
          variants={fadeIn}
          className="mt-6 text-stone-500 font-medium text-sm sm:text-base italic"
        >
          VŨ VĂN KHỞI - phụng lập năm Bính Ngọ, 2026
        </motion.p>

      </motion.div>
    </div>
  );
}
