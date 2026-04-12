"use client";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

export default function LandingHero() {
  return (
    <div className="relative w-full min-h-screen bg-[#F5F2ED] overflow-hidden flex flex-col">
      
      {/* KHỐI CHỨA ẢNH NỀN */}
      <div 
        className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] bg-no-repeat bg-top sm:bg-center bg-contain"
        style={{ backgroundImage: "url('/assets/images/Nen.jpg')" }}
      >
        {/* Lớp phủ Gradient giúp ảnh tan vào nền phía trên và dưới (Xử lý lỗi hở mép) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F2ED] via-transparent to-[#F5F2ED] opacity-40" />

        {/* CỤM NÚT BẤM: Căn chỉnh cực kỳ linh hoạt */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center translate-y-1/2 px-4 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-[90%] sm:max-w-max"
          >
            {/* Nút Xem gia phả: Co giãn theo màn hình */}
            <button
              className="group flex items-center justify-center gap-2 
                         px-6 py-3 sm:px-10 sm:py-4 
                         text-[15px] sm:text-lg font-bold 
                         text-white bg-[#800000] active:scale-95
                         rounded-xl shadow-2xl transition-all order-1"
            >
              <Users className="size-5 sm:size-6" />
              <span>Xem gia phả</span>
            </button>

            {/* Nút Quản trị: Nhỏ gọn hơn trên Mobile */}
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 
                         px-6 py-3 sm:px-8 sm:py-4 
                         text-[13px] sm:text-base font-semibold 
                         text-stone-600 bg-white/90 backdrop-blur-sm
                         border border-stone-200 rounded-xl shadow-lg order-2"
            >
              Đăng nhập quản trị
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Khoảng trống bên dưới để giao diện thở, không bị Footer đè */}
      <div className="flex-grow min-h-[150px]" />
    </div>
  );
}
