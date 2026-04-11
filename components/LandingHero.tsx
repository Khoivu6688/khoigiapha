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
