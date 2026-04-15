"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LandingOverlay() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // 👉 Reset khi quay về trang chủ
    if (pathname === "/") {
      localStorage.removeItem("seenLanding");
    }

    const seen = localStorage.getItem("seenLanding");

    if (!seen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    }

    setReady(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [pathname]);

  const closeOverlay = () => {
    localStorage.setItem("seenLanding", "true");
    setShow(false);
    document.body.style.overflow = "auto";
  };

  const handleGuestLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_GUEST_EMAIL!,
      password: process.env.NEXT_PUBLIC_GUEST_PASS!,
    });

    if (error) {
      alert("Không đăng nhập được");
      return;
    }

    if (data?.user) {
      closeOverlay();
      router.push("/public");
    }
  };

  if (!ready || !show) return null;

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] bg-[#f5efe6]">

      {/* ẢNH CHUẨN - KHÔNG PHÓNG */}
      <img
        src="/bg-gia-pha.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
      />

      {/* NÚT */}
      <div className="absolute bottom-[16%] left-0 right-0 z-20 flex justify-center gap-4 px-6">

        <button
          onClick={handleGuestLogin}
          className="flex-1 max-w-[140px] h-10 flex items-center justify-center gap-1.5
                     text-[11px] font-bold text-white
                     bg-[#6B0F1A] hover:bg-[#550C15]
                     rounded-lg shadow-lg shadow-black/40
                     transition-all duration-200 active:scale-95"
        >
          <Users className="size-3.5" />
          Xem gia phả
        </button>

        <Link
          href="/login"
          onClick={closeOverlay}
          className="flex-1 max-w-[140px] h-10 flex items-center justify-center gap-1.5
                     text-[11px] font-semibold
                     text-stone-800 bg-white/80 hover:bg-white/90
                     rounded-lg shadow-md
                     transition-all duration-200 active:scale-95"
        >
          Đăng nhập
          <ArrowRight className="size-3" />
        </Link>

      </div>
    </div>
  );
}
