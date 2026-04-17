"use client";

import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import FamilyTree from "./FamilyTree";   // File bạn đã gửi
import TreeToolbar from "./TreeToolbar"; // File toolbar cũ
import HeaderMenu from "./HeaderMenu";   // Menu mới chứa nút in
import PrintA0View from "./PrintA0View"; // View in mới

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
  persons, personsMap, relationships, roots, branches, canEdit, isAdmin, userEmail 
}: DashboardViewsProps) {
  
  const [view, setView] = useState("tree");
  const [printConfig, setPrintConfig] = useState<any>(null);

  // Render logic
  const renderContent = () => {
    // Nếu chọn view in A0
    if (view === "print_a0" && printConfig) {
      return (
        <div className="fixed inset-0 z-[200] bg-stone-100 overflow-auto flex justify-center py-10 print:p-0 print:bg-white">
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] flex gap-4 print:hidden">
            <button onClick={() => setView("tree")} className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
              <X size={16} /> Thoát chế độ in
            </button>
            <button onClick={() => window.print()} className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
              <Printer size={16} /> In PDF (Khổ A0)
            </button>
          </div>
          <PrintA0View persons={persons} config={printConfig} />
        </div>
      );
    }

    // MẶC ĐỊNH: Trả về TreeView cũ của bạn
    return (
      <FamilyTree 
        personsMap={personsMap}
        relationships={relationships}
        roots={roots}
        branches={branches}
        canEdit={canEdit}
      />
    );
  };

  return (
    <div className="w-full relative">
      {/* 1. Header ẩn khi in - Chứa Toolbar cũ và Menu chọn In */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-2">
          {/* File TreeToolbar.tsx cũ của bạn sẽ tìm ID portal ở đây */}
          <TreeToolbar /> 
        </div>

        <HeaderMenu 
          isAdmin={isAdmin} 
          userEmail={userEmail} 
          setView={setView} 
          setPrintConfig={setPrintConfig} 
        />
      </div>

      {/* 2. Nội dung hiển thị */}
      <div className="w-full">
        {renderContent()}
      </div>

      <style jsx global>{`
        @media print {
          .print\:hidden { display: none !important; }
          body { background: white !important; margin: 0; }
          @page { size: A0 landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
}
