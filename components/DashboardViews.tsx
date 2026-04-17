"use client";

import React, { useState } from "react";
import { Printer } from "lucide-react"; // Đảm bảo import icon này
import PrintA0View from "./PrintA0View";
import TreeView from "./TreeView"; 
import ListView from "./ListView"; 
import HeaderMenu from "./HeaderMenu"; // Import HeaderMenu để kết nối

interface DashboardViewsProps {
  persons: any[];
  isAdmin: boolean;
  userEmail?: string; // Thêm để truyền vào HeaderMenu
}

export default function DashboardViews({ persons, isAdmin, userEmail }: DashboardViewsProps) {
  // Quản lý trạng thái view hiển thị
  const [view, setView] = useState("tree");
  // Lưu trữ cấu hình mm từ AdminPrintConfig truyền qua HeaderMenu
  const [printConfig, setPrintConfig] = useState<any>(null);

  // Hàm render view tương ứng dựa trên trạng thái 'view'
  const renderCurrentView = () => {
    switch (view) {
      case "print_a0":
        return (
          <div className="relative w-full h-screen bg-stone-200 overflow-auto">
            {/* Thanh điều khiển nổi dành cho chế độ xem trước bản in */}
            <div className="fixed top-6 left-6 z-[100] flex gap-3 print:hidden animate-in fade-in slide-in-from-left-4 duration-300">
              <button 
                onClick={() => setView("tree")}
                className="bg-black text-white px-6 py-2.5 rounded-full font-bold shadow-2xl hover:bg-stone-800 transition-all flex items-center gap-2"
              >
                <span>←</span> Thoát chế độ in
              </button>
              
              <button 
                onClick={() => window.print()}
                className="bg-amber-600 text-white px-6 py-2.5 rounded-full font-bold shadow-2xl hover:bg-amber-700 transition-all flex items-center gap-2"
              >
                <Printer className="size-4" /> 
                In ra File PDF (A0)
              </button>
            </div>
            
            {/* Component hiển thị tờ giấy A0 vật lý */}
            <div className="flex justify-center py-12 print:p-0">
               <PrintA0View persons={persons} config={printConfig} />
            </div>
          </div>
        );

      case "list":
        return <ListView persons={persons} />;
      
      case "tree":
      default:
        // Cần đảm bảo component TreeView của bạn có thể nhận props persons
        return <TreeView persons={persons} />;
    }
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* HeaderMenu được đặt cố định ở góc phải.
         Dùng z-50 để luôn nổi trên các View thông thường, 
         nhưng ẩn đi bằng 'print:hidden' khi thực hiện lệnh in.
      */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <HeaderMenu 
          isAdmin={isAdmin} 
          userEmail={userEmail}
          setView={setView} 
          setPrintConfig={setPrintConfig} 
        />
      </div>

      {/* Vùng chứa nội dung chính */}
      <main className="w-full">
        {renderCurrentView()}
      </main>

      {/* Style bổ sung để ép khổ in (Print CSS) */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          @page {
            size: A0 landscape;
            margin: 0;
          }
          /* Ẩn tất cả các thành phần không cần thiết khác khi in */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
