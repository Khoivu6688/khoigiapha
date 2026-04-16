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
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-sm w-full">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* 1. BANNER: Sửa lỗi hở và chiếm chỗ */}
        <Link href="/dashboard" className="block w-full bg-stone-50">
          <img
            src="/assets/images/banerds.jpg"
            alt="BANNER"
            // Trên mobile chỉ để h-12 hoặc h-14 để tiết kiệm không gian đứng
            className="w-full h-12 sm:h-24 md:h-32 object-contain block mx-auto"
          />
        </Link>

        {/* 2. THANH CÔNG CỤ: Fix lỗi "bóp view" và nhảy chữ G */}
        <div className="flex items-center justify-between px-3 py-1.5 min-h-[50px] gap-2">
          
          {/* Cụm Children (Tìm kiếm/Breadcrumb): 
              Ép nó co lại nếu quá dài để không đẩy chữ G ra ngoài màn hình 
          */}
          <div className="flex-1 min-w-0 flex items-center overflow-hidden">
            <div className="w-full truncate"> 
              {children}
            </div>
          </div>

          {/* Cụm HeaderMenu (Chữ G): 
              Dùng flex-shrink-0 để đảm bảo nó LUÔN đứng yên một chỗ, không bao giờ bị nhảy dòng
          */}
          <div className="flex-shrink-0 flex items-center justify-end">
            <HeaderMenu isAdmin={isAdmin} userEmail={userEmail} />
          </div>

        </div>
      </div>
    </header>
  );
}
