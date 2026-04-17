"use client";

import React, { useState, useEffect } from "react";
import { Printer, X } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import FamilyTree from "./FamilyTree";   
import PrintA0View from "./PrintA0View"; 
import AdminPrintConfig from "./AdminPrintConfig";

interface DashboardViewsProps {
  persons: any[];
  personsMap: Map<string, any>;
  relationships: any[];
  roots: any[];
  branches: any[];
  canEdit: boolean;
  isAdmin: boolean;
}

export default function DashboardViews(props: DashboardViewsProps) {
  const { view, setView } = useDashboard();
  const [printConfig, setPrintConfig] = useState<any>(null);

  // Chế độ xem trước bản in (Sau khi đã chọn thông số)
  if (view === ("print_a0" as any) && printConfig) {
    return (
      <div className="fixed inset-0 z-[200] bg-stone-100 overflow-auto flex justify-center py-10 print:p-0">
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] flex gap-4 print:hidden">
          <button onClick={() => setView("tree" as any)} className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
            <X size={16} /> Thoát chế độ in
          </button>
          <button onClick={() => window.print()} className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
            <Printer size={16} /> Xác nhận in
          </button>
        </div>
        <PrintA0View persons={props.persons} config={printConfig} />
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-[70vh]">
      {/* Mặc định hiển thị sơ đồ cây */}
      <FamilyTree 
        personsMap={props.personsMap}
        relationships={props.relationships}
        roots={props.roots}
        branches={props.branches}
        canEdit={props.canEdit}
      />

      {/* Hiển thị Popup cấu hình khi Admin bấm tab "In gia phả A0" */}
      {view === ("print_config" as any) && (
        <AdminPrintConfig 
          onClose={() => setView("tree" as any)}
          onConfirm={(config) => {
            setPrintConfig(config);
            setView("print_a0" as any);
          }}
        />
      )}

      <style jsx global>{`
        @media print {
          .print\:hidden { display: none !important; }
          body { background: white !important; }
          @page { size: A0 landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
}
