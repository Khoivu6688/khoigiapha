"use client";

import { motion } from "framer-motion";
import {
  List,
  ListTree,
  Network,
  BookOpen,
  Filter,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";

const ROOT_ID = process.env.NEXT_PUBLIC_ROOT_ID || "a4167ee0-df91-4a9c-a7d1-ab4e88ffa4d0";

export type ViewMode =
  | "list"
  | "members_filter"
  | "tree"
  | "mindmap"
  | "introduction";

export default function ViewToggle() {
  const { view: currentView, setView, setRootId } = useDashboard();

  // ĐÃ LOẠI BỎ: 'branches' và 'notables' theo yêu cầu
  const tabs = [
    {
      id: "introduction",
      label: "Giới thiệu",
      icon: <BookOpen className="size-4" />,
    },
    { id: "list", label: "Danh sách", icon: <List className="size-4" /> },
    {
      id: "members_filter",
      label: "Lọc chi/đời",
      icon: <Filter className="size-4" />,
    },
    { id: "tree", label: "Sơ đồ cây", icon: <Network className="size-4" /> },
    { id: "mindmap", label: "Mindmap", icon: <ListTree className="size-4" /> },
  ] as const;

  return (
    /* SỬA LỖI BÓP VIEW:
       - overflow-x-auto + no-scrollbar: Cho phép vuốt ngang nếu màn hình nhỏ.
       - justify-start sm:justify-center: Mobile bắt đầu từ trái, PC nằm giữa.
       - whitespace-nowrap: Chặn việc chữ bị nhảy xuống dòng.
    */
    <div className="flex items-center w-full max-w-full overflow-x-auto no-scrollbar bg-white/80 p-1 rounded-full shadow-sm mt-4 mb-2 relative border border-stone-200/60 backdrop-blur-md z-50 transition-all justify-start sm:justify-center whitespace-nowrap px-2">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === "tree" || tab.id === "mindmap") {
                setView(tab.id);
                setRootId(ROOT_ID);
                return;
              }
              setView(tab.id as ViewMode);
            }}
            /* flex-shrink-0: QUAN TRỌNG NHẤT - ngăn các nút bị ép méo khi màn hình hẹp.
            */
            className={`relative flex-shrink-0 px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors duration-300 z-10 flex items-center gap-2 ${
              isActive
                ? "text-stone-900"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-full shadow-sm border border-stone-200/60 z-[-1]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}

            <span
              className={`transition-colors duration-300 ${
                isActive ? "text-amber-700" : "text-stone-400"
              }`}
            >
              {tab.icon}
            </span>

            <span className="tracking-tight sm:tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
