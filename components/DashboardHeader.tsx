"use client";

import config from "@/app/config";
import HeaderMenu from "@/components/HeaderMenu";
import Link from "next/link";
import React from "react";

interface DashboardHeaderProps {
  isAdmin: boolean;
  userEmail?: string;
  children?: React.ReactNode;
}

export default function DashboardHeader({
  isAdmin,
  userEmail,
  children,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* 1. SỬA BANNER: Giảm chiều cao trên mobile cực độ */}
        <Link href="/dashboard" className="group block overflow-hidden">
          <img
            src="/assets/images/banerds.jpg"
            alt="GIA PHẢ HỌ VŨ BÁ TỘC THÁI BÌNH"
            // h-16 cho mobile (giảm một nửa), h-32 cho desktop
            className="w-full h-16 md:h-32 object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* 2. SỬA THANH ĐIỀU HƯỚNG: Giữ chặt HeaderMenu không cho nhảy dòng */}
        <div className="flex items-center justify-between py-1 sm:py-2 border-t border-stone-50">
          
          {/* Cụm con (Search/Breadcrumbs) - Ép không cho tràn */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {children}
          </div>

          {/* Cụm Menu (Chữ G) - Ép giữ nguyên vị trí */}
          <div className="flex-shrink-0 ml-2">
            <HeaderMenu isAdmin={isAdmin} userEmail={userEmail} />
          </div>

        </div>
      </div>
    </header>
  );
}
