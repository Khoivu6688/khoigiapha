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
        
        {/* CONTAINER 3 PHẦN: Align Center giúp mọi thứ thẳng hàng ngang */}
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          
          {/* PHẦN 1 (TRÁI): Chứa children (Breadcrumbs, Search hoặc nút quay lại) */}
          <div className="flex-1 flex items-center min-w-0">
            <div className="truncate">
              {children}
            </div>
          </div>

          {/* PHẦN 2 (GIỮA): Ảnh Banner thu nhỏ - Đặt làm trọng tâm */}
          <div className="flex-none flex justify-center items-center h-full">
            <Link href="/dashboard" className="block h-full py-1">
              <img
                src="/assets/images/banerds.jpg"
                alt="LOGO"
                // h-12 trên mobile giúp Header cực kỳ gọn
                className="h-10 sm:h-16 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          {/* PHẦN 3 (PHẢI): Chữ G (Menu dọc) */}
          <div className="flex-1 flex justify-end items-center">
            <div className="flex-shrink-0">
              <HeaderMenu isAdmin={isAdmin} userEmail={userEmail} />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
