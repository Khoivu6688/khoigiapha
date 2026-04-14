"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LandingOverlay() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false); // 👈 tránh flicker
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const seen = localStorage.getItem("seenLanding");

    if (!seen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    }

    setReady(true);

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleGuestLogin = async () => {
    const { data } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_GUEST_EMAIL!,
      password: process.env.NEXT_PUBLIC_GUEST_PASS!,
    });

    if (data?.user) {
      localStorage.setItem("seenLanding", "true");
      setShow(false);
      router.push("/public");
    }
  };

  if (!ready || !show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] w-screen h-[100dvh]"
      style={{
        backgroundImage: "url('/bg-gia-pha.jpg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundColor: "#f5efe6",
      }}
    >
      {/* NÚT */}
      <div className="absolute bottom-[16%] left-0 right-0 flex justify-center gap-2 px-6">

        <button
          onClick={handleGuestLogin}
          className="flex-1 max-w-[140px] h-9 flex items-center justify-center gap-1.5
                     text-[11px] font-bold text-white
                     bg-[#6B0F1A] rounded-lg shadow-lg
                     transition active:scale-95"
        >
          <Users className="size-3.5" />
          Xem gia phả
        </button>

        <Link
          href="/login"
          onClick={() => localStorage.setItem("seenLanding", "true")}
          className="flex-1 max-w-[140px] h-9 flex items-center justify-center gap-1
                     text-[11px] font-semibold
                     text-stone-800 bg-white/80
                     rounded-lg shadow-md
                     transition active:scale-95"
        >
          Đăng nhập
          <ArrowRight className="size-3" />
        </Link>

      </div>
    </div>
  );
}
