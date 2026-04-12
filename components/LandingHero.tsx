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
    <div className="w-full flex flex-col items-center bg-[#F5F2ED] p-0 m-0 overflow-x-hidden">
      <motion.div
        className="relative w-full max-w-[1920px] flex flex-col items-center p-0 m-0"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* --- KHỐI ẢNH CHÍNH: SÁT MÉP TRÊN --- */}
        <div className="w-full relative leading-none">
          <motion.img
            src="/assets/images/Nen.jpg"
            alt="Gia Phả"
            className="w-full h-auto block"
            variants={fadeIn}
          />

          {/* --- CỤM NÚT BẤM: ĐẶT TRỰC TIẾP LÊN ẢNH (Vị trí rễ cây) --- */}
          {/* bottom-[15%] sẽ đẩy cụm nút lên trên khoảng 15% chiều cao ảnh từ dưới lên */}
          <div className="absolute bottom-[10%] sm:bottom-[15%] left-0 right-0 flex justify-center px-4 z-20">
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
              variants={fadeIn}
            >
              {/* Nút Xem gia phả - Đỏ Mận - Đứng trước/trên */}
              <button
                onClick={handleGuestLogin}
                className="group inline-flex items-center justify-center gap-3 px-10 py-4 text-lg font-bold text-white bg-[#800000] hover:bg-[#600000] rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 order-1 w-full sm:w-auto"
              >
                <Users className="size-6" />
                Xem gia phả
              </button>

              {/* Nút Đăng nhập quản trị - Đứng sau/dưới */}
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-stone-700 bg-white/90 backdrop-blur-md border border-stone-200 hover:bg-white rounded-xl shadow-xl transition-all duration-300 order-2 w-full sm:w-auto"
              >
                Đăng nhập quản trị
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Khoảng đệm nhỏ dưới cùng để Footer không dính sát ảnh */}
        <div className="h-10 w-full bg-[#F5F2ED]"></div>
      </motion.div>
    </div>
  );
}
