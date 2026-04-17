"use client";

import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import FamilyTree from "@/components/FamilyTree";
import TreeToolbar from "@/components/TreeToolbar";
import HeaderMenu from "@/components/HeaderMenu";
import PrintA0View from "@/components/PrintA0View";

interface DashboardViewsProps {
  // Props cũ cho FamilyTree
  persons: any[];
  personsMap: Map<string, any>;
  relationships: any[];
  roots: any[];
  branches: any[];
  canEdit?: boolean;
  // Props mới cho Admin và In ấn
  isAdmin: boolean;
  userEmail?: string;
}

export default function DashboardViews(props: DashboardViewsProps) {
  const [view, setView] = useState("tree");
  const [printConfig, setPrintConfig] = useState<any>(null);

  const { persons, isAdmin, userEmail } = props;

  return (
    <div className="min-h-screen w-full relative bg-stone-50">
      {/* HEADER CỐ ĐỊNH: Chứa Toolbar cũ và Menu mới */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b z-[100] flex items-center justify-between px-4 print:hidden">
        <div className="flex items-center gap-4">
          <TreeToolbar /> {/* Nơi các Portal từ FamilyTree bắn vào */}
        </div>

        <HeaderMenu 
          isAdmin={isAdmin} 
          userEmail={userEmail} 
          setView={setView} 
          setPrintConfig={setPrintConfig} 
        />
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="pt-16 w-full h-[calc(100vh-64px)]">
        {view === "print_a0" && printConfig ? (
          <div className="fixed inset-0 z-[200] bg-stone-100 overflow-auto flex justify-center py-10 print:p-0 print:bg-white">
            <div className="fixed top-6 left-6 z-[210] flex gap-2 print:hidden">
              <button 
                onClick={() => setView("tree")} 
                className="bg-stone-900 text-white px-5 py-2 rounded-full shadow-xl flex items-center gap-2 hover:bg-black transition-all"
              >
                <X size={18} /> Thoát chế độ in
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-amber-600 text-white px-5 py-2 rounded-full shadow-xl flex items-center gap-2 hover:bg-amber-700 transition-all"
              >
                <Printer size={18} /> Bắt đầu in
              </button>
            </div>
            <PrintA0View persons={persons} config={printConfig} />
          </div>
        ) : (
          <FamilyTree 
            personsMap={props.personsMap}
            relationships={props.relationships}
            roots={props.roots}
            branches={props.branches}
            canEdit={props.canEdit}
          />
        )}
      </main>

      {/* CSS phục vụ riêng cho việc in khổ lớn */}
      <style jsx global>{`
        @media print {
          .print\:hidden { display: none !important; }
          header { display: none !important; }
          body { overflow: visible !important; background: white !important; }
          @page { size: A0 landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
}
