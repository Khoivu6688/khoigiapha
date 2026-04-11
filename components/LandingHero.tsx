"use client";

import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
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

  // HÀM ĐĂNG NHẬP GUEST
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
    <>
      <motion.div
        className="max-w-5xl text-center space-y-12 w-full relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div className="flex flex-col items-center" variants={fadeIn}>
          {/* BANNER CHÍNH */}
          <motion.div whileHover={{ scale: 1.02 }} className="mb-6">
            <img
              src="/assets/images/banner.jpg"
              alt="GIA PHẢ HỌ VŨ BÁ TỘC - THÁI BÌNH"
              className="w-full max-w-4xl h-auto rounded-2xl shadow-2xl border-4 border-amber-200"
            />
          </motion.div>

          {/* ẢNH GIỚI THIỆU (THAY THẾ ĐOẠN TEXT) - SIZE KHỚP BANNER */}
          <motion.div variants={fadeIn} className="w-full flex justify-center">
            <img 
              src="/assets/images/nen.jpg" 
              alt="Giới thiệu Gia phả họ Vũ Bá"            
              className="
                w-full 
                max-w-4xl           /* Khớp hoàn toàn với banner trên */
                h-auto 
                rounded-2xl         /* Bo góc đồng bộ */
                shadow-xl 
                opacity-100 
                object-contain
                hover:shadow-2xl transition-all duration-500
              "
            />
          </motion.div>
        </motion.div>

        {/* CỤM NÚT BẤM ĐIỀU HƯỚNG */}
        <motion.div
          className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 sm:px-0 relative"
          variants={fadeIn}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-amber-500/20 blur-3xl rounded-full z-0 hidden sm:block"></div>

          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-white bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto z-10"
          >
            Đăng nhập Admin
            <ArrowRight className="size-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>

          <button
            onClick={handleGuestLogin}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto z-10"
          >
            Xem gia phả
            <Users className="size-5 group-hover:scale-110 transition-transform" />
          </button>
        </motion.div>

        {/* CÁC TÍNH NĂNG GIỚI THIỆU BÊN DƯỚI */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left border-t border-stone-200/50 pt-12 relative"
          variants={staggerContainer}
        >
          {[
            {
              icon: <Users className="size-6 text-amber-700" />,
              title: "Quản lý Thành viên",
              desc: "Cập nhật thông tin chi tiết, tiểu sử và hình ảnh của từng thành viên trong dòng họ một cách nhanh chóng và bảo mật.",
            },
            {
              icon: <Network className="size-6 text-amber-700" />,
              title: "Sơ đồ Sáng tạo",
              desc: "Xem trực quan sơ đồ phả hệ, thế hệ và mối quan hệ gia đình với giao diện cây hiện đại, dễ thao tác.",
            },
            {
              icon: <ShieldCheck className="size-6 text-amber-700" />,
              title: "Bảo mật Tối đa",
              desc: "Dữ liệu riêng tư được phân quyền chặt chẽ, bảo vệ an toàn tuyệt đối trên hệ thống điện toán đám mây.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col items-start group"
            >
              <div className="p-3.5 bg-white rounded-2xl mb-6 ring-1 ring-stone-100 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3 font-serif">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-base leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}
