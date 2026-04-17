"use client";

import { motion } from "framer-motion";
import {
  List,
  ListTree,
  Network,
  GitBranch,
  BookOpen,
  Filter,
  Users,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";

// Get rootId from environment variable
const ROOT_ID =
  process.env.NEXT_PUBLIC_ROOT_ID || "a4167ee0-df91-4a9c-a7d1-ab4e88ffa4d0";

export type ViewMode =
  | "list"
  | "members_filter"
  | "tree"
  | "mindmap"
  | "branches"
  | "introduction"
  | "notables";

export default function ViewToggle() {
  const { view: currentView, setView, setRootId } = useDashboard();

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
    {
      id: "branches",
      label: "Các chi",
      icon: <GitBranch className="size-4" />,
    },
    {
      id: "notables",
      label: "Danh nhân dòng họ",
      icon: <Users className="size-4" />,
    },
  ] as const;

  return (
    <div className="flex bg-white/80 p-1.5 rounded-full shadow-sm w-fit mx-auto mt-6 mb-4 relative border border-stone-200/60 backdrop-blur-md z-50 transition-all duration-300">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              // When switching to tree or mindmap, set view and rootId directly for faster response
              if (tab.id === "tree") {
                setView("tree");
                setRootId(ROOT_ID);
                return;
              }
              if (tab.id === "mindmap") {
                setView("mindmap");
                setRootId(ROOT_ID);
                return;
              }
              // For other views, use normal setView
              setView(tab.id as ViewMode);
            }}
            className={`relative px-4 sm:px-6 py-1.5 sm:py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 ease-in-out z-10 flex items-center gap-2 ${
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

            <span className="tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
