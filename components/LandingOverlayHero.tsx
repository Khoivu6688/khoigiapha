"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LandingOverlayHero() {
  const router = useRouter();
  const supabase = createClient();

  const handleGuestLogin = async () => {
    const guestEmail = process.env.NEXT_PUBLIC_GUEST_EMAIL;
    const guestPass = process.env.NEXT_PUBLIC_GUEST_PASS;

    if (!guestEmail || !guestPass) return;

    const { data } = await supabase.auth.signInWithPassword({
      email: guestEmail,
      password: guestPass,
    });

    if (data?.user) {
      localStorage.setItem("seenLanding", "true"); // 👈 QUAN TRỌNG
      router.push("/public");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">

      {/* ẢNH FULL MÀN */}
      <img
        src="/assets/images/Nen.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
      />

      {/* NÚT */}
      <div className="absolute bottom-[16%] left-0 right-0 flex justify-center gap-2 px-6">

        <button
          onClick={handleGuestLogin}
          className="flex-1 max-w-[140px] h-9 flex items-center justify-center gap-1.5
                     text-[11px] font-bold text-white
                     bg-[#6B0F1A] rounded-lg shadow-lg
                     active:scale-95"
        >
          <Users className="size-3.5" />
          Xem gia phả
        </button>

        <Link
          href="/login"
          onClick={() => localStorage.setItem("seenLanding", "true")} // 👈 QUAN TRỌNG
          className="flex-1 max-w-[140px] h-9 flex items-center justify-center gap-1
                     text-[11px] font-semibold
                     text-stone-800 bg-white/80
                     rounded-lg shadow-md
                     active:scale-95"
        >
          Đăng nhập
          <ArrowRight className="size-3" />
        </Link>

      </div>
    </div>
  );
}
