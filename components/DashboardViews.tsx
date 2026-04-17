"use client";

import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import PrintA0View from "./PrintA0View";
import HeaderMenu from "./HeaderMenu";
import TreeView from "./TreeView"; // Đây là code cũ của bạn

// Định nghĩa Interface bao gồm cả các props cũ và các props mới
interface DashboardViewsProps {
  // Props cũ từ page.tsx của bạn
  persons: any[];
  relationships: any[];
  branches: any[];
  canEdit: boolean;
  
  // Props mới cho tính năng in A0
  isAdmin: boolean;
  userEmail?: string;
}

export default function DashboardViews({ 
  persons, 
  relationships, 
  branches, 
  canEdit, 
  isAdmin, 
  userEmail 
}: DashboardViewsProps) {
  
  // 1. Giữ trạng thái view mặc định là "tree" (code cũ)
  const [view, setView] = useState("tree");
  const [printConfig, setPrintConfig] = useState<any>(null);

  // 2. Hàm render linh hoạt
  const renderContent = () => {
    // Nếu người dùng chọn view in A0 và đã có cấu hình
    if (view === "print_a0" && printConfig) {
      return (
        <div className="fixed inset-0 z-[100] bg-stone-100 overflow-auto flex justify-center py-10 print:p-0 print:bg-white">
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex gap-4 print:hidden">
            <button 
              onClick={() => setView("tree")} 
              className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-stone-800 transition-all"
            >
              <X className="size-4" /> Thoát chế độ in
            </button>
            <button 
              onClick={() => window.print()} 
              className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-amber-700 transition-all"
            >
              <Printer className="size-4" /> In A0 (PDF)
            </button>
          </div>
          {/* Component in mới */}
          <PrintA0View persons={persons} config={printConfig} />
        </div>
      );
    }

    // MẶC ĐỊNH: Trả về TreeView cũ của bạn với đầy đủ các props cũ
    return (
      <TreeView 
        persons={persons} 
        relationships={relationships} 
        branches={branches} 
        canEdit={canEdit} 
      />
    );
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Menu điều khiển nằm ở Header, ẩn đi khi in */}
      <div className="fixed top-4 right-4 z-[150] print:hidden">
        <HeaderMenu 
          isAdmin={isAdmin} 
          userEmail={userEmail} 
          setView={setView} 
          setPrintConfig={setPrintConfig} 
        />
      </div>

      {/* Hiển thị nội dung (TreeView cũ hoặc PrintA0View mới) */}
      <main className="w-full">
        {renderContent()}
      </main>

      {/* Cấu hình CSS cho bản in A0 */}
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; background: white !important; }
          @page { size: A0 landscape; margin: 0; }
          .print\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
