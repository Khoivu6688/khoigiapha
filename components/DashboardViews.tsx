"use client";
import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import PrintA0View from "./PrintA0View";
import HeaderMenu from "./HeaderMenu";

export default function DashboardViews({ persons, isAdmin, userEmail }: { persons: any[], isAdmin: boolean, userEmail?: string }) {
  const [view, setView] = useState("tree");
  const [printConfig, setPrintConfig] = useState<any>(null);

  const renderView = () => {
    if (view === "print_a0" && printConfig) {
      return (
        <div className="fixed inset-0 z-[100] bg-stone-100 overflow-auto flex justify-center py-10 print:p-0 print:bg-white">
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex gap-4 print:hidden">
            <button onClick={() => setView("tree")} className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2"><X className="size-4" /> Đóng</button>
            <button onClick={() => window.print()} className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2"><Printer className="size-4" /> In A0</button>
          </div>
          <PrintA0View persons={persons} config={printConfig} />
        </div>
      );
    }
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold">Giao diện Sơ đồ cây (TreeView)</h1>
        <p className="text-stone-500">Bấm vào Menu góc phải để thiết lập In A0</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full relative">
      <div className="fixed top-4 right-4 z-[150] print:hidden">
        <HeaderMenu isAdmin={isAdmin} userEmail={userEmail} setView={setView} setPrintConfig={setPrintConfig} />
      </div>
      {renderView()}
      
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          @page { size: A0 landscape; margin: 0; }
          #print-area { transform: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
