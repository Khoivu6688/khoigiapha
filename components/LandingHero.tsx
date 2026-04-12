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
    <div className="w-full flex justify-center items-start">
      <motion.div
       className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px] rounded-2xl overflow-hidden shadow-xl shadow-stone-400/30"
        
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* ẢNH NỀN */}
        <img
          src="/assets/images/Nen.jpg"
          alt="Gia Phả Vũ Bá Tộc - Thái Bình"
          className="w-full h-auto block"
        />

        {/*
          NÚT OVERLAY:
          - px-6 hai bên tạo lề trái phải
          - gap-2 khoảng cách giữa 2 nút
          - flex-1 trên mỗi nút → 2 nút chia đôi chiều rộng còn lại
          - h-9: chiều cao cố định để 2 nút luôn bằng nhau
          - text và icon tự scale theo % card
        */}
        <div className="absolute bottom-[16%] left-0 right-0 z-20 flex flex-row items-stretch justify-center gap-2 px-6">

          {/* Xem gia phả — đỏ mận */}
          <button
            onClick={handleGuestLogin}
            className="flex-1 inline-flex items-center justify-center gap-1.5
                       h-9 max-w-[140px]
                       text-[11px] font-bold tracking-wide
                       text-white bg-[#6B0F1A] hover:bg-[#550C15] active:bg-[#3D0910]
                       rounded-lg shadow-lg shadow-black/40
                       transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <Users className="size-3.5 flex-shrink-0" />
            <span>Xem gia phả</span>
          </button>

          {/* Đăng nhập — kính mờ */}
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-1
                       h-9 max-w-[140px]
                       text-[11px] font-semibold
                       text-stone-800 bg-white/70 hover:bg-white/90
                       backdrop-blur-md border border-white/50
                       rounded-lg shadow-md
                       transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <span>Đăng nhập</span>
            <ArrowRight className="size-3 flex-shrink-0" />
          </Link>

        </div>
      </motion.div>
    </div>
  );
}
