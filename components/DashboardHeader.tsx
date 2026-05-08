"use client";

import config from "@/app/config";
import HeaderMenu from "@/components/HeaderMenu";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Solar } from "lunar-javascript";

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
  const [dateDisplay, setDateDisplay] = useState("");

  useEffect(() => {
    try {
      const now = new Date();
      
      // 1. Dương lịch
      const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayName = days[now.getDay()];
      const d = now.getDate();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      
      // Định dạng Dương lịch: Thứ..., d-m-y
      const solarPart = `${dayName}, ${d}-${m}-${y}`;
      
      // 2. Âm lịch
      const solar = Solar.fromYmd(y, m, d);
      const lunar = solar.getLunar();
      const l = lunar as any;

      // Mảng tiếng Việt để ép định dạng Can Chi (100% Việt hóa)
      const CAN = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
      const CHI = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];

      const yearValue = l.getYear(); 
      const canViet = CAN[yearValue % 10];
      const chiViet = CHI[yearValue % 12];

      const lunarDay = l.getDay(); 
      const lunarMonth = l.getMonth();
      
      let monthStr = `tháng ${lunarMonth}`;
      if (lunarMonth === 1) monthStr = "tháng Giêng";
      if (lunarMonth === 12) monthStr = "tháng Chạp";

      // Chuỗi rút gọn theo yêu cầu: Thứ..., d-m-y (lunarDay monthStr năm can chi)
      const str = `${solarPart} (${lunarDay} ${monthStr} năm ${canViet} ${chiViet})`;
      setDateDisplay(str);
    } catch (error) {
      const now = new Date();
      setDateDisplay(`${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`);
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm w-full font-sans">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        
        {/* Thay h- cứng bằng py để header tự co giãn theo nội dung, không bị thừa khoảng trống */}
        <div className="flex items-center justify-between py-2 sm:py-4 gap-1 sm:gap-4">
          
          {/* PHẦN 1 (TRÁI): Breadcrumb */}
          <div className="flex-1 basis-1/3 flex items-center min-w-0">
            <div className="truncate overflow-hidden text-stone-600">
              {children}
            </div>
          </div>

          {/* PHẦN 2 (GIỮA): Logo & Ngày tháng */}
          <div className="flex-none basis-1/3 flex flex-col justify-center items-center">
            <Link href="/dashboard" className="block shrink-0 mb-0">
              <img
                src="/assets/images/banerds.jpg"
                alt="LOGO"
                /* h-12 trên mobile (~48px) và h-20 trên PC (~80px) */
                className="h-12 sm:h-20 w-auto max-w-full object-contain transition-all"
              />
            </Link>
            
            {/* mt-1 đẩy chữ xuống khỏi ảnh, pb-1 tạo khoảng hở với viền dưới trên PC */}
            <p className="text-[7px] sm:text-[10px] text-sky-700 font-medium italic leading-none select-none text-center whitespace-nowrap mt-1 sm:mt-2 pb-1 tracking-tight">
              {dateDisplay}
            </p>
          </div>

          {/* PHẦN 3 (PHẢI): Menu */}
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
