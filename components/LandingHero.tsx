"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
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
      const guestPass  = process.env.NEXT_PUBLIC_GUEST_PASS;
      if (!guestEmail || !guestPass) {
        alert("Cấu hình hệ thống chưa hoàn tất.");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPass,
      });
      if (error) { alert("Không thể đăng nhập tài khoản khách."); return; }
      if (data?.user) router.push("/public");
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
  };

  return (
    /*
      Wrapper: căn giữa, KHÔNG padding dọc
      - items-start để card không bị kéo dài theo chiều cao
    */
    <div className="w-full flex justify-center items-start">

      {/*
        CARD wrapper:
        - max-w-sm trên mobile, max-w-md trên tablet
        - rounded-3xl + shadow tạo style "thẻ đứng" như ảnh 3
        - overflow-hidden để nút absolute không tràn ra ngoài bo góc
        - relative để đặt nút bên trong
      */}
      <motion.div
        className="
          relative
          w-full max-w-[360px] sm:max-w-[420px] md:max-w-[480px]
          rounded-3xl overflow-hidden
          shadow-2xl shadow-stone-400/30
        "
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* ẢNH NEN.JPG: lấp đầy card, không bo góc riêng */}
        <img
          src="/assets/images/Nen.jpg"
          alt="Gia Phả Vũ Bá Tộc - Thái Bình"
          className="w-full h-auto block"
        />

        {/*
          NÚT BẤM OVERLAY:
          - absolute bottom-[20%]: vùng rễ cây đa
          - Tính theo % nên tự scale theo kích thước card/ảnh
          - flex-col trên mobile → tự thu nhỏ
          - flex-row trên sm+
        */}
        <div
          className="
            absolute bottom-[20%] left-0 right-0 z-20
            flex flex-col sm:flex-row
            items-center justify-center
            gap-2 sm:gap-3
            px-5 sm:px-6
          "
        >
          {/* NÚT CHÍNH: Xem gia phả — đỏ mận, bên trái */}
          <button
            onClick={handleGuestLogin}
            className="
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              px-4 py-2 sm:px-6 sm:py-3
              text-xs sm:text-sm
              font-bold tracking-wide
              text-white
              bg-[#6B0F1A] hover:bg-[#550C15] active:bg-[#3D0910]
              rounded-xl
              shadow-lg shadow-black/40
              transition-all duration-200
              active:scale-95
            "
          >
            <Users className="size-3.5 sm:size-4 flex-shrink-0" />
            <span>Xem gia phả</span>
          </button>

          {/* NÚT PHỤ: Đăng nhập quản trị — kính mờ */}
          <Link
            href="/login"
            className="
              inline-flex items-center justify-center gap-1.5
              w-full sm:w-auto
              px-4 py-2 sm:px-5 sm:py-3
              text-xs sm:text-sm
              font-semibold
              text-stone-800
              bg-white/70 hover:bg-white/90
              backdrop-blur-md
              border border-white/50
              rounded-xl
              shadow-md
              transition-all duration-200
              active:scale-95
            "
          >
            <span>Đăng nhập quản trị</span>
            <ArrowRight className="size-3.5 flex-shrink-0" />
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
