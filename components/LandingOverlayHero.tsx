"use client";

import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LandingOverlayHero() {
  const router = useRouter();
  const supabase = createClient();

  const handleGuestLogin = async () => {
    try {
      const guestEmail = process.env.NEXT_PUBLIC_GUEST_EMAIL;
      const guestPass = process.env.NEXT_PUBLIC_GUEST_PASS;

      if (!guestEmail || !guestPass) {
        alert("Thiếu cấu hình tài khoản khách");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPass,
      });

      if (error) {
        alert("Không đăng nhập được");
        return;
      }

      if (data?.user) {
        localStorage.setItem("seenLanding", "true"); // 👈 QUAN TRỌNG
        router.push("/public");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute bottom-[16%] left-0 right-0 z-20 flex justify-center gap-2 px-6">

      {/* Nút Xem gia phả */}
      <button
        onClick={handleGuestLogin}
        className="flex-1 max-w-[140px] h-9 flex items-center justify-center gap-1.5
                   text-[11px] font-bold text-white
                   bg-[#6B0F1A] hover:bg-[#550C15]
                   rounded-lg shadow-lg shadow-black/40
                   transition-all duration-200 active:scale-95 whitespace-nowrap"
      >
        <Users className="size-3.5 flex-shrink-0" />
        <span>Xem gia phả</span>
      </button>

      {/* Nút Đăng nhập */}
      <Link
        href="/login"
        onClick={() => localStorage.setItem("seenLanding", "true")} // 👈 QUAN TRỌNG
        className="flex-1 max-w-[140px] h-9 flex items-center justify-center gap-1
                   text-[11px] font-semibold
                   text-stone-800 bg-white/80 hover:bg-white/90
                   rounded-lg shadow-md
                   transition-all duration-200 active:scale-95 whitespace-nowrap"
      >
        <span>Đăng nhập</span>
        <ArrowRight className="size-3 flex-shrink-0" />
      </Link>

    </div>
  );
}
