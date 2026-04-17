"use client";
import React, { useState } from "react";
import { Printer, X } from "lucide-react";
import FamilyTree from "./FamilyTree";   
import TreeToolbar from "./TreeToolbar"; 
import HeaderMenu from "./HeaderMenu";   
import PrintA0View from "./PrintA0View"; 

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

export default function DashboardViews(props: DashboardViewsProps) {
  const [view, setView] = useState("tree");
  const [printConfig, setPrintConfig] = useState<any>(null);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* THANH ĐIỀU KHIỂN TRÊN CÙNG */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-stone-200 print:hidden">
        <div className="flex items-center gap-2">
          <TreeToolbar /> 
        </div>

        {/* TRUYỀN ĐỦ SETVIEW VÀ SETPRINTCONFIG VÀO ĐÂY */}
        <HeaderMenu 
          isAdmin={props.isAdmin} 
          userEmail={props.userEmail} 
          setView={setView} 
          setPrintConfig={setPrintConfig} 
        />
      </div>

      <div className="w-full relative min-h-[70vh]">
        {view === "print_a0" && printConfig ? (
          <div className="fixed inset-0 z-[200] bg-stone-100 overflow-auto flex justify-center py-10 print:p-0">
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] flex gap-4 print:hidden">
              <button onClick={() => setView("tree")} className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
                <X size={16} /> Thoát
              </button>
              <button onClick={() => window.print()} className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
                <Printer size={16} /> Bắt đầu in A0
              </button>
            </div>
            <PrintA0View persons={props.persons} config={printConfig} />
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
      </div>

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
