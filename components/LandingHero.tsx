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
        alert("Cấu hình hệ thống chưa hoàn tất.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPass,
      });

      if (error) {
        alert("Không thể đăng nhập tài khoản khách.");
        return;
      }

      if (data?.user) router.push("/public");
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
  };

  return (
    /*
      Wrapper ngoài cùng:
      - p-0 m-0 loại bỏ mọi lề
      - bg-[#F5F2ED] khớp màu nền ảnh để hòa vào nhau
      - overflow-x-hidden chặn scroll ngang
    */
    <div className="w-full p-0 m-0 bg-[#F5F2ED] overflow-x-hidden">

      {/*
        KHỐI ẢNH + NÚT:
        - relative để đặt nút absolute bên trong
        - leading-[0] triệt tiêu gap line-height dưới ảnh
        - Không có padding/margin nào
      */}
      <div className="relative w-full leading-[0]">

        {/* ẢNH NỀN Nen.jpg
            - w-full h-auto block: lấp đầy chiều ngang, tự co theo tỷ lệ
            - KHÔNG max-h, KHÔNG object-contain, KHÔNG border, KHÔNG rounded
            - Hòa vào background #F5F2ED tự nhiên
        */}
        <motion.img
          src="/assets/images/Nen.jpg"
          alt="Gia Phả Vũ Bá Tộc - Thái Bình"
          className="w-full h-auto block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        />

        {/*
          CỤM NÚT BẤM:
          - absolute bottom-[22%]: vùng rễ cây đa (khoảng 22% từ đáy ảnh)
          - Trên mobile: flex-col, nút full-width nhỏ gọn
          - Trên sm+: flex-row, nút tự co theo nội dung
        */}
        <motion.div
          className="
            absolute bottom-[22%] left-0 right-0 z-20
            flex flex-col sm:flex-row
            items-center justify-center
            gap-2 sm:gap-4
            px-6 sm:px-0
          "
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >

          {/* NÚT TRÁI: Xem gia phả — đỏ mận, mặc định */}
          <button
            onClick={handleGuestLogin}
            className="
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              px-5 py-2.5 sm:px-8 sm:py-3.5
              text-sm sm:text-base
              font-bold tracking-wide
              text-white
              bg-[#6B0F1A] hover:bg-[#550C15] active:bg-[#3D0910]
              rounded-xl
              shadow-xl shadow-black/30
              transition-all duration-200
              active:scale-95
            "
          >
            <Users className="size-4 sm:size-5 flex-shrink-0" />
            <span>Xem gia phả</span>
          </button>

          {/* NÚT PHẢI: Đăng nhập quản trị — nền trắng trong */}
          <Link
            href="/login"
            className="
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              px-5 py-2.5 sm:px-7 sm:py-3.5
              text-sm sm:text-base
              font-semibold
              text-stone-700 hover:text-stone-900
              bg-white/75 hover:bg-white/95
              backdrop-blur-sm
              border border-white/60
              rounded-xl
              shadow-lg
              transition-all duration-200
              active:scale-95
            "
          >
            <span>Đăng nhập quản trị</span>
            <ArrowRight className="size-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>

        </motion.div>
      </div>

      {/* KHÔNG có div padding/margin nào ở dưới */}
    </div>
  );
}
