"use client";
import { motion } from "framer-motion";
import { List, ListTree, Network, BookOpen, Filter, Printer } from "lucide-react";
import { useDashboard } from "./DashboardContext";

const ROOT_ID = process.env.NEXT_PUBLIC_ROOT_ID || "a4167ee0-df91-4a9c-a7d1-ab4e88ffa4d0";

export default function ViewToggle({ isAdmin }: { isAdmin?: boolean }) {
  const { view: currentView, setView, setRootId } = useDashboard();

  const tabs = [
    { id: "introduction", label: "Giới thiệu", icon: <BookOpen className="size-4" /> },
    { id: "list", label: "Danh sách", icon: <List className="size-4" /> },
    { id: "members_filter", label: "Lọc chi/đời", icon: <Filter className="size-4" /> },
    { id: "tree", label: "Sơ đồ cây", icon: <Network className="size-4" /> },
    { id: "mindmap", label: "Mindmap", icon: <ListTree className="size-4" /> },
  ] as const;

  return (
    <div className="flex items-center w-fit max-w-[98vw] mx-auto overflow-x-auto no-scrollbar bg-white/80 p-1.5 rounded-full shadow-sm mt-6 mb-4 relative border border-stone-200/60 backdrop-blur-md z-50 transition-all px-2">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "tree" || tab.id === "mindmap") {
                setView(tab.id as any);
                setRootId(ROOT_ID);
                return;
              }
              setView(tab.id as any);
            }}
            className={`relative flex-shrink-0 px-4 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-colors z-10 flex items-center gap-2 ${isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-800"}`}
          >
            {isActive && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-full shadow-sm border border-stone-200/60 z-[-1]" />}
            <span className={isActive ? "text-amber-700" : "text-stone-400"}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* NÚT PRINT A0 Ở CUỐI CÙNG */}
      {isAdmin && (
        <button
          onClick={() => setView("print_config" as any)}
          className="relative flex-shrink-0 px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full z-10 flex items-center gap-2 border-l border-stone-200 ml-2 text-amber-600 hover:text-amber-800"
        >
          <Printer className="size-4" />
          <span>In gia phả A0</span>
        </button>
      )}
    </div>
  );
}
