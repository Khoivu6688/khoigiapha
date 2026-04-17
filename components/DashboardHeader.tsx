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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        
        {/* CONTAINER 3 PHẦN: Dùng items-center để căn giữa theo trục dọc */}
        <div className="flex items-center justify-between h-14 sm:h-20 gap-1 sm:gap-4">
          
          {/* PHẦN 1 (TRÁI): Chiếm 30% độ rộng - Chứa thanh tìm kiếm/Breadcrumb */}
          <div className="flex-1 basis-1/3 flex items-center min-w-0">
            <div className="w-full truncate overflow-hidden">
              {children}
            </div>
          </div>

          {/* PHẦN 2 (GIỮA): Chiếm 40% độ rộng - Ảnh Banner */}
          <div className="flex-none basis-1/3 flex justify-center items-center">
            <Link href="/dashboard" className="block shrink-0">
              <img
                src="/assets/images/banerds.jpg"
                alt="LOGO"
                // object-contain rất quan trọng để ảnh không bị méo khi co giãn
                className="h-10 sm:h-16 w-auto max-w-full object-contain"
              />
            </Link>
          </div>

          {/* PHẦN 3 (PHẢI): Chiếm 30% độ rộng - Chữ G và Menu */}
          <div className="flex-1 basis-1/3 flex justify-end items-center">
            <div className="shrink-0 flex items-center">
              <HeaderMenu isAdmin={isAdmin} userEmail={userEmail} />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
