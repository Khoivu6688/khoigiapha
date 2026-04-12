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
    <div className="w-full min-h-screen bg-[#F5F2ED] flex flex-col p-0 m-0 overflow-x-hidden">
      {/* CONTAINER CHÍNH: 
         Dùng relative để làm mốc cho cụm nút absolute 
      */}
      <div className="relative w-full flex flex-col items-center">
        
        {/* 1. ẢNH NỀN: Sát mép trên, không hở lề */}
        <div className="w-full leading-none">
          <img
            src="/assets/images/Nen.jpg"
            alt="Gia Phả"
            // max-h-[85vh] để ảnh không bị phóng quá to trên màn hình máy tính
            className="w-full h-auto max-h-[85vh] object-contain block mx-auto"
          />
        </div>

        {/* 2. CỤM NÚT BẤM: Đã tối ưu cho Mobile */}
        <div className="absolute bottom-[12%] sm:bottom-[15%] left-0 right-0 flex justify-center px-6 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-[320px] sm:max-w-none justify-center"
          >
            {/* Nút Xem gia phả: Chữ nhỏ hơn trên mobile, to hơn trên PC */}
            <button
              onClick={handleGuestLogin}
              className="group inline-flex items-center justify-center gap-2 
                         px-6 py-3 sm:px-10 sm:py-4 
                         text-sm sm:text-lg font-bold 
                         text-white bg-[#800000] hover:bg-[#600000] 
                         rounded-xl shadow-2xl transition-all order-1"
            >
              <Users className="size-5 sm:size-6" />
              <span>Xem gia phả</span>
            </button>

            {/* Nút Quản trị: Thiết kế thanh thoát hơn */}
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 
                         px-5 py-2.5 sm:px-8 sm:py-4 
                         text-xs sm:text-base font-semibold 
                         text-stone-600 bg-white/90 backdrop-blur-md 
                         border border-stone-200 rounded-xl shadow-lg order-2"
            >
              Đăng nhập quản trị
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

      </div>

      {/* 3. PHẦN ĐỆM DƯỚI: Chặn tuyệt đối việc Footer đè lên ảnh */}
      <div className="w-full h-24 sm:h-32 bg-[#F5F2ED]" />
    </div>
  );
}
