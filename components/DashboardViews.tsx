"use client";

import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import FamilyTree from "./FamilyTree";
import PrintA0View from "./PrintA0View";
import AdminPrintConfig from "./AdminPrintConfig";

// ĐỊNH NGHĨA INTERFACE ĐẦY ĐỦ - SỬA LỖI MISSING PROPERTIES
interface DashboardViewsProps {
  persons: any[];
  personsMap: Map<string, any>;
  relationships: any[];
  roots: any[];
  branches: any[];
  canEdit: boolean;
  isAdmin: boolean;
  userEmail?: string;
}

export default function DashboardViews({
  persons,
  personsMap,
  relationships,
  roots,
  branches,
  canEdit,
  isAdmin,
  userEmail,
}: DashboardViewsProps) {
  // Lấy trạng thái view hiện tại từ Context (ViewToggle điều khiển cái này)
  const { view, setView } = useDashboard();
  
  // State lưu trữ cấu hình in khi Admin thiết lập xong
  const [printConfig, setPrintConfig] = useState<any>(null);

  /**
   * TRƯỜNG HỢP 1: CHẾ ĐỘ XEM TRƯỚC BẢN IN A0 (FULL MÀN HÌNH)
   * Hiển thị khi view là "print_a0" và đã có cấu hình
   */
  if (view === ("print_a0" as any) && printConfig) {
    return (
      <div className="fixed inset-0 z-[200] bg-stone-100 overflow-auto flex justify-center py-10 print:p-0 print:bg-white">
        {/* Thanh công cụ khi xem bản in - Ẩn khi lệnh in thực tế được gọi */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] flex gap-4 print:hidden">
          <button 
            onClick={() => setView("tree" as any)} 
            className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-stone-800 transition-all"
          >
            <X size={16} /> Thoát
          </button>
          <button 
            onClick={() => window.print()} 
            className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-amber-700 transition-all"
          >
            <Printer size={16} /> Bắt đầu in A0
          </button>
        </div>

        {/* Component render nội dung cây theo khổ A0 */}
        <PrintA0View persons={persons} config={printConfig} />
      </div>
    );
  }

  /**
   * TRƯỜNG HỢP 2: GIAO DIỆN DASHBOARD MẶC ĐỊNH
   */
  return (
    <div className="w-full relative min-h-[70vh]">
      {/* Dựa trên view để hiển thị các component khác nhau.
          Ở đây chúng ta ưu tiên Sơ đồ cây (FamilyTree).
      */}
      <FamilyTree 
        personsMap={personsMap}
        relationships={relationships}
        roots={roots}
        branches={branches}
        canEdit={canEdit}
      />

      {/* POPUP CẤU HÌNH IN (MODAL): 
          Hiển thị đè lên Dashboard khi Admin nhấn nút "In gia phả A0"
      */}
      {view === ("print_config" as any) && (
        <AdminPrintConfig 
          onClose={() => setView("tree" as any)}
          onConfirm={(config) => {
            setPrintConfig(config);
            setView("print_a0" as any);
          }}
        />
      )}

      {/* CSS ĐẶC BIỆT CHO LỆNH IN CỦA TRÌNH DUYỆT */}
      <style jsx global>{`
        @media print {
          /* Ẩn tất cả các thành phần không cần thiết khi in */
          .print\:hidden, 
          nav, 
          header, 
          footer,
          button { 
            display: none !important; 
          }
          
          body { 
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Thiết lập khổ giấy in A0 ngang */
          @page { 
            size: A0 landscape; 
            margin: 0; 
          }
        }
      `}</style>
    </div>
  );
}
