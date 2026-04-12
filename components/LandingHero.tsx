"use client";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LandingHero() {
  const router = useRouter();
  const supabase = createClient();

  const handleGuestLogin = async () => {
    const { data } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_GUEST_EMAIL!,
      password: process.env.NEXT_PUBLIC_GUEST_PASS!,
    });
    if (data?.user) router.push("/public");
  };

  return (
    // Xóa min-h-screen, p-0 m-0 tuyệt đối, không flex-col
    <div className="w-full bg-[#F5F2ED] overflow-x-hidden">
      
      {/* WRAPPER ẢNH + NÚT: relative để đặt nút absolute bên trong ảnh */}
      <div className="relative w-full leading-[0]">
        
        {/* ẢNH: w-full h-auto, KHÔNG có max-h, KHÔNG có object-contain */}
        <img
          src="/assets/images/Nen.jpg"
          alt="Gia Phả Vũ Bá - Thái Bình"
          className="w-full h-auto block"
        />

        {/* NÚT BẤM: absolute, bottom 15% tính từ dưới ảnh lên */}
        <div className="absolute bottom-[15%] left-0 right-0 z-20 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none"
          >
            {/* Nút chính: Xem gia phả */}
            <button
              onClick={handleGuestLogin}
              className="inline-flex items-center justify-center gap-2
                         w-full sm:w-auto
                         px-5 py-2.5 sm:px-8 sm:py-3.5
                         text-sm sm:text-base font-bold
                         text-white bg-[#800000] hover:bg-[#600000]
                         rounded-xl shadow-xl transition-all duration-200
                         active:scale-95"
            >
              <Users className="size-4 sm:size-5 flex-shrink-0" />
              <span>Xem gia phả</span>
            </button>

            {/* Nút phụ: Đăng nhập quản trị */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2
                         w-full sm:w-auto
                         px-5 py-2.5 sm:px-7 sm:py-3.5
                         text-sm sm:text-base font-semibold
                         text-stone-700 bg-white/80 hover:bg-white
                         backdrop-blur-sm border border-stone-300
                         rounded-xl shadow-lg transition-all duration-200
                         active:scale-95"
            >
              Đăng nhập quản trị
              <ArrowRight className="size-4 flex-shrink-0" />
            </Link>
          </motion.div>
        </div>

      </div>
      {/* KHÔNG có div padding thừa bên dưới */}
    </div>
  );
}
